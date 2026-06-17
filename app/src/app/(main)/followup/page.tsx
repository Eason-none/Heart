'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { applyPrescriptionAdjustment } from '@/lib/exercise/intensity'
import { syncToCloud } from '@/lib/sync'
import type { RPELevel, AdjustmentSignal } from '@/types'

type FollowupType = 'weekly' | 'monthly'

const EXERCISE_SYMPTOMS = ['胸痛', '胸闷', '心慌', '头晕', '呼吸困难']
const DANGER_SYMPTOMS = ['胸痛', '胸闷', '心慌', '头晕', '呼吸困难']

const PHQ9_ITEMS = [
  '做事时提不起劲或没有兴趣',
  '感到心情低落、沮丧或绝望',
  '入睡困难、睡不安稳或睡眠过多',
  '感觉疲倦或没有活力',
  '食欲不振或进食过多',
  '觉得自己很糟糕，或觉得自己是失败者',
  '对事物专注有困难（如读报纸或看电视）',
  '动作或说话速度缓慢，或反之，比平时烦躁坐立不安',
  '有不如死掉或用某种方式伤害自己的念头',
]

const GAD7_ITEMS = [
  '感觉紧张、焦虑或烦躁',
  '不能停止或控制担忧',
  '对各种事情担忧过多',
  '很难放松下来',
  '由于不安而无法静坐',
  '变得容易烦恼或急躁',
  '感到似乎将有可怕的事情发生而害怕',
]

const PSYCH_OPTIONS = [
  { value: 0, label: '完全不会' },
  { value: 1, label: '好几天' },
  { value: 2, label: '一半以上天数' },
  { value: 3, label: '几乎每天' },
]

const VSAQ_MONTHLY = [
  { score: 1, label: '只能做轻度家务（扫地、洗碗）' },
  { score: 3, label: '可以平地慢走（4 km/h）' },
  { score: 5, label: '可以快走（6 km/h）或爬 1 层楼梯' },
  { score: 7, label: '可以骑自行车（平路）或慢跑短距离' },
  { score: 9, label: '可以较快骑车或爬较陡坡道' },
  { score: 11, label: '可以中速跑步或打球类运动' },
  { score: 13, label: '可以进行高强度运动（跑步 > 10 km/h）' },
]

