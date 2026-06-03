'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { RPE_LABELS, calcDayState } from '@/lib/exercise/intensity'
import { getExerciseTypeLabel } from '@/lib/exercise/prescription'
import type { RPELevel, ExerciseType } from '@/types'

type PageState = 'checkin' | 'prescription' | 'active' | 'feedback' | 'summary'
type SleepRating = 'good' | 'average' | 'poor'
type FatigueRating = 'energized' | 'okay' | 'tired' | 'exhausted'
type DayState = 'good' | 'normal' | 'bad'
type HRRecovery = 'within_10min' | '10_30min' | 'over_30min' | 'not_tracked'

const SLEEP_OPTIONS = [
  { value: 'good' as SleepRating, label: '好', sub: '睡得香，精神饱满' },
  { value: 'average' as SleepRating, label: '一般', sub: '说得过去，有点睡意' },
  { value: 'poor' as SleepRating, label: '很差', sub: '没睡好，明显疲惫' },
]

const FATIGUE_OPTIONS = [
  { value: 'energized' as FatigueRating, label: '精力好', sub: '状态不错' },
  { value: 'okay' as FatigueRating, label: '还可以', sub: '正常状态' },
  { value: 'tired' as FatigueRating, label: '比较累', sub: '有些疲乏' },
  { value: 'exhausted' as FatigueRating, label: '很累', sub: '明显乏力' },
]

const SYMPTOMS = ['胸痛', '胸闷', '心慌', '头晕', '呼吸困难', '发热或明显感冒症状']
const AFTER_SYMPTOMS = ['胸痛', '头晕', '心慌', '呼吸困难', '其他不适']

