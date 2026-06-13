'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { RPE_LABELS, calcDayState, evalLayer2Signal, applyPrescriptionAdjustment } from '@/lib/exercise/intensity'
import { getExerciseTypeLabel, getExerciseTagLabel, isAerobicCount } from '@/lib/exercise/prescription'
import { matchExercisesForCategory, buildMatchProfile } from '@/lib/exercise/matching'
import type { MatchedExercise } from '@/lib/exercise/matching'
import type { EquipmentType } from '@/lib/exercise/library'
import type { RPELevel, ExerciseType, Layer2Window, HRRecovery as HRRecoveryType } from '@/types'

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

// Display groups: map ExerciseType categories to UI section headers
const DISPLAY_GROUPS: Array<{ label: string; categories: ExerciseType[] }> = [
  { label: '有氧运动', categories: ['walking', 'home_aerobic', 'swimming', 'jogging', 'cycling'] },
  { label: '抗阻训练', categories: ['resistance'] },
  { label: '柔韧训练', categories: ['flexibility'] },
  { label: '呼吸训练', categories: ['breathing_pldb'] },
]

const TYPE_GROUP_DESCRIPTIONS: Record<string, string> = {
  '有氧运动': '步行、游泳等持续有氧训练，心脏康复的核心',
  '抗阻训练': '力量训练，增强肌力与日常活动能力',
  '柔韧训练': '拉伸、太极、八段锦、瑜伽，改善活动度',
  '呼吸训练': '缩唇膈肌呼吸，适合任何状态下进行',
}

const EQUIPMENT_LABELS: Partial<Record<EquipmentType, string>> = {
  dumbbells: '哑铃',
  resistance_band: '弹力带',
  pool: '泳池',
  nordic_poles: '北欧手杖',
}

