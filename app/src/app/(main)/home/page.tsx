'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { KNOWLEDGE_CARDS, KM_SECTIONS, getSequentialCard } from '@/lib/content/knowledge-map'
import { generateWeeklyPlan } from '@/lib/exercise/prescription'
import { RPE_LABELS } from '@/lib/exercise/intensity'
import { pickPrimaryExercise, buildMatchProfile } from '@/lib/exercise/matching'
import type { KnowledgeCard, ContentPhase, ContentAudience, RPELevel, ExerciseType, DiagnosisType } from '@/types'

const SECTION_LABELS: Record<string, string> = Object.fromEntries(
  KM_SECTIONS.map(s => [s.id, s.label])
)

function KnowledgeCardWidget({ card }: { card: KnowledgeCard }) {
  const [expanded, setExpanded] = useState(false)
  const router = useRouter()

  const handleAskAssistant = () => {
    try {
      localStorage.setItem('assistant_card_context', JSON.stringify({
        id: card.id,
        title: card.title,
        body: card.body,
      }))
    } catch {}
    router.push('/assistant')
  }

  return (
    <div className="bg-card rounded-card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="inline-block px-2.5 py-0.5 rounded-pill bg-blue text-white text-xs font-medium">
          {SECTION_LABELS[card.section] ?? card.section}
        </span>
        <span className="text-xs text-text-sub">今日学习</span>
      </div>
      <h2 className="text-lg font-bold text-text mb-2 leading-tight">{card.title}</h2>
      <div
        className="text-base text-text leading-relaxed"
        style={expanded ? {} : { display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}
      >
        {card.body}
      </div>
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        className="min-h-[44px] text-blue text-base mt-1"
      >
        {expanded ? '收起 ↑' : '展开阅读 ↓'}
      </button>

      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleAskAssistant}
          className="text-sm text-blue"
        >
          有疑问？问助手 →
        </button>
        <Link href="/learn" className="text-sm text-text-sub">
          查看全部内容 →
        </Link>
      </div>
    </div>
  )
}

interface TodayPlan {
  exerciseType: ExerciseType
  exerciseName: string        // resolved from library, e.g. "步行" or "坐姿腿抬伸"
  isRest: boolean
  durationMinutes: number
  rpeTarget: RPELevel
  nextExerciseLabel: string
}

