'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { RPE_LABELS, vsaqToInitialDuration, vsaqToInitialRPE } from '@/lib/exercise/intensity'
import { getExerciseTypeLabel } from '@/lib/exercise/prescription'
import Button from '@/components/ui/Button'
import type { ExerciseType, RPELevel } from '@/types'

function SummaryContent() {
  const params = useSearchParams()
  const risk = params.get('risk') || 'low'
  const isHigh = risk === 'high'

  // Read prescription from localStorage
  let rx: { exercise_type: ExerciseType; duration_minutes: number; rpe_target: RPELevel } = { exercise_type: 'walking', duration_minutes: 25, rpe_target: 2 }
  if (typeof window !== 'undefined') {
    try {
      const data = JSON.parse(localStorage.getItem('assessment_answers') || '{}')
      const vsaq = data.vsaq_score || 5
      const storedPx = data.prescription
      rx = storedPx
        ? { exercise_type: storedPx.exercise_type ?? 'walking', duration_minutes: storedPx.duration_minutes, rpe_target: storedPx.rpe_target }
        : { exercise_type: 'walking', duration_minutes: vsaqToInitialDuration(vsaq), rpe_target: vsaqToInitialRPE(vsaq) }
    } catch {}
  }

  const rpeInfo = RPE_LABELS[rx.rpe_target]

  if (isHigh) {
    return (
      <div className="phone-shell">
        <div className="scroll-area px-4 pt-6 pb-8">
          <div className="flex flex-col items-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-full bg-orange-light flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="#BA7517" strokeWidth="2" />
                <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="#BA7517" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-text text-center">先做好准备</h1>
            <p className="text-base text-text-sub text-center leading-relaxed">
              根据你的情况，建议先获得医生明确许可后再开始运动康复。
            </p>
          </div>

          <div className="bg-card rounded-card p-4 mb-4">
            <h3 className="font-semibold text-text mb-3">目前你可以使用：</h3>
            <div className="flex flex-col gap-2">
              {[
                { icon: '🥗', title: '营养指导', desc: '心脏友好的饮食建议' },
                { icon: '💬', title: '康复助手', desc: '随时解答你的健康问题' },
                { icon: '📚', title: '科普内容', desc: '了解心脏康复知识' },
                { icon: '🧘', title: '心理科普', desc: '管理康复期间的情绪' },
              ].map(item => (
                <div key={item.title} className="flex items-center gap-3 py-1">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <div className="text-base font-medium text-text">{item.title}</div>
                    <div className="text-sm text-text-sub">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-card p-4 mb-6">
            <p className="text-sm text-text-sub leading-relaxed">
              运动功能将在你获得医生明确许可后解锁。可以去「我」页面更新评估，或直接告诉助手你的情况。
            </p>
          </div>

          <Link href="/onboarding/guide">
            <Button>去看看可以做什么</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="phone-shell">
      <div className="scroll-area px-4 pt-6 pb-8">
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="w-16 h-16 rounded-full bg-green-light flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17L4 12" stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text text-center">你的康复计划已生成</h1>
          <p className="text-base text-text-sub text-center leading-relaxed">
            {risk === 'medium' ? '我们会在前期为你提供更密集的进度关注' : '系统已根据你的情况制定了初始运动处方'}
          </p>
        </div>

        {/* Risk label */}
        <div className="bg-card rounded-card p-4 mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-text-sub">康复状态评估</span>
            <span className={`text-sm font-semibold px-2.5 py-0.5 rounded-pill ${
              risk === 'medium' ? 'bg-orange-light text-orange' : 'bg-green-light text-green-dark'
            }`}>
              {risk === 'medium' ? '需要适度关注' : '康复条件良好'}
            </span>
          </div>
          <p className="text-sm text-text-sub leading-relaxed">
            {risk === 'medium'
              ? '建议保持与主治医生的定期沟通，前 18 次运动后额外监测恢复情况。'
              : '可以按照系统生成的处方开始规律运动康复。'}
          </p>
        </div>

        {/* Initial prescription */}
        <div className="bg-card rounded-card p-4 mb-4">
          <h3 className="font-semibold text-text mb-3">初始运动处方</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-text-sub">运动类型</span>
              <span className="font-medium text-text">{getExerciseTypeLabel(rx.exercise_type)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-sub">目标时长</span>
              <span className="font-medium text-text">{rx.duration_minutes} 分钟</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-sub">强度目标</span>
              <span className="font-medium text-text">
                {rpeInfo.label}（{rpeInfo.aerobic}）
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-sub">频率</span>
              <span className="font-medium text-text">每周 3 次</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-light rounded-card p-3 mb-6">
          <p className="text-sm text-blue leading-relaxed">
            建议<strong>今天或明天</strong>完成第一次运动。处方会随你的适应情况逐步调整。
          </p>
        </div>

        <Link href="/onboarding/guide">
          <Button>查看功能引导</Button>
        </Link>
      </div>
    </div>
  )
}

export default function AssessmentSummaryPage() {
  return (
    <Suspense fallback={<div className="phone-shell flex items-center justify-center"><p className="text-text-sub">加载中…</p></div>}>
      <SummaryContent />
    </Suspense>
  )
}
