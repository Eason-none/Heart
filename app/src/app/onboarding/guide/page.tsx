'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'

const CARDS_LOW_MEDIUM = [
  {
    icon: '🏃',
    title: '每次运动前先 Check-in',
    desc: '打开运动页，先完成症状筛查和状态评估，再查看今日处方。这一步保护你的安全，不要跳过。',
    color: 'bg-blue-light',
  },
  {
    icon: '📊',
    title: '用 RPE 感受强度',
    desc: '不需要心率手环。"适中"强度就是能说话但不能唱歌——这是你的目标区间，系统会帮你追踪。',
    color: 'bg-green-light',
  },
  {
    icon: '📝',
    title: '运动后记录反馈',
    desc: '每次运动结束后记录 RPE 和感受。系统会根据数据自动调整下次处方强度，越用越准确。',
    color: 'bg-card',
  },
  {
    icon: '💬',
    title: '有疑问问助手',
    desc: '康复助手基于循证知识库，可以回答你的心脏康复问题。有症状疑虑时，助手会建议你就医。',
    color: 'bg-card',
  },
]

const CARDS_HIGH = [
  {
    icon: '🥗',
    title: '从营养开始',
    desc: '心脏友好饮食是康复基础。营养页有超市选购指南和中式替代食材表，实用又接地气。',
    color: 'bg-green-light',
  },
  {
    icon: '💬',
    title: '向助手提问',
    desc: '康复助手基于专业知识库，随时回答你的问题。它不做诊断，但会给你清晰的行动建议。',
    color: 'bg-blue-light',
  },
  {
    icon: '📚',
    title: '每日科普卡片',
    desc: '首页每天推送一张循证科普卡，涵盖运动、营养、心理、急救知识，帮你建立康复认知。',
    color: 'bg-card',
  },
]

export default function GuidePage() {
  const router = useRouter()
  const [index, setIndex] = useState(0)

  // Check risk from localStorage
  let isHigh = false
  if (typeof window !== 'undefined') {
    try {
      const data = JSON.parse(localStorage.getItem('assessment_answers') || '{}')
      isHigh = data.risk_level === 'high'
    } catch {}
  }

  const cards = isHigh ? CARDS_HIGH : CARDS_LOW_MEDIUM
  const card = cards[index]
  const isLast = index === cards.length - 1

  return (
    <div className="phone-shell">
      <div className="flex-shrink-0 h-11 flex items-center justify-between px-5">
        <span className="text-[15px] font-semibold text-text">9:41</span>
      </div>

      <div className="flex-1 flex flex-col px-4 pt-4 pb-8">
        {/* Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {cards.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-6 bg-blue' : 'w-1.5 bg-border'
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div className={`${card.color} rounded-card p-6 flex-1 flex flex-col justify-center mb-8`}>
          <div className="text-5xl mb-5">{card.icon}</div>
          <h2 className="text-xl font-bold text-text mb-3 leading-tight">{card.title}</h2>
          <p className="text-base text-text leading-relaxed">{card.desc}</p>
        </div>

        {/* Navigation */}
        <div className="flex flex-col gap-3">
          {isLast ? (
            <Button onClick={() => router.push('/home')}>开始使用 Heart</Button>
          ) : (
            <Button onClick={() => setIndex(i => i + 1)}>下一条</Button>
          )}
          <button
            type="button"
            onClick={() => router.push('/home')}
            className="min-h-[44px] text-text-sub text-sm"
          >
            跳过引导
          </button>
        </div>
      </div>
    </div>
  )
}
