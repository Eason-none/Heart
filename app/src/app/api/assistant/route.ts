import { NextRequest } from 'next/server'

type Intent = 'general' | 'personalized' | 'symptom' | 'prescription_specific' | 'out_of_scope'

function hasAny(s: string, words: string[]): boolean {
  return words.some(w => s.includes(w))
}

function classifyIntent(message: string): Intent {
  const msg = message

  const symptomWords = ['胸痛', '胸闷', '心慌', '头晕', '呼吸困难', '晕倒', '心跳', '不舒服', '难受', '不适']
  const safetyContext = ['能运动', '可以运动', '今天', '今日', '这种情况']
  const prescriptionWords = ['走多快', '走多远', '走多久', '多少分钟', '几组', '几次', '配速', '应该走多']
  const personalizedWords = ['适合我', '我每天', '我可以走', '我应该', '我能走']
  const outOfScopeWords = ['支架寿命', '还有多少年', '能活多久', '预后', '存活率']

  if (hasAny(msg, symptomWords) && hasAny(msg, safetyContext)) return 'symptom'
  if (hasAny(msg, prescriptionWords)) return 'prescription_specific'
  if (hasAny(msg, personalizedWords)) return 'personalized'
  if (hasAny(msg, outOfScopeWords)) return 'out_of_scope'
  return 'general'
}

const SYSTEM_PROMPT = `你是"Heart"心脏康复助手，基于《冠心病患者心脏康复健康教育处方护理专家共识》提供健康教育和知识科普服务。

核心规则：
1. 只回答心脏康复相关的12个健康教育主题：运动康复、营养饮食、药物依从、心理健康、危险因素管理、日常生活、急救知识、戒烟、睡眠、疾病知识、社会回归、并发症管理
2. 绝对禁止：药物剂量建议、症状严重程度判断、含具体数字的运动处方（速度/时长/组数）、预后预测、诊断性判断
3. 症状安全相关问题：不做判断，不给结论，统一输出就医建议
4. 超出知识库范围：回复"本模块服务于健康教育和知识科普，不侧重于解答具体问题"
5. 回复语气：温暖、专业、简洁，用通俗中文，不用医学术语堆砌
6. 回复长度：100-200字为宜，不过度展开`

const INTENT_RESPONSES: Record<string, string> = {
  symptom: '你描述的症状需要认真对待。建议今日暂停运动，如症状持续或加重，请及时就医。康复助手无法判断症状的严重程度，医生的评估是最重要的。',
  prescription_specific: '我提供的是健康知识科普，具体处方数字在运动页可以查看。如果想了解运动强度的原理或注意事项，可以继续问我～',
  out_of_scope: '本模块服务于健康教育和知识科普，不侧重于解答具体问题。',
}

export async function POST(req: NextRequest) {
  const { message, history } = await req.json()
  const intent = classifyIntent(message)

  // Fixed responses for certain intents
  if (intent in INTENT_RESPONSES) {
    const text = INTENT_RESPONSES[intent]
    return new Response(text, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Intent': intent,
      },
    })
  }

  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    return new Response(
      '当前服务暂时不可用，请稍后重试。',
      { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Intent': intent } }
    )
  }

  // Build messages
  const msgs = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...(Array.isArray(history) ? history.slice(-6).map((m: { role: string; content: string }) => ({
      role: m.role,
      content: m.content,
    })) : []),
    { role: 'user', content: message },
  ]

  if (intent === 'personalized') {
    msgs[0].content += '\n\n当前意图：用户询问适合自己的范围。回复末尾必须加上：「以上为参考范围，请根据自身感受动态调整，有不适及时就医。」'
  }

  try {
    const resp = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
        messages: msgs,
        stream: true,
        max_tokens: 400,
        temperature: 0.5,
      }),
    })

    if (!resp.ok) throw new Error('API error')

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
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim()
              if (data === '[DONE]') { controller.close(); return }
              try {
                const json = JSON.parse(data)
                const content = json.choices?.[0]?.delta?.content
                if (content) controller.enqueue(encoder.encode(content))
              } catch {}
            }
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
