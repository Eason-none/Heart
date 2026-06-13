/**
 * 快速诊断：分别测试 embedding API 和 Supabase 写入
 * npx tsx --env-file=.env.local scripts/test-rag.ts
 */
import { createClient } from '@supabase/supabase-js'

async function main() {
  // ── 1. 测试 embedding API ──────────────────────────────────────────────────
  console.log('1. 测试 embedding API...')
  try {
    const res = await fetch('https://api.siliconflow.cn/v1/embeddings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.EMBEDDING_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'BAAI/bge-m3',
        input: '心脏康复运动处方',
        encoding_format: 'float',
      }),
    })
    const body = await res.json() as Record<string, unknown>
    if (!res.ok) {
      console.error('   ✗ API 返回错误:', res.status, JSON.stringify(body))
    } else {
      const vec = (body.data as Array<{ embedding: number[] }>)[0].embedding
      console.log(`   ✓ 成功，向量维度: ${vec.length}，前3维: [${vec.slice(0,3).map(v => v.toFixed(4)).join(', ')}]`)
    }
  } catch (err) {
    console.error('   ✗ 网络错误:', err)
  }

  // ── 2. 测试 Supabase 连接 ──────────────────────────────────────────────────
  console.log('\n2. 测试 Supabase 连接...')
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    const { count, error } = await supabase
      .from('knowledge_chunks')
      .select('*', { count: 'exact', head: true })
    if (error) {
      console.error('   ✗ 查询失败:', error.message)
    } else {
      console.log(`   ✓ 连接成功，当前 chunk 数: ${count}`)
    }
  } catch (err) {
    console.error('   ✗ 网络错误:', err)
  }

  // ── 3. 测试写入一条记录 ────────────────────────────────────────────────────
  console.log('\n3. 测试写入...')
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    // 写一个假向量（1024个0）
    const fakeEmbedding = new Array(1024).fill(0)
    const { error } = await supabase.from('knowledge_chunks').insert({
      source: '_test',
      section_title: 'test',
      content: '测试写入',
      embedding: fakeEmbedding,
    })
    if (error) {
      console.error('   ✗ 写入失败:', error.message)
    } else {
      console.log('   ✓ 写入成功')
      // 清掉测试数据
      await supabase.from('knowledge_chunks').delete().eq('source', '_test')
      console.log('   ✓ 测试数据已清除')
    }
  } catch (err) {
    console.error('   ✗ 网络错误:', err)
  }
}

main().catch(console.error)