function runLayer2Check(
  allSessions: Array<{
    date: string
    rpe_actual: RPELevel | null
    hr_recovery: string | null
    symptoms_after: string[]
    day_state: string | null
    is_aerobic_count: boolean
  }>,
  currentPrescription: { duration_minutes: number; rpe_target: RPELevel; last_adjustment_at?: string },
  hasBetaBlocker: boolean
): { signal: 'up' | 'down'; duration_minutes: number; rpe_target: RPELevel } | null {
  const aerobic = allSessions
    .filter(s => s.is_aerobic_count && s.rpe_actual != null && s.hr_recovery != null)
    .sort((a, b) => a.date.localeCompare(b.date))

  if (aerobic.length < 3) return null

  const window: Layer2Window = {
    sessions: aerobic.map(s => ({
      rpe: s.rpe_actual as RPELevel,
      hr_recovery: s.hr_recovery as HRRecoveryType,
      had_discomfort: s.symptoms_after.length > 0,
      date: s.date.slice(0, 10),
      day_state: (s.day_state as DayState) ?? undefined,
    })),
    last_adjustment_date: currentPrescription.last_adjustment_at,
  }

  const signal = evalLayer2Signal(window, hasBetaBlocker)
  if (signal === 'maintain') return null

  const adjusted = applyPrescriptionAdjustment(
    { rpe_target: currentPrescription.rpe_target, duration_minutes: currentPrescription.duration_minutes },
    signal
  )

  if (adjusted.rpe_target === currentPrescription.rpe_target && adjusted.duration_minutes === currentPrescription.duration_minutes) return null

  return { signal, duration_minutes: adjusted.duration_minutes, rpe_target: adjusted.rpe_target }
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function buildAvailableExercises(answers: Record<string, unknown>): MatchedExercise[] {
  const profile = buildMatchProfile(answers)
  const categories: ExerciseType[] = ['walking', 'home_aerobic', 'swimming', 'jogging', 'cycling', 'resistance', 'flexibility', 'breathing_pldb']
  const results: MatchedExercise[] = []
  for (const cat of categories) {
    const equip: EquipmentType[] = cat === 'swimming' ? ['pool'] : []
    results.push(...matchExercisesForCategory(cat, profile, equip))
  }
  return results
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
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null)
  const [selectedTypeGroup, setSelectedTypeGroup] = useState<string | null>(null)
  const [prescriptionStep, setPrescriptionStep] = useState<'type' | 'exercise'>('type')
  const [availableExercises, setAvailableExercises] = useState<MatchedExercise[]>([])
  const [rpeActual, setRpeActual] = useState<RPELevel | null>(null)
  const [afterSymptoms, setAfterSymptoms] = useState<string[]>([])
  const [noDiscomfort, setNoDiscomfort] = useState(false)
  const [hrRecovery, setHrRecovery] = useState<HRRecovery | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const [aiText, setAiText] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [totalSessions, setTotalSessions] = useState(0)
  const [symptomLocked, setSymptomLocked] = useState(false)
  const [todayCompleted, setTodayCompleted] = useState(false)
  const [isHighRisk, setIsHighRisk] = useState(false)
  const [showAfterSymptoms, setShowAfterSymptoms] = useState(false)
  const [showSwimUnlock, setShowSwimUnlock] = useState(false)
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false)
  const [hasBetaBlocker, setHasBetaBlocker] = useState(false)
  const [prescriptionAdjusted, setPrescriptionAdjusted] = useState<{
    signal: 'up' | 'down'; newRpe: RPELevel; newDuration: number
  } | null>(null)
  const [prescription, setPrescription] = useState({
    exercise_type: 'walking' as ExerciseType,
    duration_minutes: 25,
    rpe_target: 2 as RPELevel,
  })

  const router = useRouter()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    try {
      const answers = JSON.parse(localStorage.getItem('assessment_answers') || '{}')
      if (!answers.risk_level) {
        router.replace('/assessment')
        return
      }
      setIsHighRisk(answers.risk_level === 'high')
      if (answers.prescription) {
        setPrescription({
          exercise_type: answers.prescription.exercise_type,
          duration_minutes: answers.prescription.duration_minutes,
          rpe_target: answers.prescription.rpe_target,
        })
      }
      const sessions = JSON.parse(localStorage.getItem('exercise_sessions') || '[]')
      setTotalSessions(sessions.length)
      const todayStr = new Date().toISOString().slice(0, 10)
      setTodayCompleted(sessions.some((s: { date: string }) => s.date.startsWith(todayStr)))

      if (answers.can_swim === undefined && answers.risk_level !== 'high') {
        const profileIfCanSwim = buildMatchProfile({ ...answers, can_swim: true })
        const swimOptions = matchExercisesForCategory('swimming', profileIfCanSwim, ['pool'])
        setShowSwimUnlock(swimOptions.length > 0)
      }

      setHasBetaBlocker(answers.has_beta_blocker === 'true' || answers.has_beta_blocker === true)
      setAvailableExercises(buildAvailableExercises(answers))
    } catch {}
  }, [])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsedSeconds(s => s + 1), 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  // Derived from selected exercise id
  const selectedExercise = availableExercises.find(e => e.item.id === selectedExerciseId) ?? null
  const selectedExerciseType: ExerciseType | null = selectedExercise?.item.category ?? null

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
    setSelectedExerciseId(null)
    setSelectedTypeGroup(null)
    setPrescriptionStep('type')
    setPageState('prescription')
  }

  const handleBackFromPrescription = () => {
    if (prescriptionStep === 'exercise') {
      setSelectedExerciseId(null)
      setPrescriptionStep('type')
    } else {
      setDayState(null)
      setSelectedExerciseId(null)
      setSelectedTypeGroup(null)
      setPrescriptionStep('type')
      setCheckInStep(2)
      setPageState('checkin')
    }
  }

  const handleSwimAnswer = (canSwim: boolean) => {
    try {
      const data = JSON.parse(localStorage.getItem('assessment_answers') || '{}')
      data.can_swim = canSwim
      localStorage.setItem('assessment_answers', JSON.stringify(data))
      setAvailableExercises(buildAvailableExercises(data))
    } catch {}
    setShowSwimUnlock(false)
  }

  const handleStartExercise = () => {
    setPageState('active')
    setRunning(true)
    setElapsedSeconds(0)
    setShowAbandonConfirm(false)
  }

  const handleAbandon = () => {
    setRunning(false)
    setElapsedSeconds(0)
    setShowAbandonConfirm(false)
    setPageState('prescription')
  }

  const handleFinish = () => {
    setRunning(false)
    setPageState('feedback')
  }

  const handleSubmitFeedback = async () => {
    const exerciseType = dayState === 'bad'
      ? badStateChoice
      : (selectedExerciseType ?? prescription.exercise_type)
    const duration = Math.floor(elapsedSeconds / 60) || prescription.duration_minutes
    let newTotal = totalSessions
    try {
      const session = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        exercise_type: exerciseType,
        duration,
        rpe_actual: rpeActual,
        hr_recovery: hrRecovery,
        symptoms_after: noDiscomfort ? [] : afterSymptoms,
        day_state: dayState,
        is_aerobic_count: exerciseType ? isAerobicCount(exerciseType) : false,
      }
      const sessions = JSON.parse(localStorage.getItem('exercise_sessions') || '[]')
      sessions.push(session)
      localStorage.setItem('exercise_sessions', JSON.stringify(sessions))
      newTotal = sessions.length
      setTotalSessions(newTotal)
      setTodayCompleted(true)
    } catch {}

    // Layer 2: evaluate progression signal and adjust prescription if warranted
    try {
      const allSessions = JSON.parse(localStorage.getItem('exercise_sessions') || '[]')
      const answers = JSON.parse(localStorage.getItem('assessment_answers') || '{}')
      const px = answers.prescription || {}
      const adj = runLayer2Check(
        allSessions,
        {
          duration_minutes: px.duration_minutes ?? prescription.duration_minutes,
          rpe_target: (px.rpe_target ?? prescription.rpe_target) as RPELevel,
          last_adjustment_at: px.last_adjustment_at,
        },
        hasBetaBlocker
      )
      if (adj) {
        answers.prescription = {
          ...px,
          duration_minutes: adj.duration_minutes,
          rpe_target: adj.rpe_target,
          last_adjustment_at: new Date().toISOString(),
        }
        localStorage.setItem('assessment_answers', JSON.stringify(answers))
        setPrescription(prev => ({ ...prev, duration_minutes: adj.duration_minutes, rpe_target: adj.rpe_target }))
        setPrescriptionAdjusted({ signal: adj.signal, newRpe: adj.rpe_target, newDuration: adj.duration_minutes })
      }
    } catch {}

    setPageState('summary')
    setAiLoading(true)
    try {
      const resp = await fetch('/api/exercise/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exercise_type: exerciseType,
          duration,
          rpe_actual: rpeActual,
          day_state: dayState,
          total_sessions: newTotal,
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

  const currentExerciseType = (dayState === 'bad' && badStateChoice)
    ? badStateChoice
    : (selectedExerciseType ?? prescription.exercise_type)

  const currentExerciseName = selectedExercise?.item.name ?? getExerciseTypeLabel(currentExerciseType)

  const startDisabled = dayState === 'bad' ? !badStateChoice : !selectedExerciseId

  const recommendedTypeGroup = availableExercises.some(e =>
    ['walking', 'home_aerobic', 'swimming', 'jogging', 'cycling'].includes(e.item.category)
  ) ? '有氧运动' : null

  const effectiveRpeTarget = dayState === 'normal'
    ? Math.max(1, prescription.rpe_target - 1) as RPELevel
    : prescription.rpe_target

  // ─── High risk lock ───────────────────────────────────────────────────────────
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

  // ─── Today completed ─────────────────────────────────────────────────────────
  if (todayCompleted && pageState !== 'summary') {
    return (
      <div className="flex flex-col h-full bg-bg">
        <div className="flex-shrink-0 h-11 flex items-center justify-between px-5">
          <span className="text-[15px] font-semibold text-text">9:41</span>
        </div>
        <div className="flex-shrink-0 h-12 flex items-center px-4 border-b border-border">
          <h1 className="text-lg font-semibold text-text">运动</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-green-light flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17L4 12" stroke="#1D9E75" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-text">今日运动已完成</h2>
          <p className="text-base text-text-sub leading-relaxed">保持节奏，下次继续。</p>
          <Link
            href="/exercise/data"
            className="min-h-[44px] px-6 bg-blue text-white rounded-btn flex items-center text-base font-medium"
          >
            查看运动记录
          </Link>
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
            <button type="button" className="min-h-[44px] mt-3 text-text-sub text-base cursor-default">
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
        <div className="flex items-center gap-1">
          {pageState === 'prescription' && (
            <button
              type="button"
              onClick={handleBackFromPrescription}
              className="flex items-center min-h-[44px] min-w-[44px] -ml-2"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 19L8 12L15 5" stroke="#2C2A26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          <h1 className="text-lg font-semibold text-text">运动</h1>
        </div>
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
                          sleep === opt.value ? 'bg-blue-light border-2 border-blue' : 'bg-card border-border'
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
                          fatigue === opt.value ? 'bg-blue-light border-2 border-blue' : 'bg-card border-border'
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
              {checkInStep === 2 && (
                <button
                  type="button"
                  onClick={() => setCheckInStep(1)}
                  className="w-full min-h-[44px] text-text-sub text-base mb-2"
                >
                  ← 返回修改症状
                </button>
              )}
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
                {checkInStep === 1 ? '确认症状，进入下一步' : '确认状态，选择运动'}
              </button>
            </div>
          </div>
        )}

        {/* ── STATE: PRESCRIPTION ──────────────────────────────────────── */}
        {pageState === 'prescription' && (
          <div className="px-4 pt-4 pb-32 space-y-4">
            {dayState === 'good' && (
              <div className="bg-green-light border-l-4 border-green rounded-card p-3">
                <p className="text-sm text-green-dark font-medium">今日状态良好，按标准处方训练</p>
              </div>
            )}
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
            ) : prescriptionStep === 'type' ? (
              <>
                {/* Step 1: choose exercise type group */}
                <p className="text-base font-semibold text-text">选择运动类型</p>
                {DISPLAY_GROUPS.map(group => {
                  const groupItems = availableExercises.filter(e =>
                    group.categories.includes(e.item.category)
                  )
                  if (groupItems.length === 0) return null
                  const isRecommended = group.label === recommendedTypeGroup
                  return (
                    <button
                      key={group.label}
                      type="button"
                      onClick={() => {
                        setSelectedTypeGroup(group.label)
                        setPrescriptionStep('exercise')
                      }}
                      className="w-full min-h-[72px] px-4 py-3 rounded-card border bg-card border-border text-left transition-all active:bg-blue-light"
                    >
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-base font-medium text-text">{group.label}</span>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="text-xs text-text-sub">{groupItems.length} 个项目</span>
                          {isRecommended && (
                            <span className="text-xs px-2 py-0.5 rounded-pill bg-green-light text-green-dark font-medium">推荐</span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-text-sub">{TYPE_GROUP_DESCRIPTIONS[group.label]}</p>
                    </button>
                  )
                })}

                {/* Swim unlock prompt in type step */}
                {showSwimUnlock && (
                  <div className="bg-card rounded-card p-4">
                    <p className="text-sm text-text-sub mb-1">另一个选项</p>
                    <p className="text-base font-medium text-text mb-1">游泳也适合你目前的康复阶段</p>
                    <p className="text-sm text-text-sub mb-3">你会游泳，且方便使用泳池吗？</p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleSwimAnswer(true)}
                        className="flex-1 min-h-[44px] rounded-btn border border-blue bg-blue-light text-blue text-base font-medium"
                      >
                        会，有泳池
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSwimAnswer(false)}
                        className="flex-1 min-h-[44px] rounded-btn border border-border bg-card text-text-sub text-base"
                      >
                        不会 / 没有
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Step 2: choose specific exercise within selected type */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setSelectedExerciseId(null); setPrescriptionStep('type') }}
                    className="flex items-center min-h-[44px] -ml-1 text-blue text-sm"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="mr-0.5">
                      <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {selectedTypeGroup}
                  </button>
                </div>
                <div className="space-y-2">
                  {availableExercises
                    .filter(e => {
                      const group = DISPLAY_GROUPS.find(g => g.label === selectedTypeGroup)
                      return group?.categories.includes(e.item.category) ?? false
                    })
                    .map(matched => {
                      const isSelected = selectedExerciseId === matched.item.id
                      return (
                        <button
                          key={matched.item.id}
                          type="button"
                          onClick={() => setSelectedExerciseId(matched.item.id)}
                          className={`w-full min-h-[64px] px-4 py-3 rounded-card border text-left transition-all ${
                            isSelected ? 'bg-blue-light border-2 border-blue' : 'bg-card border-border'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-base font-medium ${isSelected ? 'text-blue' : 'text-text'}`}>
                              {matched.item.name}
                            </span>
                            {matched.requires_equipment && (
                              <span className="text-xs px-2 py-0.5 rounded-pill bg-card border border-border text-text-sub flex-shrink-0">
                                需{EQUIPMENT_LABELS[matched.requires_equipment] ?? matched.requires_equipment}
                              </span>
                            )}
                          </div>
                          {matched.item.video_guided && (
                            <p className="text-xs text-text-sub mt-0.5">视频指导</p>
                          )}
                          {matched.active_modifications.length > 0 && (
                            <p className="text-xs text-orange mt-0.5">注意：{matched.active_modifications[0]}</p>
                          )}
                        </button>
                      )
                    })
                  }
                </div>

                {/* Prescription detail card for selected exercise */}
                {selectedExercise && (
                  <div className="bg-card rounded-card p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block px-2.5 py-0.5 rounded-pill text-white text-xs font-medium ${
                        isAerobicCount(selectedExercise.item.category) ? 'bg-blue'
                        : selectedExercise.item.category === 'resistance' ? 'bg-orange'
                        : 'bg-green'
                      }`}>
                        {getExerciseTagLabel(selectedExercise.item.category)}
                      </span>
                      <span className="text-lg font-semibold text-text">{selectedExercise.item.name}</span>
                    </div>

                    <div className="flex justify-between text-base">
                      <span className="text-text-sub">目标时长</span>
                      <span className="font-medium text-text">
                        {isAerobicCount(selectedExercise.item.category)
                          ? `${prescription.duration_minutes} 分钟`
                          : `${selectedExercise.item.duration_range[0]}–${selectedExercise.item.duration_range[1]} 分钟`
                        }
                      </span>
                    </div>

                    {isAerobicCount(selectedExercise.item.category) && (
                      <>
                        <div className="flex justify-between text-base">
                          <span className="text-text-sub">强度目标</span>
                          <span className="font-medium text-text">
                            {RPE_LABELS[effectiveRpeTarget].label}
                          </span>
                        </div>
                        <div className="pt-3 border-t border-border space-y-3">
                          <div>
                            <p className="text-sm text-text-sub font-medium mb-1">热身（5 分钟）</p>
                            <p className="text-sm text-text">轻度活动 + 关节活动，逐渐提升心率</p>
                          </div>
                          <div>
                            <p className="text-sm text-text-sub font-medium mb-1">
                              主体运动（{prescription.duration_minutes} 分钟）
                            </p>
                            <p className="text-sm text-text">
                              目标感受：{RPE_LABELS[effectiveRpeTarget].aerobic}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-text-sub font-medium mb-1">冷身（5 分钟）</p>
                            <p className="text-sm text-text">静态拉伸 + PLDB 呼吸放松</p>
                          </div>
                        </div>
                      </>
                    )}

                    {selectedExercise.item.video_guided && selectedExercise.item.video_note && (
                      <div className="pt-3 border-t border-border">
                        <p className="text-sm text-text-sub font-medium mb-1">视频指导</p>
                        <p className="text-sm text-text">{selectedExercise.item.video_note}</p>
                      </div>
                    )}

                    {selectedExercise.active_modifications.length > 0 && (
                      <div className="pt-3 border-t border-border">
                        <p className="text-sm text-orange font-medium mb-1">你的注意事项</p>
                        {selectedExercise.active_modifications.map((mod, i) => (
                          <p key={i} className="text-sm text-text">{mod}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {(dayState === 'bad' || prescriptionStep === 'exercise') && (
              <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] px-4 pt-3 pb-6 bg-bg border-t border-border">
                <button
                  type="button"
                  onClick={handleStartExercise}
                  disabled={startDisabled}
                  className={`w-full min-h-[56px] rounded-btn text-base font-medium transition-all ${
                    startDisabled ? 'bg-border text-text-sub cursor-not-allowed' : 'bg-green text-white'
                  }`}
                >
                  {dayState === 'bad' ? '开始训练' : '开始运动'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── STATE: ACTIVE ────────────────────────────────────────────── */}
        {pageState === 'active' && (
          <div className="flex flex-col items-center px-4 pt-8 pb-32">
            <p className="text-sm text-text-sub mb-1">{currentExerciseName}</p>
            <div className={`text-6xl font-bold tabular-nums my-6 ${running ? 'text-text' : 'text-text-sub'}`}>
              {formatTime(elapsedSeconds)}
            </div>

            {showAbandonConfirm ? (
              <div className="w-full bg-card rounded-card p-5 text-center space-y-3">
                <p className="text-base font-semibold text-text">确定放弃本次运动？</p>
                <p className="text-sm text-text-sub">已计时 {formatTime(elapsedSeconds)}，本次不会计入记录</p>
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleAbandon}
                    className="flex-1 min-h-[44px] rounded-btn border border-border bg-card text-text text-base"
                  >
                    放弃
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAbandonConfirm(false); setRunning(true) }}
                    className="flex-1 min-h-[44px] rounded-btn bg-blue text-white text-base font-medium"
                  >
                    继续运动
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setRunning(r => !r)}
                  className="w-20 h-20 rounded-full bg-card border-2 border-border flex items-center justify-center"
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
                <p className="text-sm text-text-sub text-center mt-5">
                  {running ? '注意感受运动强度，保持能说话但不能唱歌的节奏' : '已暂停'}
                </p>
                {!running && (
                  <button
                    type="button"
                    onClick={() => setShowAbandonConfirm(true)}
                    className="mt-4 min-h-[44px] text-sm text-text-sub"
                  >
                    放弃本次运动
                  </button>
                )}
              </>
            )}

            {!showAbandonConfirm && (
              <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] px-4 pt-3 pb-6 bg-bg border-t border-border">
                <button
                  type="button"
                  onClick={handleFinish}
                  className="w-full min-h-[56px] bg-green text-white rounded-btn text-base font-medium"
                >
                  完成运动，记录反馈
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── STATE: FEEDBACK ──────────────────────────────────────────── */}
        {pageState === 'feedback' && (
          <div className="px-4 pt-4 pb-36 space-y-5">
            <h2 className="text-lg font-semibold text-text">记录本次运动</h2>

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
                        isSelected ? 'bg-blue border-blue'
                        : isTarget ? 'bg-blue-light border-blue'
                        : 'bg-card border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-base font-semibold ${isSelected ? 'text-white' : isTarget ? 'text-blue' : 'text-text'}`}>
                          {rpe.label}
                        </span>
                        {isTarget && (
                          <span className={`text-xs px-2 py-0.5 rounded-pill font-medium ${isSelected ? 'bg-white/20 text-white' : 'bg-blue text-white'}`}>✓ 目标区间</span>
                        )}
                      </div>
                      <p className={`text-sm mt-0.5 ${isSelected ? 'text-white/80' : 'text-text-sub'}`}>
                        {currentExerciseType === 'resistance' ? rpe.resistance : rpe.aerobic}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <p className="text-sm text-text-sub mb-2">运动中或结束后有无不适？</p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => { setNoDiscomfort(true); setAfterSymptoms([]); setShowAfterSymptoms(false) }}
                  className={`w-full min-h-[52px] px-4 rounded-card border text-left text-base transition-all ${
                    noDiscomfort ? 'bg-green-light border-2 border-green text-green-dark font-medium' : 'bg-card border-border text-text'
                  }`}
                >
                  没有不适，感觉良好
                </button>
                <button
                  type="button"
                  onClick={() => { setNoDiscomfort(false); setShowAfterSymptoms(true) }}
                  className={`w-full min-h-[52px] px-4 rounded-card border text-left text-base transition-all ${
                    showAfterSymptoms && afterSymptoms.length > 0 ? 'bg-orange-light border-2 border-orange text-orange font-medium' : 'bg-card border-border text-text'
                  }`}
                >
                  有些不适 {afterSymptoms.length > 0 && `（${afterSymptoms.join('、')}）`}
                </button>
                {showAfterSymptoms && !noDiscomfort && (
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
                  <p className="text-base font-medium text-text">{currentExerciseName}</p>
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
                  <p className="text-base font-medium text-text">第 {totalSessions} 次</p>
                </div>
              </div>
            </div>

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

            {prescriptionAdjusted && (
              <div className="bg-blue-light rounded-card p-4">
                <p className="text-sm font-semibold text-blue mb-1">处方已自动更新</p>
                <p className="text-sm text-text leading-relaxed">
                  根据近期运动反馈，{prescriptionAdjusted.signal === 'up'
                    ? '你已适应当前强度，处方已上调'
                    : '检测到疲劳信号，处方已适当下调'}。
                </p>
                <p className="text-sm text-text-sub mt-1">
                  新处方：{RPE_LABELS[prescriptionAdjusted.newRpe].label} 强度 · {prescriptionAdjusted.newDuration} 分钟
                </p>
              </div>
            )}

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
                setSelectedExerciseId(null)
                setPrescriptionAdjusted(null)
                setRpeActual(null)
                setAfterSymptoms([])
                setNoDiscomfort(false)
                setShowAfterSymptoms(false)
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
