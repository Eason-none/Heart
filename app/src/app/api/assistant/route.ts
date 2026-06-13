import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

type Intent = 'general' | 'personalized' | 'symptom' | 'prescription_specific' | 'nutrition' | 'out_of_scope'

// ─── AI 参数常量 ───────────────────────────────────────────────────────────────

const ASSISTANT_MAX_TOKENS = 700
const ASSISTANT_TEMPERATURE = 0.4
const HISTORY_WINDOW = 6       // 保留最近 N 条对话历史
const RAG_MATCH_THRESHOLD = 0.4
const RAG_MATCH_COUNT = 3
const EMBEDDING_TRUNCATE = 500 // embedding 输入最大字符数

// ─── 意图分类 ──────────────────────────────────────────────────────────────────

function hasAny(s: string, words: string[]): boolean {
  return words.some(w => s.includes(w))
}

function classifyIntent(message: string): Intent {
  const symptomWords = ['胸痛', '胸闷', '心慌', '头晕', '呼吸困难', '晕倒', '心跳', '不舒服', '难受', '不适', '胸口', '心悸']
  const prescriptionWords = ['走多快', '走多远', '走多久', '多少分钟', '几组', '几次', '配速', '应该走多', '具体怎么走']
  const nutritionWords = [
    '吃什么', '能吃', '不能吃', '适合吃', '可以吃', '好不好吃', '该吃',
    '饮食', '营养', '食物', '食材', '食谱', '主食', '蔬菜', '水果', '肉类',
    '豆腐', '盐', '钠', '脂肪', '碳水', '蛋白质', '早餐', '午饭', '晚饭',
    '零食', '饮料', '方法①', '方法②', '方法③',
  ]
  const personalizedWords = ['适合我', '我每天', '我可以走', '我应该', '我能走', '我能做', '我适合']
  const outOfScopeWords = ['支架寿命', '还有多少年', '能活多久', '预后', '存活率', '多少钱', '挂号', '哪个医院']

  if (hasAny(message, symptomWords)) return 'symptom'
  if (hasAny(message, prescriptionWords)) return 'prescription_specific'
  if (hasAny(message, nutritionWords)) return 'nutrition'
  if (hasAny(message, personalizedWords)) return 'personalized'
  if (hasAny(message, outOfScopeWords)) return 'out_of_scope'
  return 'general'
}

// ─── Embedding（硅基流动 bge-m3）─────────────────────────────────────────────

async function embedQuery(text: string): Promise<number[] | null> {
  const apiKey = process.env.EMBEDDING_API_KEY
  if (!apiKey) return null

  try {
    const res = await fetch('https://api.siliconflow.cn/v1/embeddings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'BAAI/bge-m3',
        input: text.slice(0, EMBEDDING_TRUNCATE),
        encoding_format: 'float',
      }),
    })
    if (!res.ok) return null
    const data = await res.json() as { data: Array<{ embedding: number[] }> }
    return data.data[0]?.embedding ?? null
  } catch {
    return null
  }
}

// ─── RAG 检索 ──────────────────────────────────────────────────────────────────

interface KnowledgeChunk {
  source: string
  section_title: string | null
  content: string
  similarity: number
}

async function retrieveContext(embedding: number[]): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) return ''

  const supabase = createClient(supabaseUrl, serviceKey)

  const { data, error } = await supabase.rpc('match_knowledge_chunks', {
    query_embedding: embedding,
    match_threshold: RAG_MATCH_THRESHOLD,
    match_count: RAG_MATCH_COUNT,
  })

  if (error || !data || data.length === 0) return ''

  return (data as KnowledgeChunk[])
    .map(chunk => {
      const label = chunk.section_title
        ? `${chunk.source} · ${chunk.section_title}`
        : chunk.source
      return `【参考文献：${label}】\n${chunk.content}`
    })
    .join('\n\n───\n\n')
}

// ─── 固定回复（无需 LLM）──────────────────────────────────────────────────────

const FIXED_RESPONSES: Partial<Record<Intent, string>> = {
  symptom:
    '你描述的情况需要认真对待，建议及时就医确认。康复助手无法评判症状的严重程度，医生的评估是最重要的。',
  prescription_specific:
    '我提供的是健康知识科普，具体处方数字在运动页可以查看。如果想了解运动强度的原理或注意事项，可以继续问我～',
  out_of_scope:
    '本模块服务于健康教育和知识科普，不侧重于解答具体问题。',
}

// ─── 营养上下文（intent === 'nutrition' 时注入）──────────────────────────────

const COMORBIDITY_NUTRITION_NOTES: Record<string, string> = {
  hypertension: '高血压：重点关注方法③，1勺生抽≈1000mg钠，腌制品/外卖是隐性盐主要来源，减钠可使收缩压降低约5mmHg',
  diabetes: '糖尿病：重点关注方法①，精制碳水（白粥/白米饭/含糖饮料）驱动餐后血糖峰值；进食顺序"先蔬菜→再肉→后主食"可降低血糖峰值',
  hyperlipidemia: '高血脂：重点关注方法②，饱和脂肪和反式脂肪升高LDL-C；方法①的精制碳水也是甘油三酯升高的重要驱动',
  hyperuricemia: '高尿酸：方法③中的含糖饮料（果糖→尿酸）需严格控制；方法②中优选低嘌呤鱼种（鲈鱼/草鱼/鲫鱼），避免沙丁鱼/秋刀鱼；避免浓汤和火锅汤底',
}

