/**
 * 知识库 ingestion 脚本
 * 读取 article/ 目录下所有 .md 和 .pdf 文件，
 * 切块 → 调 bge-m3 embedding → 写入 Supabase knowledge_chunks 表
 *
 * 运行方式（从 app/ 目录执行）：
 *   npx tsx scripts/ingest-knowledge.ts
 *
 * 需要 .env.local 中配置：
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   ← Supabase 项目设置 → API → service_role key
 *   EMBEDDING_API_KEY            ← 硅基流动 API key
 */

import { createClient } from '@supabase/supabase-js'
import { ProxyAgent, setGlobalDispatcher } from 'undici'
import * as fs from 'fs'
import * as path from 'path'

// 独立脚本运行时 Next.js 不会自动注入 .env.local，这里手动加载
try {
  process.loadEnvFile(path.resolve(__dirname, '../.env.local'))
} catch {
  // 文件不存在则跳过，交给下面的环境变量检查统一报错
}

// Node.js 原生 fetch 不认 HTTPS_PROXY 环境变量，需要显式配置
if (process.env.HTTPS_PROXY) {
  setGlobalDispatcher(new ProxyAgent(process.env.HTTPS_PROXY))
  console.log(`使用代理: ${process.env.HTTPS_PROXY}`)
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse') as (
  buf: Buffer,
  options?: Record<string, unknown>
) => Promise<{ text: string; numpages: number; info: unknown }>

const ARTICLE_DIR = path.resolve(__dirname, '../../article')
const EMBEDDING_URL = 'https://api.siliconflow.cn/v1/embeddings'
const EMBEDDING_MODEL = 'BAAI/bge-m3'
const CHUNK_TARGET = 600   // 目标 chunk 字符数
const RATE_LIMIT_MS = 300  // 两次 API 调用之间的间隔，防止触发限速

// ─── 类型 ─────────────────────────────────────────────────────────────────────

interface Chunk {
  source: string
  section_title: string | null
  content: string
}

// ─── Embedding ────────────────────────────────────────────────────────────────

