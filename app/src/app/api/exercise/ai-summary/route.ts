import { NextRequest } from 'next/server'
import { RPE_LABELS } from '@/lib/exercise/intensity'
import { getExerciseTypeLabel } from '@/lib/exercise/prescription'
import type { RPELevel, ExerciseType } from '@/types'

export async function POST(req: NextRequest) {
  const { exercise_type, duration, rpe_actual, day_state, total_sessions } = await req.json()

  const rpeLabel = rpe_actual ? RPE_LABELS[rpe_actual as RPELevel].label : '适中'
  const exLabel = getExerciseTypeLabel(exercise_type as ExerciseType)

  const prompt = `你是一个心脏康复助手。用户刚完成了一次运动，请给出2-3句简短、温暖的中文鼓励文案。

运动信息：
- 运动类型：${exLabel}
- 时长：${duration} 分钟
- 强度感受：${rpeLabel}
- 今日状态：${day_state === 'bad' ? '状态不佳（差状态日）' : day_state === 'normal' ? '一般' : '良好'}
- 累计第 ${total_sessions} 次运动

要求：
1. 直接输出鼓励文字，不要称呼，不要「你好」
2. 结合运动强度给出简短评价
3. 如果是差状态日，特别表扬坚持运动的意志
4. 语气温暖、简洁，不超过60字
5. 不要包含具体医疗建议或数字处方`

  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    return new Response(
      '今日运动记录已保存，继续保持这个节奏！',
      { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    )
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
        messages: [{ role: 'user', content: prompt }],
        stream: true,
        max_tokens: 150,
        temperature: 0.7,
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
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Content-Type-Options': 'nosniff' },
    })
  } catch {
    return new Response(
      '今日运动记录已保存。',
      { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    )
  }
}