const BAD_STATE_OPTIONS: Array<{ type: ExerciseType; label: string; desc: string; recommended?: boolean }> = [
  { type: 'walking', label: '下调强度继续有氧', desc: '步行 20 分钟，强度降一档' },
  { type: 'resistance', label: '抗阻训练', desc: '低强度力量训练，Borg ≤ 12' },
  { type: 'flexibility', label: '柔韧训练', desc: '主要肌群静态拉伸 10–15 分钟', recommended: true },
  { type: 'breathing_pldb', label: 'PLDB 缩唇膈肌呼吸', desc: '10 分钟，缓解疲劳放松身心' },
]

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function ExercisePage() {
  const [pageState, setPageState] = useState<PageState>('checkin')
  const [checkInStep, setCheckInStep] = useState<1 | 2>(1)
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [noneSelected, setNoneSelected] = useState(false)
  const [sleep, setSleep] = useState<SleepRating | null>(null)
  const [fatigue, setFatigue] = useState<FatigueRating | null>(null)
  const [dayState, setDayState] = useState<DayState | null>(null)
  const [badStateChoice, setBadStateChoice] = useState<ExerciseType | null>(null)
  const [rpeActual, setRpeActual] = useState<RPELevel | null>(null)
  const [afterSymptoms, setAfterSymptoms] = useState<string[]>([])
  const [noDiscomfort, setNoDiscomfort] = useState(false)
  const [hrRecovery, setHrRecovery] = useState<HRRecovery | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const [aiText, setAiText] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [totalSessions] = useState(3) // mock: 3 completed so far
  const [symptomLocked, setSymptomLocked] = useState(false)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Prescription (mock — in production from DB)
  const prescription = {
    exercise_type: 'walking' as ExerciseType,
    duration_minutes: 25,
    rpe_target: 2 as RPELevel,
  }

  // Timer
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsedSeconds(s => s + 1), 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  const toggleSymptom = (s: string) => {
    setNoneSelected(false)
    setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  const toggleAfterSymptom = (s: string) => {
    setNoDiscomfort(false)
    setAfterSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  const handleSymptomConfirm = () => {
    if (symptoms.length > 0) {
      setSymptomLocked(true)
      return
    }
    setCheckInStep(2)
  }

  const handleStateConfirm = () => {
    if (!sleep || !fatigue) return
    const ds = calcDayState(sleep, fatigue)
    setDayState(ds)
    setPageState('prescription')
  }

  const handleStartExercise = () => {
    setPageState('active')
    setRunning(true)
    setElapsedSeconds(0)
  }

  const handleFinish = () => {
    setRunning(false)
    setPageState('feedback')
  }

  const handleSubmitFeedback = async () => {
    setPageState('summary')
    setAiLoading(true)
    // Call AI summary API
    try {
      const resp = await fetch('/api/exercise/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exercise_type: dayState === 'bad' ? badStateChoice : prescription.exercise_type,
          duration: Math.floor(elapsedSeconds / 60) || prescription.duration_minutes,
          rpe_actual: rpeActual,
          day_state: dayState,
          total_sessions: totalSessions + 1,
        }),
      })
      if (!resp.ok) throw new Error('API error')
      const reader = resp.body?.getReader()
      if (!reader) throw new Error('No stream')
      const decoder = new TextDecoder()
      let text = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        text += decoder.decode(value, { stream: true })
        setAiText(text)
      }
    } catch {
      setAiText('')
    } finally {
      setAiLoading(false)
    }
  }

  const currentExerciseType = dayState === 'bad' && badStateChoice
    ? badStateChoice
    : prescription.exercise_type

  // ─── High risk lock ───────────────────────────────────────────────────────────
  const isHighRisk = typeof window !== 'undefined' && (() => {
    try {
      return JSON.parse(localStorage.getItem('assessment_answers') || '{}').risk_level === 'high'
    } catch { return false }
  })()

  if (isHighRisk) {
    return (
      <div className="flex flex-col h-full bg-bg">
        <div className="flex-shrink-0 h-11 flex items-center justify-between px-5">
          <span className="text-[15px] font-semibold text-text">9:41</span>
        </div>
        <div className="flex-shrink-0 h-12 flex items-center px-4 border-b border-border">
          <h1 className="text-lg font-semibold text-text">运动</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-card flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="11" width="18" height="11" rx="2" stroke="#888780" strokeWidth="1.8" />
              <path d="M7 11V7C7 4.79086 8.79086 3 11 3H13C15.2091 3 17 4.79086 17 7V11" stroke="#888780" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-text">运动功能暂时不可用</h2>
          <p className="text-base text-text-sub leading-relaxed">
            等获得医生明确许可后，此功能将为你解锁。
          </p>
          <div className="w-full h-px bg-border my-2" />
          <p className="text-sm text-text-sub">目前你可以：</p>
          <div className="w-full text-left space-y-2">
            {['查看每日科普（首页）', '学习饮食知识（营养）', '向康复助手提问（助手）'].map(item => (
              <div key={item} className="flex items-center gap-2">
                <span className="text-green text-base">✓</span>
                <span className="text-base text-text">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ─── Symptom locked state ─────────────────────────────────────────────────────
  if (symptomLocked) {
    return (
      <div className="flex flex-col h-full bg-bg">
        <div className="flex-shrink-0 h-11 flex items-center justify-between px-5">
          <span className="text-[15px] font-semibold text-text">9:41</span>
        </div>
        <div className="flex-shrink-0 h-12 flex items-center px-4 border-b border-border">
          <h1 className="text-lg font-semibold text-text">运动</h1>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
          <div className="rounded-card p-4 border-l-4 border-red bg-red-light mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-red flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <h3 className="text-base font-bold text-red">今日建议停止运动</h3>
            </div>
            <p className="text-base text-text leading-relaxed">
              你勾选了「{symptoms.join('、')}」，建议今日休息。如症状持续或加重，请及时就医。
            </p>
            <button
              type="button"
              onClick={() => setSymptomLocked(false)}
              className="min-h-[44px] mt-3 text-text-sub text-base"
            >
              我知道了
            </button>
          </div>
          <p className="text-sm text-text-sub text-center">
            明天进入运动页时，将询问你的状态是否已缓解。
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-bg">
      {/* Header */}
      <div className="flex-shrink-0 h-11 flex items-center justify-between px-5">
        <span className="text-[15px] font-semibold text-text">9:41</span>
      </div>
      <div className="flex-shrink-0 h-12 flex items-center justify-between px-4 border-b border-border">
        <h1 className="text-lg font-semibold text-text">运动</h1>
        <Link href="/exercise/data" className="min-h-[44px] flex items-center text-sm text-blue">
          查看数据
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto">

        {/* ── STATE: CHECK-IN ───────────────────────────────────────────── */}
        {pageState === 'checkin' && (
          <div className="px-4 pt-4 pb-32 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${checkInStep === 1 ? 'bg-blue text-white' : 'bg-card text-text-sub'}`}>1</div>
              <span className="text-sm text-text-sub">症状筛查</span>
              <div className="flex-1 h-px bg-border mx-1" />
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${checkInStep === 2 ? 'bg-blue text-white' : 'bg-card text-text-sub'}`}>2</div>
              <span className="text-sm text-text-sub">状态评估</span>
            </div>

            {checkInStep === 1 && (
              <>
                <h2 className="text-lg font-semibold text-text">运动前，请确认以下情况</h2>
                <div className="space-y-2">
                  {SYMPTOMS.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSymptom(s)}
                      className={`w-full min-h-[52px] px-4 rounded-card border text-left text-base transition-all ${
                        symptoms.includes(s)
                          ? 'bg-red-light border-2 border-red text-red font-medium'
                          : 'bg-card border-border text-text'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => { setNoneSelected(true); setSymptoms([]) }}
                    className={`w-full min-h-[52px] px-4 rounded-card border text-left text-base transition-all ${
                      noneSelected
                        ? 'bg-blue-light border-2 border-blue text-blue font-medium'
                        : 'bg-card border-border text-text'
                    }`}
                  >
                    以上都没有
                  </button>
                </div>
              </>
            )}

            {checkInStep === 2 && (
              <>
                <h2 className="text-lg font-semibold text-text">今天的状态怎么样？</h2>
                <div>
                  <p className="text-sm text-text-sub mb-2">昨晚睡眠</p>
                  <div className="space-y-2">
                    {SLEEP_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setSleep(opt.value)}
                        className={`w-full min-h-[52px] px-4 rounded-card border text-left transition-all ${
                          sleep === opt.value
                            ? 'bg-blue-light border-2 border-blue'
                            : 'bg-card border-border'
                        }`}
                      >
                        <span className={`text-base font-medium ${sleep === opt.value ? 'text-blue' : 'text-text'}`}>{opt.label}</span>
                        <span className="text-sm text-text-sub ml-2">{opt.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-text-sub mb-2">今天精力</p>
                  <div className="space-y-2">
                    {FATIGUE_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFatigue(opt.value)}
                        className={`w-full min-h-[52px] px-4 rounded-card border text-left transition-all ${
                          fatigue === opt.value
                            ? 'bg-blue-light border-2 border-blue'
                            : 'bg-card border-border'
                        }`}
                      >
                        <span className={`text-base font-medium ${fatigue === opt.value ? 'text-blue' : 'text-text'}`}>{opt.label}</span>
                        <span className="text-sm text-text-sub ml-2">{opt.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] px-4 pt-3 pb-6 bg-bg border-t border-border">
              <button
                type="button"
                onClick={checkInStep === 1 ? handleSymptomConfirm : handleStateConfirm}
                disabled={checkInStep === 1 ? (symptoms.length === 0 && !noneSelected) : (!sleep || !fatigue)}
                className={`w-full min-h-[56px] rounded-btn text-base font-medium transition-all ${
                  (checkInStep === 1 ? (symptoms.length === 0 && !noneSelected) : (!sleep || !fatigue))
                    ? 'bg-border text-text-sub cursor-not-allowed'
                    : 'bg-blue text-white'
                }`}
              >
                {checkInStep === 1 ? '确认症状，进入下一步' : '确认状态，查看处方'}
              </button>
            </div>
          </div>
        )}

        {/* ── STATE: PRESCRIPTION ──────────────────────────────────────── */}
        {pageState === 'prescription' && (
          <div className="px-4 pt-4 pb-32 space-y-4">
            {dayState === 'normal' && (
              <div className="bg-orange-light border-l-4 border-orange rounded-card p-3">
                <p className="text-sm text-orange font-medium">今日状态一般，处方强度已降一档</p>
              </div>
            )}

            {dayState === 'bad' ? (
              <>
                <div className="bg-orange-light border-l-4 border-orange rounded-card p-3">
                  <p className="text-sm text-orange font-medium">今日状态不佳，以下训练任选其一</p>
                  <p className="text-xs text-orange mt-0.5">本次训练不计入有氧打卡次数</p>
                </div>
                {BAD_STATE_OPTIONS.map(opt => (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setBadStateChoice(opt.type)}
                    className={`w-full min-h-[64px] px-4 py-3 rounded-card border text-left transition-all ${
                      badStateChoice === opt.type
                        ? 'bg-blue-light border-2 border-blue'
                        : 'bg-card border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-base font-medium ${badStateChoice === opt.type ? 'text-blue' : 'text-text'}`}>
                        {opt.label}
                      </span>
                      {opt.recommended && (
                        <span className="text-xs px-2 py-0.5 rounded-pill bg-green-light text-green-dark font-medium">推荐</span>
                      )}
                    </div>
                    <p className="text-sm text-text-sub mt-0.5">{opt.desc}</p>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPageState('checkin')}
                  className="w-full min-h-[44px] text-text-sub text-base"
                >
                  今天休息
                </button>
              </>
            ) : (
              <div className="bg-card rounded-card p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="inline-block px-2.5 py-0.5 rounded-pill bg-blue text-white text-xs font-medium">有氧</span>
                  <span className="text-lg font-semibold text-text">
                    {getExerciseTypeLabel(prescription.exercise_type)}
                  </span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-text-sub">目标时长</span>
                  <span className="font-medium text-text">
                    {dayState === 'normal' ? prescription.duration_minutes - 5 : prescription.duration_minutes} 分钟
                  </span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-text-sub">强度目标</span>
                  <span className="font-medium text-text">
                    {RPE_LABELS[dayState === 'normal' ? Math.max(1, prescription.rpe_target - 1) as RPELevel : prescription.rpe_target].label}
                  </span>
                </div>
                <div className="pt-3 border-t border-border">
                  <p className="text-sm text-text-sub font-medium mb-1">热身（5 分钟）</p>
                  <p className="text-sm text-text">轻度活动 + 关节活动，逐渐提升心率</p>
                </div>
                <div>
                  <p className="text-sm text-text-sub font-medium mb-1">
                    主体运动（{dayState === 'normal' ? prescription.duration_minutes - 5 : prescription.duration_minutes} 分钟）
                  </p>
                  <p className="text-sm text-text">
                    目标感受：{RPE_LABELS[dayState === 'normal' ? Math.max(1, prescription.rpe_target - 1) as RPELevel : prescription.rpe_target].aerobic}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-text-sub font-medium mb-1">冷身（5 分钟）</p>
                  <p className="text-sm text-text">静态拉伸 + PLDB 呼吸放松</p>
                </div>
              </div>
            )}

            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] px-4 pt-3 pb-6 bg-bg border-t border-border">
              <button
                type="button"
                onClick={handleStartExercise}
                disabled={dayState === 'bad' && !badStateChoice}
                className={`w-full min-h-[56px] rounded-btn text-base font-medium transition-all ${
                  dayState === 'bad' && !badStateChoice
                    ? 'bg-border text-text-sub cursor-not-allowed'
                    : 'bg-green text-white'
                }`}
              >
                {dayState === 'bad' ? '开始训练' : '开始运动'}
              </button>
            </div>
          </div>
        )}

        {/* ── STATE: ACTIVE ────────────────────────────────────────────── */}
        {pageState === 'active' && (
          <div className="flex flex-col items-center px-4 pt-8 pb-32">
            <p className="text-sm text-text-sub mb-1">{getExerciseTypeLabel(currentExerciseType)}</p>
            <div className="text-6xl font-bold text-text tabular-nums my-6">
              {formatTime(elapsedSeconds)}
            </div>
            <button
              type="button"
              onClick={() => setRunning(r => !r)}
              className="w-20 h-20 rounded-full bg-card border-2 border-border flex items-center justify-center mb-8"
            >
              {running ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <rect x="6" y="4" width="4" height="16" rx="1" fill="#2C2A26" />
                  <rect x="14" y="4" width="4" height="16" rx="1" fill="#2C2A26" />
                </svg>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M6 4L20 12L6 20V4Z" fill="#2C2A26" />
                </svg>
              )}
            </button>
            <p className="text-sm text-text-sub text-center">注意感受运动强度，保持能说话但不能唱歌的节奏</p>

            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] px-4 pt-3 pb-6 bg-bg border-t border-border">
              <button
                type="button"
                onClick={handleFinish}
                className="w-full min-h-[56px] bg-green text-white rounded-btn text-base font-medium"
              >
                完成运动，记录反馈
              </button>
            </div>
          </div>
        )}

        {/* ── STATE: FEEDBACK ──────────────────────────────────────────── */}
        {pageState === 'feedback' && (
          <div className="px-4 pt-4 pb-36 space-y-5">
            <h2 className="text-lg font-semibold text-text">记录本次运动</h2>

            {/* RPE selector */}
            <div>
              <p className="text-sm text-text-sub mb-2">运动强度感受</p>
              <div className="space-y-2">
                {([1,2,3,4] as RPELevel[]).map(level => {
                  const rpe = RPE_LABELS[level]
                  const isTarget = level === prescription.rpe_target
                  const isSelected = rpeActual === level
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setRpeActual(level)}
                      className={`w-full min-h-[56px] px-4 py-2 rounded-card border-2 text-left transition-all ${
                        isTarget && !isSelected
                          ? 'bg-blue-light border-blue'
                          : isSelected
                          ? isTarget ? 'bg-blue-light border-blue' : 'bg-card border-text'
                          : 'bg-card border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-base font-semibold ${isTarget || isSelected ? 'text-blue' : 'text-text'}`}>
                          {rpe.label}
                        </span>
                        {isTarget && (
                          <span className="text-xs px-2 py-0.5 rounded-pill bg-blue text-white font-medium">✓ 目标区间</span>
                        )}
                      </div>
                      <p className="text-sm text-text-sub mt-0.5">{rpe.aerobic}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* After symptoms */}
            <div>
              <p className="text-sm text-text-sub mb-2">运动中或结束后有无不适？</p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => { setNoDiscomfort(true); setAfterSymptoms([]) }}
                  className={`w-full min-h-[52px] px-4 rounded-card border text-left text-base transition-all ${
                    noDiscomfort ? 'bg-green-light border-2 border-green text-green-dark font-medium' : 'bg-card border-border text-text'
                  }`}
                >
                  没有不适，感觉良好
                </button>
                <button
                  type="button"
                  onClick={() => { setNoDiscomfort(false) }}
                  className={`w-full min-h-[52px] px-4 rounded-card border text-left text-base transition-all ${
                    !noDiscomfort && afterSymptoms.length > 0 ? 'bg-orange-light border-2 border-orange text-orange font-medium' : 'bg-card border-border text-text'
                  }`}
                >
                  有些不适 {afterSymptoms.length > 0 && `（${afterSymptoms.join('、')}）`}
                </button>
                {!noDiscomfort && (
                  <div className="pl-2 space-y-1">
                    {AFTER_SYMPTOMS.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleAfterSymptom(s)}
                        className={`w-full min-h-[44px] px-4 rounded-card border text-left text-sm transition-all ${
                          afterSymptoms.includes(s) ? 'bg-orange-light border-orange text-orange' : 'bg-card border-border text-text'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* HR recovery */}
            <div>
              <p className="text-sm text-text-sub mb-2">运动结束后心率恢复情况</p>
              <div className="space-y-2">
                {[
                  { value: 'within_10min' as HRRecovery, label: '10 分钟内恢复正常' },
                  { value: '10_30min' as HRRecovery, label: '10–30 分钟才恢复' },
                  { value: 'over_30min' as HRRecovery, label: '超过 30 分钟还没恢复' },
                  { value: 'not_tracked' as HRRecovery, label: '没有特别注意' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setHrRecovery(opt.value)}
                    className={`w-full min-h-[52px] px-4 rounded-card border text-left text-base transition-all ${
                      hrRecovery === opt.value ? 'bg-blue-light border-2 border-blue text-blue font-medium' : 'bg-card border-border text-text'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] px-4 pt-3 pb-6 bg-bg border-t border-border">
              <button
                type="button"
                onClick={handleSubmitFeedback}
                disabled={!rpeActual || (!noDiscomfort && afterSymptoms.length === 0) || !hrRecovery}
                className={`w-full min-h-[56px] rounded-btn text-base font-medium transition-all ${
                  !rpeActual || (!noDiscomfort && afterSymptoms.length === 0) || !hrRecovery
                    ? 'bg-border text-text-sub cursor-not-allowed'
                    : 'bg-blue text-white'
                }`}
              >
                提交
              </button>
            </div>
          </div>
        )}

        {/* ── STATE: SUMMARY ───────────────────────────────────────────── */}
        {pageState === 'summary' && (
          <div className="px-4 pt-4 pb-8 space-y-4">
            <div className="bg-card rounded-card p-4">
              <h3 className="text-base font-semibold text-text mb-3">本次运动</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-text-sub mb-0.5">类型</p>
                  <p className="text-base font-medium text-text">{getExerciseTypeLabel(currentExerciseType)}</p>
                </div>
                <div>
                  <p className="text-xs text-text-sub mb-0.5">时长</p>
                  <p className="text-base font-medium text-text">
                    {Math.floor(elapsedSeconds / 60) || prescription.duration_minutes} 分钟
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-sub mb-0.5">强度感受</p>
                  <p className="text-base font-medium text-text">
                    {rpeActual ? RPE_LABELS[rpeActual].label : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-sub mb-0.5">累计次数</p>
                  <p className="text-base font-medium text-text">第 {totalSessions + 1} 次</p>
                </div>
              </div>
            </div>

            {/* AI text */}
            <div className="bg-card rounded-card p-4 min-h-[80px]">
              {aiLoading && !aiText && (
                <p className="text-base text-text-sub">✦ 正在生成…</p>
              )}
              {aiText && (
                <p className="text-base text-text leading-relaxed">{aiText}</p>
              )}
              {!aiLoading && !aiText && (
                <p className="text-base text-text-sub">今日运动记录已保存。</p>
              )}
            </div>

            {/* Next session */}
            <div className="bg-card rounded-card p-4">
              <h3 className="text-sm text-text-sub mb-2">下次运动建议</h3>
              <p className="text-base font-medium text-text">
                后天 · {getExerciseTypeLabel(prescription.exercise_type)} · {RPE_LABELS[prescription.rpe_target].label}强度
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setPageState('checkin')
                setCheckInStep(1)
                setSymptoms([])
                setNoneSelected(false)
                setSleep(null)
                setFatigue(null)
                setDayState(null)
                setBadStateChoice(null)
                setRpeActual(null)
                setAfterSymptoms([])
                setNoDiscomfort(false)
                setHrRecovery(null)
                setElapsedSeconds(0)
                setAiText('')
              }}
              className="w-full min-h-[44px] text-text-sub text-base"
            >
              返回运动页
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
