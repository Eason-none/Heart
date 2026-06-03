'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { SCIENCE_CARDS } from '@/lib/content/science-cards'
import type { ScienceCard, ContentTopic } from '@/types'

const TOPIC_LABELS: Record<ContentTopic, string> = {
  exercise_knowledge: '运动知识',
  disease_knowledge: '疾病知识',
  nutrition: '营养饮食',
  mental_health: '心理健康',
  daily_life: '日常生活',
  emergency: '急救知识',
  social_return: '回归社会',
  smoking_cessation: '戒烟',
}

const ALL_TOPICS: ContentTopic[] = [
  'exercise_knowledge', 'disease_knowledge', 'nutrition',
  'mental_health', 'daily_life', 'emergency',
]

function ScienceCardWidget({ card }: { card: ScienceCard }) {
  const [expanded, setExpanded] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<ContentTopic | null>(null)

  const randomTopics: ContentTopic[] = ALL_TOPICS
    .filter(t => t !== card.topic)
    .sort(() => 0.5 - Math.random())
    .slice(0, 4)

  return (
    <div className="bg-card rounded-card p-4">
      <div className="mb-2">
        <span className="inline-block px-2.5 py-0.5 rounded-pill bg-blue text-white text-xs font-medium">
          {TOPIC_LABELS[card.topic]}
        </span>
      </div>
      <h2 className="text-lg font-bold text-text mb-2 leading-tight">{card.title}</h2>
      <div
        className="text-base text-text leading-relaxed overflow-hidden"
        style={expanded ? {} : { display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}
      >
        {card.body}
      </div>
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        className="min-h-[44px] text-blue text-base mt-1"
      >
        {expanded ? '收起 ↑' : '展开 ↓'}
      </button>

      {!selectedTopic && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-sm text-text-sub mb-2">你对哪个话题感兴趣？</p>
          <div className="flex flex-wrap gap-2">
            {randomTopics.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedTopic(t)}
                className="min-h-[36px] px-3 rounded-pill bg-bg border border-border text-sm text-text"
              >
                {TOPIC_LABELS[t]}
              </button>
            ))}
          </div>
        </div>
      )}
      {selectedTopic && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-sm text-blue">已记录偏好：{TOPIC_LABELS[selectedTopic]}</p>
        </div>
      )}
    </div>
  )
}

export default function HomePage() {
  const [assessmentDone, setAssessmentDone] = useState(false)
  const [followupOverdue] = useState(false)
  const [card, setCard] = useState<ScienceCard>(SCIENCE_CARDS[0])

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem('assessment_answers') || '{}')
      setAssessmentDone(!!data.risk_level)
      const idx = new Date().getDate() % SCIENCE_CARDS.length
      setCard(SCIENCE_CARDS[idx])
    } catch {}
  }, [])

  const today = new Date()
  const dayOfWeek = today.getDay()
  const exerciseDays = [1, 3, 5]
  const todayIsExercise = exerciseDays.includes(dayOfWeek)
  const nextExerciseDay = exerciseDays.find(d => d > dayOfWeek)
  const nextLabel = nextExerciseDay !== undefined
    ? `本周${'日一二三四五六'[nextExerciseDay]}`
    : '下周一'

  return (
    <div className="flex flex-col h-full bg-bg">
      <div className="flex-shrink-0 h-11 flex items-center justify-between px-5">
        <span className="text-[15px] font-semibold text-text">9:41</span>
        <div className="flex gap-1.5 text-xs text-text"><span>●●● WiFi 🔋</span></div>
      </div>

      {!assessmentDone && (
        <Link
          href="/assessment"
          className="flex-shrink-0 h-11 flex items-center px-4 bg-orange-light border-l-4 border-orange text-sm font-medium text-orange"
        >
          首次评估未完成 · 点击继续填写 →
        </Link>
      )}

      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-4 space-y-3">
        <ScienceCardWidget card={card} />

        {todayIsExercise ? (
          <div className="bg-card rounded-card p-4">
            <p className="text-sm text-text-sub mb-1">今日运动</p>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-text">步行训练</p>
                <p className="text-sm text-text-sub">约 25–35 分钟 · 适中强度</p>
              </div>
              <Link
                href="/exercise"
                className="flex-shrink-0 min-h-[44px] px-5 bg-blue text-white rounded-btn flex items-center font-medium text-sm"
              >
                去运动 →
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-card p-4">
            <p className="text-sm text-text-sub mb-0.5">今日</p>
            <p className="text-base text-text">
              下次运动：<span className="font-semibold text-blue">{nextLabel}</span>
            </p>
            <p className="text-sm text-text-sub mt-1">今天是恢复日，保持日常活动量即可。</p>
          </div>
        )}

        {followupOverdue && (
          <Link
            href="/followup"
            className="flex items-center min-h-[56px] px-4 bg-orange-light border-l-4 border-orange rounded-card"
          >
            <span className="text-base text-text flex-1">本周随访未完成，点击开始 →</span>
          </Link>
        )}

        <div className="px-1 pb-2">
          <p className="text-sm text-text-sub leading-relaxed">
            如出现胸痛、胸闷、心慌、头晕等不适，请立即停止活动并就医
          </p>
        </div>
      </div>
    </div>
  )
}