async function embed(text: string): Promise<number[]> {
  const res = await fetch(EMBEDDING_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.EMBEDDING_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text.slice(0, 2000), // bge-m3 建议单次输入不超过 2000 字符
      encoding_format: 'float',
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Embedding API 错误 ${res.status}: ${err}`)
  }
  const data = await res.json() as { data: Array<{ embedding: number[] }> }
  return data.data[0].embedding
}

// ─── 切块：Markdown ───────────────────────────────────────────────────────────

function chunkMarkdown(filename: string, text: string): Chunk[] {
  const chunks: Chunk[] = []
  // 按 ## 或 # 标题拆分
  const sections = text.split(/\n(?=#{1,3}\s)/)

  for (const section of sections) {
    if (!section.trim()) continue
    const lines = section.trim().split('\n')
    const titleLine = lines[0].replace(/^#+\s*/, '').trim()
    const body = lines.slice(1).join('\n').trim()

    if (!body || body.length < 30) continue

    // 如果 section 超过目标长度，按段落进一步拆分
    if (body.length > CHUNK_TARGET * 1.5) {
      const paras = body.split(/\n\n+/)
      let buf = ''
      for (const para of paras) {
        const p = para.trim()
        if (!p) continue
        if (buf.length + p.length > CHUNK_TARGET && buf.length > 100) {
          chunks.push({ source: filename, section_title: titleLine, content: buf.trim() })
          buf = p
        } else {
          buf = buf ? `${buf}\n\n${p}` : p
        }
      }
      if (buf.trim().length > 30) {
        chunks.push({ source: filename, section_title: titleLine, content: buf.trim() })
      }
    } else {
      // 将标题拼入内容，让 embedding 知道这段属于哪个主题
      const content = titleLine ? `${titleLine}\n\n${body}` : body
      chunks.push({ source: filename, section_title: titleLine || null, content })
    }
  }

  return chunks
}

// ─── 切块：PDF 纯文本 ──────────────────────────────────────────────────────────

function chunkPdfText(filename: string, rawText: string): Chunk[] {
  // 清理常见 PDF 提取噪音
  const text = rawText
    .replace(/·\s*\d+\s*·/g, '')           // 页码如 "· 150 ·"
    .replace(/\d{4}年\d{1,2}月第\d+卷第\d+期/g, '') // 期刊页眉
    .replace(/Chin J[^\n]*/g, '')           // 英文页眉
    .replace(/DOI:[^\n]*/g, '')             // DOI 行
    .replace(/引用本文[^\n]*/g, '')          // 引用行
    .replace(/\f/g, '\n\n')                 // 换页符 → 空行
    .replace(/\n{3,}/g, '\n\n')             // 多余空行压缩
    .trim()

  const chunks: Chunk[] = []
  const paras = text.split(/\n\n+/)

  let buf = ''
  let currentTitle: string | null = null

  for (const para of paras) {
    const p = para.trim().replace(/\n+/g, ' ')
    if (!p || p.length < 5) continue

    // 简单标题识别：短行、不以句号结尾、以中文数字/序号/大写字母开头
    const looksLikeHeading =
      p.length < 60 &&
      !p.endsWith('。') &&
      !p.endsWith('；') &&
      /^[（(一二三四五六七八九十百\d①②③④⑤一-龥]{0,3}[.、\s]/.test(p)

    if (looksLikeHeading) {
      // 先把 buf 里积累的内容存起来
      if (buf.trim().length > 50) {
        chunks.push({ source: filename, section_title: currentTitle, content: buf.trim() })
        buf = ''
      }
      currentTitle = p
      // 标题本身也加入 buf，让它出现在下一个 chunk 的开头
      buf = p
      continue
    }

    if (buf.length + p.length > CHUNK_TARGET && buf.length > 100) {
      chunks.push({ source: filename, section_title: currentTitle, content: buf.trim() })
      buf = p
    } else {
      buf = buf ? `${buf}\n${p}` : p
    }
  }

  if (buf.trim().length > 50) {
    chunks.push({ source: filename, section_title: currentTitle, content: buf.trim() })
  }

  return chunks
}

// ─── 文件处理 ──────────────────────────────────────────────────────────────────

async function processFile(filepath: string): Promise<Chunk[]> {
  const filename = path.basename(filepath)
  const ext = path.extname(filepath).toLowerCase()

  if (ext === '.md') {
    const text = fs.readFileSync(filepath, 'utf-8')
    return chunkMarkdown(filename, text)
  }

  if (ext === '.pdf') {
    const buffer = fs.readFileSync(filepath)
    const data = await pdfParse(buffer)
    return chunkPdfText(filename, data.text)
  }

  return []
}

// ─── 主流程 ────────────────────────────────────────────────────────────────────

async function main() {
  // 检查环境变量
  const required = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'EMBEDDING_API_KEY']
  for (const key of required) {
    if (!process.env[key]) {
      console.error(`✗ 缺少环境变量：${key}`)
      process.exit(1)
    }
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  // 清空旧数据（重新跑脚本时用，失败则跳过）
  console.log('清除旧 chunk 数据...')
  const { error: delErr } = await supabase
    .from('knowledge_chunks')
    .delete()
    .gt('created_at', '2000-01-01')
  if (delErr) {
    console.warn('⚠ 清除跳过（表可能是空的）：', delErr.message)
  } else {
    console.log('旧数据已清除')
  }

  // 找到所有文件
  const files = fs.readdirSync(ARTICLE_DIR)
    .filter(f => ['.md', '.pdf'].includes(path.extname(f).toLowerCase()))
    .map(f => path.join(ARTICLE_DIR, f))

  console.log(`找到 ${files.length} 个文件，开始处理...\n`)

  let totalChunks = 0
  let totalErrors = 0

  for (const filepath of files) {
    const filename = path.basename(filepath)
    console.log(`📄 ${filename}`)

    let chunks: Chunk[] = []
    try {
      chunks = await processFile(filepath)
      console.log(`   切块：${chunks.length} 个`)
    } catch (err) {
      console.error(`   ✗ 读取失败：${err}`)
      totalErrors++
      continue
    }

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      try {
        const embedding = await embed(chunk.content)

        const { error } = await supabase.from('knowledge_chunks').insert({
          source: chunk.source,
          section_title: chunk.section_title,
          content: chunk.content,
          embedding,
        })

        if (error) throw error

        process.stdout.write(`\r   写入：${i + 1}/${chunks.length}`)

        await new Promise(r => setTimeout(r, RATE_LIMIT_MS))
      } catch (err) {
        const msg = err instanceof Error
          ? err.message
          : typeof err === 'object' ? JSON.stringify(err) : String(err)
        console.error(`\n   ✗ chunk ${i + 1} 失败：${msg}`)
        totalErrors++
      }
    }

    totalChunks += chunks.length
    console.log(`\r   ✓ ${chunks.length} 个 chunk 完成`)
  }

  console.log(`\n${'─'.repeat(40)}`)
  console.log(`✓ 完成！共处理 ${totalChunks} 个 chunk，失败 ${totalErrors} 个`)
}

main().catch(err => { console.error(err); process.exit(1) })