export default function HomePage() {
  const [assessmentDone, setAssessmentDone] = useState(false)
  const [followupOverdue, setFollowupOverdue] = useState(false)
  const [card, setCard] = useState<KnowledgeCard>(KNOWLEDGE_CARDS[0])
  const [todayExerciseDone, setTodayExerciseDone] = useState(false)
  const [todayPlan, setTodayPlan] = useState<TodayPlan | null>(null)

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem('assessment_answers') || '{}')
      setAssessmentDone(!!data.risk_level)

      // Sequential card push: phase + audience aware, daily rotation
      const phase: ContentPhase = (data.rehab_phase as ContentPhase) || 'adaptation'
      const audienceTags: ContentAudience[] = Array.isArray(data.comorbidities)
        ? (data.comorbidities as ContentAudience[])
        : []
      const isSmoker = data.smoking_status === 'smoker'

      const today = new Date().toISOString().slice(0, 10)
      const cardState = JSON.parse(localStorage.getItem('learn_card_state') || '{}')

      let todayCard: KnowledgeCard
      if (cardState.current_card_date === today && cardState.current_card_id) {
        todayCard = KNOWLEDGE_CARDS.find(c => c.id === cardState.current_card_id) ??
          getSequentialCard({ phase, audienceTags, isSmoker, shownIds: cardState.shown_card_ids ?? [] })
      } else {
        const shownIds: string[] = cardState.shown_card_ids ?? []
        todayCard = getSequentialCard({ phase, audienceTags, isSmoker, shownIds })
        const newShownIds = shownIds.includes(todayCard.id) ? shownIds : [...shownIds, todayCard.id]
        localStorage.setItem('learn_card_state', JSON.stringify({
          current_card_id: todayCard.id,
          current_card_date: today,
          shown_card_ids: newShownIds,
        }))
      }
      setCard(todayCard)

      if (data.prescription && data.diagnosis_type) {
        const p = data.prescription
        const plan = generateWeeklyPlan({
          aerobic_freq: p.aerobic_frequency_per_week ?? 3,
          resistance_freq: p.resistance_frequency_per_week ?? 2,
          diagnosis_type: data.diagnosis_type as DiagnosisType,
          months_since_surgery: data.months_since_surgery ?? 12,
        })
        const todayEntry = plan.find(e => e.date === today) ?? plan[0]
        const exerciseDaysInPlan = plan.filter(e => !e.is_rest)
        const nextDay = exerciseDaysInPlan.find(e => e.date > today)
        const nextLabel = (() => {
          if (!nextDay) return '明天'
          const diff = Math.round(
            (new Date(nextDay.date + 'T12:00:00Z').getTime() - new Date(today + 'T12:00:00Z').getTime()) / 86400000
          )
          if (diff === 1) return '明天'
          if (diff === 2) return '后天'
          const DAYS = '日一二三四五六'
          return `周${DAYS[new Date(nextDay.date + 'T12:00:00Z').getDay()]}`
        })()

        // Resolve specific exercise name from library
        const matchProfile = buildMatchProfile(data)
        const primary = pickPrimaryExercise(todayEntry.exercise_type, matchProfile)
        const exerciseName = primary?.item.name ?? todayEntry.exercise_type

        setTodayPlan({
          exerciseType: todayEntry.exercise_type,
          exerciseName,
          isRest: todayEntry.is_rest,
          durationMinutes: p.duration_minutes ?? 25,
          rpeTarget: (p.rpe_target as RPELevel) ?? 2,
          nextExerciseLabel: nextLabel,
        })
      }

      const records = JSON.parse(localStorage.getItem('followup_records') || '[]')
      if (records.length > 0) {
        const lastDate = new Date(records[records.length - 1].followup_date)
        const daysSince = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        setFollowupOverdue(daysSince >= 7)
      } else if (data.completed_at) {
        const daysSince = (Date.now() - new Date(data.completed_at).getTime()) / (1000 * 60 * 60 * 24)
        setFollowupOverdue(daysSince >= 7)
      }

      const sessions = JSON.parse(localStorage.getItem('exercise_sessions') || '[]')
      const todayStr = new Date().toISOString().slice(0, 10)
      setTodayExerciseDone(sessions.some((s: { date: string }) => s.date.startsWith(todayStr)))
    } catch {}
  }, [])

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
        <KnowledgeCardWidget card={card} />

        {!assessmentDone ? (
          <Link href="/assessment" className="flex flex-col bg-card rounded-card p-4 gap-1">
            <p className="text-sm text-text-sub">运动方案</p>
            <p className="text-base font-semibold text-text">完成评估，解锁专属运动处方</p>
            <p className="text-sm text-text-sub mt-0.5">根据你的身体状况生成个性化运动计划</p>
            <span className="text-sm text-blue mt-2">立即评估 →</span>
          </Link>
        ) : todayExerciseDone ? (
          <div className="bg-card rounded-card p-4">
            <p className="text-sm text-text-sub mb-1">今日运动</p>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-green">已完成</p>
                {todayPlan && (
                  <p className="text-sm text-text-sub mt-0.5">下次：{todayPlan.nextExerciseLabel}</p>
                )}
              </div>
              <Link
                href="/exercise/data"
                className="flex-shrink-0 min-h-[44px] px-4 border border-border text-text rounded-btn flex items-center text-sm font-medium"
              >
                查看记录
              </Link>
            </div>
          </div>
        ) : todayPlan && !todayPlan.isRest ? (
          <div className="bg-card rounded-card p-4">
            <p className="text-sm text-text-sub mb-1">今日运动</p>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-text">{todayPlan.exerciseName}</p>
                <p className="text-sm text-text-sub">约 {todayPlan.durationMinutes} 分钟 · {RPE_LABELS[todayPlan.rpeTarget].label}强度</p>
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
            {todayPlan ? (
              <>
                <p className="text-base text-text">
                  下次运动：<span className="font-semibold text-blue">{todayPlan.nextExerciseLabel}</span>
                </p>
                <p className="text-sm text-text-sub mt-1">今天是恢复日，保持日常活动量即可。</p>
              </>
            ) : (
              <p className="text-base text-text-sub">今天休息，保持日常活动量即可。</p>
            )}
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