export default function FollowupPage() {
  const router = useRouter()
  const [followupType, setFollowupType] = useState<FollowupType>('weekly')
  const [isFirstFollowup, setIsFirstFollowup] = useState(false)
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [submitted, setSubmitted] = useState(false)
  const [smokingRelevant, setSmokingRelevant] = useState(false)
  const [isMediumRisk, setIsMediumRisk] = useState(false)
  const [isHypertension, setIsHypertension] = useState(false)

  // Completion state
  const [exercisePauseReason, setExercisePauseReason] = useState<string | null>(null)
  const [layer3Adj, setLayer3Adj] = useState<{ signal: 'up' | 'down'; newRpe: RPELevel; newDuration: number } | null>(null)
  const [phqSeverity, setPhqSeverity] = useState<'mild' | 'moderate' | 'severe' | null>(null)

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem('assessment_answers') || '{}')
      const s = data.smoking_status
      setSmokingRelevant(s === 'smoker' || s === 'quit')
      setIsMediumRisk(data.risk_level === 'medium')
      setIsHypertension(Array.isArray(data.comorbidities) && (data.comorbidities as string[]).includes('hypertension'))

      const records = JSON.parse(localStorage.getItem('followup_records') || '[]')
      setIsFirstFollowup(records.length === 0)
      // Every 4th followup (index 3, 7, 11…) is monthly
      setFollowupType(records.length > 0 && records.length % 4 === 3 ? 'monthly' : 'weekly')
    } catch {}
  }, [])

  const set = (key: string, value: unknown) =>
    setAnswers(prev => ({ ...prev, [key]: value }))

  const toggleList = (key: string, val: string, exclusiveNone?: string) => {
    const cur = (answers[key] as string[]) || []
    if (val === exclusiveNone) { set(key, [exclusiveNone]); return }
    const filtered = cur.filter(x => x !== exclusiveNone)
    set(key, filtered.includes(val) ? filtered.filter(x => x !== val) : [...filtered, val])
  }

  const isSelected = (key: string, val: string | number) => {
    const v = answers[key]
    if (Array.isArray(v)) return v.includes(val)
    return v === val
  }

  function SingleSelect({ qKey, options }: { qKey: string; options: { value: string; label: string }[] }) {
    return (
      <div className="flex flex-col gap-2">
        {options.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => set(qKey, opt.value)}
            className={`w-full min-h-[52px] px-4 rounded-card border text-left text-base transition-all ${
              isSelected(qKey, opt.value)
                ? 'bg-blue-light border-2 border-blue text-blue font-medium'
                : 'bg-card border-border text-text'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    )
  }

  function PsychItem({ qKey, label }: { qKey: string; label: string }) {
    return (
      <div className="py-3 border-b border-border last:border-b-0">
        <p className="text-sm text-text mb-2 leading-snug">{label}</p>
        <div className="grid grid-cols-2 gap-1.5">
          {PSYCH_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set(qKey, opt.value)}
              className={`min-h-[44px] rounded-card border text-sm font-medium transition-all ${
                answers[qKey] === opt.value
                  ? 'bg-blue-light border-2 border-blue text-blue'
                  : 'bg-card border-border text-text-sub'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  function runLayer3(
    records: Array<Record<string, unknown>>,
    px: { duration_minutes: number; rpe_target: RPELevel; last_adjustment_at?: string }
  ): { signal: 'up' | 'down'; rpe_target: RPELevel; duration_minutes: number } | null {
    const weekly = records.filter(r => r.followup_type === 'weekly').slice(-2)
    if (weekly.length < 2) return null

    let signal: AdjustmentSignal = 'maintain'

    const bothMoodLow = weekly.every(r => r.mood === 'low')
    const bothSleepPoor = weekly.every(r => r.sleep_quality === 'poor')
    if (bothMoodLow || bothSleepPoor) {
      signal = 'down'
    } else {
      const bothGoodExercise = weekly.every(r => Number(r.exercise_count) >= 3)
      const bothGoodMoodSleep = weekly.every(r => r.mood !== 'low' && r.sleep_quality !== 'poor')
      const cooledDown = !px.last_adjustment_at ||
        (Date.now() - new Date(px.last_adjustment_at).getTime()) / 86400000 >= 14
      if (bothGoodExercise && bothGoodMoodSleep && cooledDown) signal = 'up'
    }

    if (signal === 'maintain') return null

    const adjusted = applyPrescriptionAdjustment(
      { rpe_target: px.rpe_target, duration_minutes: px.duration_minutes },
      signal
    )
    if (adjusted.rpe_target === px.rpe_target && adjusted.duration_minutes === px.duration_minutes) return null
    return { signal: signal as 'up' | 'down', ...adjusted }
  }

  const handleSubmit = () => {
    try {
      const data = JSON.parse(localStorage.getItem('assessment_answers') || '{}')
      const px = data.prescription || {}

      // ── PHQ-9 / GAD-7 scoring (first followup) ───────────────────────────────
      let phq9Score: number | undefined
      let gad7Score: number | undefined
      let severity: 'mild' | 'moderate' | 'severe' | undefined

      if (isFirstFollowup) {
        phq9Score = PHQ9_ITEMS.reduce((s, _, i) => s + (Number(answers[`phq9_${i}`]) || 0), 0)
        gad7Score = GAD7_ITEMS.reduce((s, _, i) => s + (Number(answers[`gad7_${i}`]) || 0), 0)
        const maxScore = Math.max(phq9Score, gad7Score)
        if (maxScore >= 15) severity = 'severe'
        else if (maxScore >= 10) severity = 'moderate'
        else if (maxScore >= 5) severity = 'mild'
        if (severity) setPhqSeverity(severity)
        if (severity) data.psych_severity = severity
      }

      // ── Save record ───────────────────────────────────────────────────────────
      const record: Record<string, unknown> = {
        ...answers,
        followup_type: followupType,
        followup_date: new Date().toISOString(),
      }
      if (phq9Score !== undefined) {
        record.phq9_score = phq9Score
        record.gad7_score = gad7Score
        record.psych_severity = severity ?? 'normal'
      }

      const existing = JSON.parse(localStorage.getItem('followup_records') || '[]')
      const newRecords = [...existing, record]
      localStorage.setItem('followup_records', JSON.stringify(newRecords))

      // ── Safety locks ──────────────────────────────────────────────────────────
      let pauseReason: string | null = null

      if (followupType === 'monthly') {
        // M3: new symptoms + unvisited + danger symptoms
        if (answers.new_symptoms === 'unvisited') {
          const dangerous = (answers.new_danger_symptoms as string[] || [])
            .filter(s => DANGER_SYMPTOMS.includes(s))
          if (dangerous.length > 0) {
            pauseReason = '随访显示有新症状且尚未就医，有氧和抗阻运动暂停，请先联系医生。'
          }
        }
        // M4: frequent medication miss
        if (answers.medication_adherence === 'frequent_miss') {
          pauseReason = pauseReason || '随访显示用药依从性不足，有氧和抗阻运动暂停，请先咨询医生。'
        }
        // M3 resolved: visited doctor → clear symptom pause
        if (answers.new_symptoms === 'visited') {
          const existing = JSON.parse(localStorage.getItem('exercise_pause') || 'null')
          if (existing?.reason?.includes('症状')) localStorage.removeItem('exercise_pause')
        }
        // M4 resolved: adherence OK → clear medication pause
        if (answers.medication_adherence && answers.medication_adherence !== 'frequent_miss') {
          const existing = JSON.parse(localStorage.getItem('exercise_pause') || 'null')
          if (existing?.reason?.includes('用药')) localStorage.removeItem('exercise_pause')
        }
      }

      // PHQ-9 severe → pause
      if (severity === 'severe') {
        pauseReason = pauseReason || '心理评估提示需要关注，运动功能已暂停，请尽快与医生或咨询师联系。'
      }

      if (pauseReason) {
        localStorage.setItem('exercise_pause', JSON.stringify({ reason: pauseReason, set_at: new Date().toISOString() }))
        setExercisePauseReason(pauseReason)
      }

      // ── VSAQ retest → update vsaq_score ──────────────────────────────────────
      if (followupType === 'monthly' && answers.vsaq_retest) {
        const newVsaq = Number(answers.vsaq_retest)
        if (newVsaq) data.vsaq_score = newVsaq
      }

      // ── Layer 3 prescription adjustment ──────────────────────────────────────
      const adj = runLayer3(newRecords, {
        duration_minutes: px.duration_minutes ?? 25,
        rpe_target: (px.rpe_target ?? 2) as RPELevel,
        last_adjustment_at: px.last_adjustment_at,
      })
      if (adj) {
        data.prescription = {
          ...px,
          duration_minutes: adj.duration_minutes,
          rpe_target: adj.rpe_target,
          last_adjustment_at: new Date().toISOString(),
        }
        setLayer3Adj({ signal: adj.signal, newRpe: adj.rpe_target, newDuration: adj.duration_minutes })
      }

      localStorage.setItem('assessment_answers', JSON.stringify(data))
      syncToCloud()
    } catch {}
    setSubmitted(true)
  }

  // ── Validation ──────────────────────────────────────────────────────────────
  const weeklyValid =
    !!answers.exercise_count &&
    Array.isArray(answers.exercise_symptoms) && (answers.exercise_symptoms as string[]).length > 0 &&
    !!answers.sleep_quality && !!answers.mood && !!answers.constipation &&
    (!isHypertension || !!answers.bp_reading) &&
    (!smokingRelevant || !!answers.smoking_check)

  const phq9Valid = !isFirstFollowup || PHQ9_ITEMS.every((_, i) => answers[`phq9_${i}`] !== undefined)
  const gad7Valid = !isFirstFollowup || GAD7_ITEMS.every((_, i) => answers[`gad7_${i}`] !== undefined)

  const m3Valid = followupType !== 'monthly' || (
    !!answers.new_symptoms &&
    (answers.new_symptoms !== 'unvisited' || (answers.new_danger_symptoms as string[] || []).length > 0) &&
    (answers.new_symptoms !== 'visited' || !!answers.doctor_adjusted)
  )
  const m4Valid = followupType !== 'monthly' || !!answers.medication_adherence
  const vsaqValid = followupType !== 'monthly' || !!answers.vsaq_retest
  const weightValid = followupType !== 'monthly' || !!answers.weight_change
  const doctorContactValid = followupType !== 'monthly' || !isMediumRisk || !!answers.doctor_contact

  const submitDisabled = !weeklyValid || !phq9Valid || !gad7Valid || !m3Valid || !m4Valid || !vsaqValid || !weightValid || !doctorContactValid

  // ── Completion screen ───────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="flex flex-col h-full bg-bg">
        <div className="flex-1 overflow-y-auto px-4 pt-6 pb-8 space-y-4">
          <div className="flex flex-col items-center text-center gap-3 pb-2">
            <div className="w-16 h-16 rounded-full bg-green-light flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17L4 12" stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-text">记录已提交</h2>
          </div>

          {isFirstFollowup && Number(answers['phq9_8'] ?? -1) >= 1 && (
            <div className="bg-red-light rounded-card p-4 border border-red">
              <p className="text-sm font-semibold text-red mb-1">需要关注</p>
              <p className="text-sm text-text leading-relaxed">
                你在评估中提到了伤害自己的想法，请尽快与医生或咨询师沟通。24小时心理援助热线：<span className="font-semibold">400-161-9995</span>
              </p>
            </div>
          )}

          {phqSeverity && (
            <div className={`rounded-card p-4 ${
              phqSeverity === 'severe' ? 'bg-red-light'
              : phqSeverity === 'moderate' ? 'bg-orange-light'
              : 'bg-blue-light'
            }`}>
              <p className={`text-sm font-semibold mb-1 ${
                phqSeverity === 'severe' ? 'text-red'
                : phqSeverity === 'moderate' ? 'text-orange'
                : 'text-blue'
              }`}>
                心理基线评估结果
              </p>
              <p className="text-sm text-text leading-relaxed">
                {phqSeverity === 'severe'
                  ? '评估提示需要重点关注情绪状态，请尽快与医生或心理咨询师沟通。运动功能已暂时暂停。'
                  : phqSeverity === 'moderate'
                  ? '评估提示中度情绪困扰，建议与医生或咨询师沟通，运动功能不受影响。'
                  : '评估提示轻度情绪波动，保持运动节奏对情绪康复很有帮助。'}
              </p>
            </div>
          )}

          {exercisePauseReason && (
            <div className="bg-orange-light rounded-card p-4">
              <p className="text-sm font-semibold text-orange mb-1">运动功能暂停</p>
              <p className="text-sm text-text leading-relaxed">{exercisePauseReason}</p>
              <p className="text-xs text-text-sub mt-2">解决后，在下次随访中完成相应题目即可自动恢复。</p>
            </div>
          )}

          {layer3Adj && (
            <div className="bg-blue-light rounded-card p-4">
              <p className="text-sm font-semibold text-blue mb-1">处方已根据随访数据更新</p>
              <p className="text-sm text-text leading-relaxed">
                {layer3Adj.signal === 'up'
                  ? '近两周运动情况良好，处方已适当上调。'
                  : '近两周睡眠或情绪欠佳，处方已适当下调，优先保证休息质量。'}
              </p>
              <p className="text-xs text-text-sub mt-1">
                新处方：{layer3Adj.newDuration} 分钟 · RPE {layer3Adj.newRpe}
              </p>
            </div>
          )}

          {!phqSeverity && !exercisePauseReason && !layer3Adj && (
            <p className="text-base text-text-sub text-center leading-relaxed">系统已更新你的康复状态。</p>
          )}

          <Button onClick={() => router.push('/home')}>返回首页</Button>
        </div>
      </div>
    )
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-bg">
      <div className="flex-shrink-0 h-12 flex items-center gap-3 px-4 border-b border-border">
        <Link href="/home" className="flex items-center min-h-[44px] min-w-[44px] -ml-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 19L8 12L15 5" stroke="#2C2A26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <div>
          <h1 className="text-lg font-semibold text-text">
            {followupType === 'monthly' ? '每月完整记录' : isFirstFollowup ? '首次健康记录' : '每周健康记录'}
          </h1>
          <p className="text-xs text-text-sub">
            预计约 {followupType === 'monthly' ? '8' : isFirstFollowup ? '5' : '2'} 分钟
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-36 space-y-6">

        {/* ── PHQ-9（首次随访）─────────────────────────────────────────────── */}
        {isFirstFollowup && (
          <div>
            <div className="bg-blue-light rounded-card p-3 mb-4">
              <p className="text-sm font-semibold text-blue mb-1">心理基线评估（PHQ-9）</p>
              <p className="text-sm text-text leading-relaxed">
                以下 9 个问题帮助我们了解你的情绪基线，用于后续个性化支持。请根据<span className="font-medium">过去两周</span>的感受回答。其中有些问题措辞较为直接，这是临床标准筛查的一部分，请如实填写。
              </p>
            </div>
            <div className="bg-card rounded-card px-4">
              {PHQ9_ITEMS.map((item, i) => (
                <PsychItem key={i} qKey={`phq9_${i}`} label={`${i + 1}. ${item}`} />
              ))}
            </div>
            {Number(answers['phq9_8'] ?? -1) >= 1 && (
              <div className="bg-red-light rounded-card p-4 mt-3">
                <p className="text-sm font-semibold text-red mb-1">重要提示</p>
                <p className="text-sm text-text leading-relaxed">
                  你刚才提到了一些关于伤害自己的想法，这种感受值得认真对待。请尽快与你的医生或心理咨询师沟通。如需立即帮助，可拨打心理援助热线：<span className="font-semibold">400-161-9995</span>（24小时）
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── GAD-7（首次随访）──────────────────────────────────────────────── */}
        {isFirstFollowup && (
          <div>
            <div className="bg-blue-light rounded-card p-3 mb-4">
              <p className="text-sm font-semibold text-blue mb-1">焦虑筛查（GAD-7）</p>
              <p className="text-sm text-text leading-relaxed">
                同样基于<span className="font-medium">过去两周</span>的感受回答。
              </p>
            </div>
            <div className="bg-card rounded-card px-4">
              {GAD7_ITEMS.map((item, i) => (
                <PsychItem key={i} qKey={`gad7_${i}`} label={`${i + 1}. ${item}`} />
              ))}
            </div>
          </div>
        )}

        {/* ── W1 运动次数 ────────────────────────────────────────────────────── */}
        <div>
          <p className="text-base font-medium text-text mb-3">本周运动了几次？</p>
          <SingleSelect qKey="exercise_count" options={[
            { value: '0', label: '0 次' },
            { value: '1', label: '1 次' },
            { value: '2', label: '2 次' },
            { value: '3', label: '3 次' },
            { value: '4', label: '4 次及以上' },
          ]} />
        </div>

        {/* ── W2 运动不适 ────────────────────────────────────────────────────── */}
        <div>
          <p className="text-base font-medium text-text mb-3">运动时或运动后有没有出现不适？</p>
          <div className="space-y-2">
            {EXERCISE_SYMPTOMS.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => toggleList('exercise_symptoms', s, 'none')}
                className={`w-full min-h-[52px] px-4 rounded-card border text-left text-base transition-all ${
                  isSelected('exercise_symptoms', s)
                    ? 'bg-orange-light border-2 border-orange text-orange font-medium'
                    : 'bg-card border-border text-text'
                }`}
              >
                {s}
              </button>
            ))}
            <button
              type="button"
              onClick={() => toggleList('exercise_symptoms', 'none', 'none')}
              className={`w-full min-h-[52px] px-4 rounded-card border text-left text-base transition-all ${
                isSelected('exercise_symptoms', 'none')
                  ? 'bg-green-light border-2 border-green text-green-dark font-medium'
                  : 'bg-card border-border text-text'
              }`}
            >
              没有不适
            </button>
          </div>
        </div>

        {/* ── W3 睡眠 ───────────────────────────────────────────────────────── */}
        <div>
          <p className="text-base font-medium text-text mb-3">这周睡眠整体怎么样？</p>
          <SingleSelect qKey="sleep_quality" options={[
            { value: 'good', label: '好' },
            { value: 'average', label: '一般' },
            { value: 'poor', label: '很差' },
          ]} />
        </div>

        {/* ── W4 情绪 ───────────────────────────────────────────────────────── */}
        <div>
          <p className="text-base font-medium text-text mb-3">这周情绪整体怎么样？</p>
          <SingleSelect qKey="mood" options={[
            { value: 'good', label: '还不错' },
            { value: 'okay', label: '还可以' },
            { value: 'low', label: '比较低落' },
          ]} />
        </div>

        {/* ── W5 便秘 ───────────────────────────────────────────────────────── */}
        <div>
          <p className="text-base font-medium text-text mb-3">这周有没有便秘的困扰？</p>
          <SingleSelect qKey="constipation" options={[
            { value: 'none', label: '没有' },
            { value: 'occasional', label: '偶尔' },
            { value: 'notable', label: '比较明显' },
          ]} />
        </div>

        {/* ── W6 血压（仅高血压用户）───────────────────────────────────────── */}
        {isHypertension && (
          <div>
            <p className="text-base font-medium text-text mb-3">本周收缩压（高压）最高是多少？</p>
            <SingleSelect qKey="bp_reading" options={[
              { value: 'not_measured', label: '没有测' },
              { value: 'normal', label: '低于 130（良好）' },
              { value: 'elevated', label: '130–139（需注意）' },
              { value: 'high', label: '140 及以上（请联系医生）' },
            ]} />
          </div>
        )}

        {/* ── W8 吸烟 ───────────────────────────────────────────────────────── */}
        {smokingRelevant && (
          <div>
            <p className="text-base font-medium text-text mb-3">本周有没有吸烟？</p>
            <SingleSelect qKey="smoking_check" options={[
              { value: 'none', label: '没有' },
              { value: 'few', label: '吸了（1–2 支）' },
              { value: 'more', label: '吸了（较多）' },
            ]} />
          </div>
        )}

        {/* ── 每月随访附加题 ──────────────────────────────────────────────────── */}
        {followupType === 'monthly' && (
          <>
            <div className="h-px bg-border" />
            <p className="text-sm font-semibold text-text-sub">以下为每月额外评估</p>

            {/* M1 VSAQ 复测 */}
            <div>
              <p className="text-base font-medium text-text mb-1">本月运动能力评估</p>
              <p className="text-sm text-text-sub mb-3">选择你现在能完成的最高强度活动</p>
              <div className="flex flex-col gap-2">
                {VSAQ_MONTHLY.map(opt => (
                  <button
                    key={opt.score}
                    type="button"
                    onClick={() => set('vsaq_retest', String(opt.score))}
                    className={`w-full min-h-[52px] px-4 rounded-card border text-left text-base transition-all ${
                      isSelected('vsaq_retest', String(opt.score))
                        ? 'bg-blue-light border-2 border-blue text-blue font-medium'
                        : 'bg-card border-border text-text'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* M-体重变化 */}
            <div>
              <p className="text-base font-medium text-text mb-3">本月体重有没有明显变化？</p>
              <SingleSelect qKey="weight_change" options={[
                { value: 'stable', label: '稳定（±1 kg 内）' },
                { value: 'gained', label: '增加超过 1 kg' },
                { value: 'lost', label: '减轻超过 1 kg' },
              ]} />
            </div>

            {/* M2 椅子站立（可选） */}
            <div>
              <p className="text-base font-medium text-text mb-1">椅子站立测试（可跳过）</p>
              <p className="text-sm text-text-sub mb-3">从椅子上连续站起坐下，30 秒内能完成几次？双手交叉放胸前，不扶椅背，以正常速度完成。</p>
              <div className="flex gap-3 items-center">
                <button type="button" onClick={() => set('chair_stand', Math.max(0, (Number(answers.chair_stand) || 0) - 1))} className="w-10 h-10 rounded-full bg-card border border-border text-xl text-text flex items-center justify-center">-</button>
                <span className="text-xl font-semibold text-text w-12 text-center">{answers.chair_stand !== undefined ? String(answers.chair_stand) : '—'}</span>
                <button type="button" onClick={() => set('chair_stand', (Number(answers.chair_stand) || 0) + 1)} className="w-10 h-10 rounded-full bg-card border border-border text-xl text-text flex items-center justify-center">+</button>
                <span className="text-sm text-text-sub">次</span>
                {answers.chair_stand !== undefined && (
                  <button type="button" onClick={() => set('chair_stand', undefined)} className="text-sm text-text-sub ml-2">清除</button>
                )}
              </div>
            </div>

            {/* M3 新发症状 */}
            <div>
              <p className="text-base font-medium text-text mb-3">本月有没有出现新的不适症状或就医情况？</p>
              <SingleSelect qKey="new_symptoms" options={[
                { value: 'none', label: '没有，一切正常' },
                { value: 'unvisited', label: '有新症状，还没有就医' },
                { value: 'visited', label: '有症状，已经就医复诊' },
              ]} />

              {answers.new_symptoms === 'unvisited' && (
                <div className="mt-3">
                  <p className="text-sm text-text-sub mb-2">有以下哪些症状？（可多选）</p>
                  <div className="space-y-2">
                    {DANGER_SYMPTOMS.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleList('new_danger_symptoms', s, 'none_above')}
                        className={`w-full min-h-[48px] px-4 rounded-card border text-left text-base transition-all ${
                          isSelected('new_danger_symptoms', s)
                            ? 'bg-red-light border-2 border-red text-red font-medium'
                            : 'bg-card border-border text-text'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => toggleList('new_danger_symptoms', 'none_above', 'none_above')}
                      className={`w-full min-h-[48px] px-4 rounded-card border text-left text-base transition-all ${
                        isSelected('new_danger_symptoms', 'none_above')
                          ? 'bg-green-light border-2 border-green text-green-dark font-medium'
                          : 'bg-card border-border text-text'
                      }`}
                    >
                      以上都没有（其他轻微不适）
                    </button>
                  </div>
                </div>
              )}

              {answers.new_symptoms === 'visited' && (
                <div className="mt-3">
                  <p className="text-sm text-text-sub mb-2">医生有没有调整运动或用药建议？</p>
                  <SingleSelect qKey="doctor_adjusted" options={[
                    { value: 'no', label: '没有调整，继续当前方案' },
                    { value: 'yes', label: '有调整，需要更新记录' },
                  ]} />
                  {answers.doctor_adjusted === 'yes' && (
                    <p className="text-sm text-text-sub mt-2 bg-blue-light rounded-card p-3">
                      请前往「我的」→「更新评估信息」同步医生的新建议。
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* M4 用药依从性 */}
            <div>
              <p className="text-base font-medium text-text mb-3">本月药物服用情况怎么样？</p>
              <SingleSelect qKey="medication_adherence" options={[
                { value: 'good', label: '按时服药，没有漏服' },
                { value: 'occasional_miss', label: '偶尔漏服（1–2 次）' },
                { value: 'frequent_miss', label: '漏服较多（多次）' },
              ]} />
            </div>

            {/* M6 中危：是否联系主治医生 */}
            {isMediumRisk && (
              <div>
                <p className="text-base font-medium text-text mb-3">本月有没有联系过主治医生？</p>
                <SingleSelect qKey="doctor_contact" options={[
                  { value: 'yes', label: '有，已经联系' },
                  { value: 'planned', label: '计划近期联系' },
                  { value: 'no', label: '暂时没有' },
                ]} />
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex-shrink-0 bg-bg border-t border-border px-4 pt-3 pb-6">
        <Button onClick={handleSubmit} disabled={submitDisabled}>
          提交记录
        </Button>
      </div>
    </div>
  )
}
