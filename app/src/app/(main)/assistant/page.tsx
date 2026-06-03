'use client'
import { useState, useRef, useEffect } from 'react'

type Intent = 'general' | 'personalized' | 'symptom' | 'prescription_specific' | 'out_of_scope'

interface Message {
  role: 'user' | 'assistant'
  content: string
  intent?: Intent
  loading?: boolean
}

const SUGGESTED_QUESTIONS = [
  '运动后为什么要记录感受？',
  '心脏病康复为什么要运动？',
  '什么是 RPE？怎么用它控制强度？',
]

const SAFETY_FOOTNOTE = '以上为参考范围，请根据自身感受动态调整，有不适及时就医。'

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: Message = { role: 'user', content: text.trim() }
    const assistantPlaceholder: Message = { role: 'assistant', content: '', loading: true }
    setMessages(prev => [...prev, userMsg, assistantPlaceholder])
    setInput('')
    setLoading(true)

    try {
      const resp = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), history: messages }),
      })

      if (!resp.ok) throw new Error('Request failed')

      const intentHeader = resp.headers.get('X-Intent') as Intent | null
      const reader = resp.body?.getReader()
      if (!reader) throw new Error('No stream')

      const decoder = new TextDecoder()
      let fullText = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        fullText += decoder.decode(value, { stream: true })
        setMessages(prev => {
          const next = [...prev]
          next[next.length - 1] = {
            role: 'assistant',
            content: fullText,
            intent: intentHeader || undefined,
            loading: false,
          }
          return next
        })
      }
    } catch {
      setMessages(prev => {
        const next = [...prev]
        next[next.length - 1] = {
          role: 'assistant',
          content: '抱歉，当前网络不可用，请稍后重试。',
          loading: false,
        }
        return next
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="flex flex-col h-full bg-bg">
      {/* Status bar */}
      <div className="flex-shrink-0 h-11 flex items-center justify-between px-5">
        <span className="text-[15px] font-semibold text-text">9:41</span>
        <div className="flex gap-1.5 text-xs text-text"><span>●●● WiFi 🔋</span></div>
      </div>

      {/* Safety banner */}
      <div className="flex-shrink-0 bg-orange-light border-b border-orange/30 px-4 py-2.5">
        <p className="text-sm text-orange leading-relaxed">
          如出现胸痛、胸闷、心慌、头晕等不适，请立即就医
        </p>
      </div>

      {/* Chat history */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4 space-y-3">
        {messages.length === 0 && (
          <div className="space-y-4 pt-2">
            <p className="text-base font-semibold text-text">你好，我是你的心脏康复助手</p>
            <p className="text-sm text-text-sub leading-relaxed">
              我基于《冠心病患者心脏康复健康教育处方护理专家共识》提供健康教育和知识科普。
              我不做诊断，也不提供具体处方数字。
            </p>
            <div className="space-y-2">
              {SUGGESTED_QUESTIONS.map(q => (
                <button
                  key={q}
                  type="button"
                  onClick={() => sendMessage(q)}
                  className="w-full min-h-[44px] px-4 py-2 bg-card rounded-card border border-border text-left text-sm text-text"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-card px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-card text-text'
                  : 'bg-white border border-border text-text'
              }`}
            >
              {msg.loading ? (
                <p className="text-sm text-text-sub">✦ 思考中…</p>
              ) : (
                <>
                  <p className="text-base leading-relaxed">{msg.content}</p>
                  {msg.intent === 'personalized' && (
                    <p className="text-xs text-text-sub mt-2 pt-2 border-t border-border">
                      {SAFETY_FOOTNOTE}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 bg-bg border-t border-border px-4 pt-3 pb-6">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="向助手提问…"
            rows={1}
            className="flex-1 min-h-[44px] max-h-28 px-4 py-3 bg-card rounded-btn border border-border text-base text-text resize-none outline-none focus:border-blue transition-colors leading-relaxed"
            style={{ fieldSizing: 'content' } as React.CSSProperties}
          />
          <button
            type="button"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className={`flex-shrink-0 w-11 h-11 rounded-btn flex items-center justify-center transition-colors ${
              input.trim() && !loading ? 'bg-blue' : 'bg-border cursor-not-allowed'
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