function buildNutritionSection(comorbidities?: string[]): string {
  const relevantNotes = (comorbidities ?? [])
    .filter(c => COMORBIDITY_NUTRITION_NOTES[c])
    .map(c => `  - ${COMORBIDITY_NUTRITION_NOTES[c]}`)
    .join('\n')

  return `\n\n【营养判断框架】本产品用三个方法帮患者自主评估食物——
方法①：碳水/蛋白质比例——警惕"清淡陷阱"（白粥+咸菜=高碳水+低蛋白），每餐需有蛋白质（鱼/蛋/豆腐/去皮禽肉）
方法②：脂肪来源——推荐鱼/坚果/植物油；避免油炸/起酥/氢化植物油（配料表含"起酥油""植脂末"即回避）
方法③："清淡"≠"低钠"——1勺生抽≈1000mg钠；腐乳/榨菜/腌制品/外卖是隐性盐主要来源；含糖饮料同时升血糖和尿酸
回答时请使用以上框架语言，引导用户"用方法判断"，而非直接给出食物清单。${relevantNotes ? `\n\n用户合并症注意事项：\n${relevantNotes}` : ''}\n───`
}

// ─── 构建 System Prompt ────────────────────────────────────────────────────────

function buildSystemPrompt(context: string, riskLevel?: string, comorbidities?: string[], intent?: Intent, cardContext?: string): string {
  const cardSection = cardContext
    ? `\n\n${cardContext}\n请基于上述卡片内容回答用户的问题，可以扩展解释但不要超出心脏康复范畴。\n\n───\n`
    : ''
  const contextSection = context
    ? `\n\n以下是从知识库检索到的相关参考内容，请优先基于这些内容回答，不要超出其范围：\n\n${context}\n\n───\n`
    : ''

  const nutritionSection = intent === 'nutrition' ? buildNutritionSection(comorbidities) : ''

  const riskNote =
    riskLevel === 'high'
      ? '\n\n【重要】当前用户危险分层需要医生许可才能开始运动。如果用户询问运动相关问题，输出：「您目前的情况建议在医生明确允许并有专业监护的前提下再开始康复运动。」'
      : ''

  return `你是"Heart"心脏康复助手，基于《冠心病患者心脏康复健康教育处方护理专家共识》及相关心脏康复指南提供健康教育和知识科普服务。${cardSection}${contextSection}${nutritionSection}${riskNote}

核心规则：
1. 只回答心脏康复相关的12个健康教育主题：运动康复、营养饮食、药物依从、心理健康、危险因素管理、日常生活、急救知识、戒烟、睡眠、疾病知识、社会回归、并发症管理
2. 绝对禁止：药物剂量建议、症状严重程度判断、含具体数字的运动处方（速度/时长/组数）、预后预测、诊断性判断
3. 回复语气：温暖、专业、简洁，用通俗中文，不用医学术语堆砌
4. 用户大多没有医学背景，理解能力层次不齐：遇到专业名词要用大白话解释清楚（例如不要直接说"LVEF"，而说"心脏每次跳动能泵出多少血的指标"），多用生活化的类比和具体的例子，避免一句话塞太多信息
5. 回复长度：100-200字为宜，请在该范围内说完整一段话再结束，不要让句子停在中途`
}

// ─── 主处理函数 ────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { message, history, riskLevel, comorbidities, cardContext } = await req.json() as {
    message: string
    history: Array<{ role: string; content: string }>
    riskLevel?: string
    comorbidities?: string[]
    cardContext?: string
  }

  const intent = classifyIntent(message)

  // 固定回复意图：直接返回，不走 RAG 和 LLM
  if (intent in FIXED_RESPONSES) {
    return new Response(FIXED_RESPONSES[intent], {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Intent': intent,
      },
    })
  }

  // 多轮追问升级：history 中已有 prescription_specific 回复，直接终止
  const hasPriorPrescriptionResponse = (history || []).some(
    (m: { role: string; content: string }) =>
      m.role === 'assistant' &&
      m.content.includes('运动页可以查看')
  )
  if (hasPriorPrescriptionResponse && hasAny(message, ['具体', '数字', '多少', '几分钟', '几次'])) {
    return new Response('您的具体计划在运动页面可以查看。', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Intent': 'prescription_specific' },
    })
  }

  // ── RAG 检索 ────────────────────────────────────────────────────────────────
  let context = ''
  const embedding = await embedQuery(message)
  if (embedding) {
    context = await retrieveContext(embedding)
  }

  // ── 构建请求 ─────────────────────────────────────────────────────────────────
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    return new Response(
      context
        ? `根据心脏康复知识库：\n\n${context.split('───')[0].slice(0, 300)}...`
        : '当前服务暂时不可用，请稍后重试。',
      { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Intent': intent } }
    )
  }

  const systemPrompt = buildSystemPrompt(context, riskLevel, comorbidities, intent, cardContext)

  const msgs = [
    { role: 'system', content: systemPrompt },
    ...(Array.isArray(history)
      ? history.slice(-HISTORY_WINDOW).map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        }))
      : []),
    { role: 'user', content: message },
  ]

  // ── 调用 DeepSeek（流式）──────────────────────────────────────────────────────
  try {
    const resp = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
        messages: msgs,
        stream: true,
        max_tokens: ASSISTANT_MAX_TOKENS,
        temperature: ASSISTANT_TEMPERATURE,
      }),
    })

    if (!resp.ok) throw new Error('DeepSeek API error')

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const reader = resp.body!.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6).trim()
            if (data === '[DONE]') { controller.close(); return }
            try {
              const json = JSON.parse(data)
              const content = json.choices?.[0]?.delta?.content
              if (content) controller.enqueue(encoder.encode(content))
            } catch { /* ignore parse errors */ }
          }
        }
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Intent': intent,
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return new Response(
      '当前网络不可用，请稍后重试。',
      { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Intent': intent } }
    )
  }
}
