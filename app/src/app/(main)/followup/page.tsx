'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'

type FollowupType = 'weekly' | 'monthly'

const EXERCISE_SYMPTOMS = ['胸痛', '胸闷', '心慌', '头晕', '呼吸困难']

export default function FollowupPage() {
  const router = useRouter()
  const [followupType] = useState<FollowupType>('weekly')
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [submitted, setSubmitted] = useState(false)
  const [smokingRelevant, setSmokingRelevant] = useState(false)

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem('assessment_answers') || '{}')
      const s = data.smoking_status
      setSmokingRelevant(s === 'smoker' || s === 'quit')
    } catch {}
  }, [])

  const set = (key: string, value: unknown) =>
    setAnswers(prev => ({ ...prev, [key]: value }))

  const toggleSymptom = (s: string) => {
    const current = (answers.exercise_symptoms as string[]) || []
    if (s === 'none') { set('exercise_symptoms', ['none']); return }
    const filtered = current.filter(x => x !== 'none')
    set('exercise_symptoms', filtered.includes(s) ? filtered.filter(x => x !== s) : [...filtered, s])
  }

  const isSelected = (key: string, val: string) => {
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

  const handleSubmit = () => {
    try {
      const record = {
        ...answers,
        followup_type: followupType,
        followup_date: new Date().toISOString(),
      }
      const existing = JSON.parse(localStorage.getItem('followup_records') || '[]')
      localStorage.setItem('followup_records', JSON.stringify([...existing, record]))
    } catch {}
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col h-full bg-bg">
        <div className="flex-shrink-0 h-11 flex items-center justify-between px-5">
          <span className="text-[15px] font-semibold text-text">9:41</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-green-light flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17L4 12" stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-text">随访已完成</h2>
          <p className="text-base text-text-sub leading-relaxed">感谢你的记录，系统已更新你的康复状态。</p>
          <Button onClick={() => router.push('/home')}>返回首页</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-bg">
      <div className="flex-shrink-0 h-11 flex items-center justify-between px-5">
        <span className="text-[15px] font-semibold text-text">9:41</span>
      </div>
      <div className="flex-shrink-0 h-12 flex items-center gap-3 px-4 border-b border-border">
        <Link href="/home" className="flex items-center min-h-[44px] min-w-[44px] -ml-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 19L8 12L15 5" stroke="#2C2A26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <div>
          <h1 className="text-lg font-semibold text-text">
            {followupType === 'weekly' ? '每周随访' : '每月完整随访'}
          </h1>
          <p className="text-xs text-text-sub">
            预计约 {followupType === 'weekly' ? '2' : '5'} 分钟
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-36 space-y-6">
        {/* W1 */}
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

        {/* W2 */}
        <div>
          <p className="text-base font-medium text-text mb-3">运动时或运动后有没有出现不适？</p>
          <div className="space-y-2">
            {EXERCISE_SYMPTOMS.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSymptom(s)}
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
              onClick={() => toggleSymptom('none')}
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

        {/* W3 */}
        <div>
          <p className="text-base font-medium text-text mb-3">这周睡眠整体怎么样？</p>
          <SingleSelect qKey="sleep_quality" options={[
            { value: 'good', label: '好' },
            { value: 'average', label: '一般' },
            { value: 'poor', label: '很差' },
          ]} />
        </div>

        {/* W4 */}
        <div>
          <p className="text-base font-medium text-text mb-3">这周情绪整体怎么样？</p>
          <SingleSelect qKey="mood" options={[
            { value: 'good', label: '还不错' },
            { value: 'okay', label: '还可以' },
            { value: 'low', label: '比较低落' },
          ]} />
        </div>

        {/* W5 */}
        <div>
          <p className="text-base font-medium text-text mb-3">这周有没有便秘的困扰？</p>
          <SingleSelect qKey="constipation" options={[
            { value: 'none', label: '没有' },
            { value: 'occasional', label: '偶尔' },
            { value: 'notable', label: '比较明显' },
          ]} />
        </div>

        {/* W6 */}
        <div>
          <p className="text-base font-medium text-text mb-3">本周收缩压（高压）最高是多少？</p>
          <SingleSelect qKey="bp_reading" options={[
            { value: 'not_measured', label: '没有测' },
            { value: 'normal', label: '低于 130（良好）' },
            { value: 'elevated', label: '130–139（需注意）' },
            { value: 'high', label: '140 及以上（请联系医生）' },
          ]} />
        </div>

        {/* W7 */}
        <div>
          <p className="text-base font-medium text-text mb-3">本周体重有没有明显变化？</p>
          <SingleSelect qKey="weight_change" options={[
            { value: 'stable', label: '稳定（±1 kg 内）' },
            { value: 'gained', label: '增加超过 1 kg' },
            { value: 'lost', label: '减轻超过 1 kg' },
          ]} />
        </div>

        {/* W8 — only for users with smoking history (current or quit) */}
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
      </div>

      <div className="flex-shrink-0 bg-bg border-t border-border px-4 pt-3 pb-6">
        <Button
          onClick={handleSubmit}
          disabled={
            !answers.exercise_count ||
            !answers.exercise_symptoms ||
            !answers.sleep_quality ||
            !answers.mood ||
            !answers.constipation ||
            !answers.bp_reading ||
            !answers.weight_change ||
            (smokingRelevant && !answers.smoking_check)
          }
        >
          提交随访
        </Button>
      </div>
    </div>
  )
}
