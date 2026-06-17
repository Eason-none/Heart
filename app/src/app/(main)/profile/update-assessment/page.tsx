'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { syncToCloud } from '@/lib/sync'

const DIAGNOSIS_LABELS: Record<string, string> = {
  pci: 'PCI 术后',
  cabg: 'CABG 术后',
  mi_recovery: '心梗恢复期',
  stable_angina: '稳定型心绞痛',
  chd_no_surgery: '冠心病（无手术史）',
}

const MONTHS_LABELS: Record<string, string> = {
  '1': '1 个月以内',
  '3': '1–3 个月',
  '6': '3–6 个月',
  '12': '6–12 个月',
  '18': '12–24 个月',
  '999': '24 个月以上',
}

function NumberInput({ label, unit, min, max, hint, value, onChange }: {
  label: string; unit: string; min: number; max: number; hint?: string
  value: string; onChange: (v: string) => void
}) {
  const [touched, setTouched] = useState(false)
  const num = value !== '' ? parseFloat(value) : NaN
  const outOfRange = touched && !isNaN(num) && (num < min || num > max)
  return (
    <div>
      <p className="text-sm text-text-sub mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={e => {
            const raw = e.target.value
            if (raw !== '' && !/^\d*\.?\d*$/.test(raw)) return
            onChange(raw)
          }}
          onBlur={() => setTouched(true)}
          placeholder="请输入"
          className={`flex-1 h-11 px-3 rounded-btn border bg-white text-base outline-none focus:border-blue transition-colors ${outOfRange ? 'border-red' : 'border-border'}`}
        />
        <span className="text-text-sub text-sm w-8">{unit}</span>
      </div>
      {outOfRange && <p className="text-sm text-red mt-1">{hint ?? `请输入 ${min}–${max} 之间的数值`}</p>}
    </div>
  )
}

function isOutOfRange(val: string, min: number, max: number) {
  const n = parseFloat(val)
  return val !== '' && !isNaN(n) && (n < min || n > max)
}

export default function UpdateAssessmentPage() {
  const router = useRouter()
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [waist, setWaist] = useState('')
  const [smoking, setSmoking] = useState('')
  const [lockedFields, setLockedFields] = useState<Array<{ label: string; field: string; group: number; value: string }>>([])
  const [confirmModal, setConfirmModal] = useState<{ field: string; group: number } | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem('assessment_answers') || '{}')
      if (data.height) setHeight(String(data.height))
      if (data.weight) setWeight(String(data.weight))
      if (data.waist) setWaist(String(data.waist))
      if (data.smoking_status) setSmoking(data.smoking_status)

      const diagLabel = DIAGNOSIS_LABELS[data.diagnosis_type as string] || '未填写'
      const isChdNoSurgery = data.diagnosis_type === 'chd_no_surgery'
      const monthsLabel = isChdNoSurgery ? '' : (MONTHS_LABELS[String(data.months_since_surgery)] || '')
      const diagValue = isChdNoSurgery ? diagLabel : monthsLabel ? `${diagLabel} · ${monthsLabel}` : diagLabel

      const lvefValue = data.lvef_weak === true
        ? (typeof data.lvef === 'number' ? `泵血偏弱 · EF ${data.lvef}%` : '泵血偏弱（数值未填）')
        : (data.high_risk_q1 || data.high_risk_q2 || data.high_risk_q3 ? '有高危信号' : '已填写')

      const vsaqValue = data.vsaq_score ? `${data.vsaq_score} MET` : '未填写'

      setLockedFields([
        { label: '诊断类型 / 手术距今月数', field: 'diagnosis', group: 1, value: diagValue || '未填写' },
        { label: 'LVEF / 高危三问', field: 'lvef', group: 2, value: lvefValue },
        { label: 'VSAQ 功能储备', field: 'vsaq', group: 4, value: vsaqValue },
      ])
    } catch {}
  }, [])

  const hasChanges = !!(height || weight || waist || smoking)
  const hasRangeError =
    isOutOfRange(height, 100, 220) ||
    isOutOfRange(weight, 30, 200) ||
    isOutOfRange(waist, 40, 180)

  const handleSave = () => {
    try {
      const data = JSON.parse(localStorage.getItem('assessment_answers') || '{}')
      if (height) data.height = parseFloat(height)
      if (weight) data.weight = parseFloat(weight)
      if (waist) data.waist = parseFloat(waist)
      if (smoking) data.smoking_status = smoking
      localStorage.setItem('assessment_answers', JSON.stringify(data))
      syncToCloud()
    } catch {}
    setSaved(true)
    setTimeout(() => router.push('/profile'), 1200)
  }

  return (
    <div className="flex flex-col h-full bg-bg">
      <div className="flex-shrink-0 h-12 flex items-center gap-3 px-4 border-b border-border">
        <Link href="/profile" className="flex items-center min-h-[44px] min-w-[44px] -ml-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 19L8 12L15 5" stroke="#2C2A26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <h1 className="text-lg font-semibold text-text">更新个人信息</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-36 space-y-6">
        {/* Editable section */}
        <div>
          <p className="text-xs font-semibold text-text-sub uppercase tracking-wider mb-3">可直接修改</p>
          <div className="bg-card rounded-card p-4 space-y-4">
            <NumberInput
              label="身高"
              unit="cm"
              min={100}
              max={220}
              hint="单位是厘米（cm）——如身高 170 cm 请填 170，不要填 1.70"
              value={height}
              onChange={setHeight}
            />
            <NumberInput
              label="体重"
              unit="kg"
              min={30}
              max={200}
              hint="单位是千克（kg）——如习惯用斤，请将数值除以 2（如 140 斤 = 70 kg）"
              value={weight}
              onChange={setWeight}
            />
            <NumberInput
              label="腰围"
              unit="cm"
              min={40}
              max={180}
              hint="单位是厘米（cm），通常 60–120 cm，请勿填成英寸"
              value={waist}
              onChange={setWaist}
            />
            <div>
              <p className="text-sm text-text-sub mb-2">吸烟状况</p>
              <div className="flex gap-2">
                {[{ v: 'non_smoker', l: '不吸烟' }, { v: 'quit', l: '已戒烟' }, { v: 'smoker', l: '吸烟' }].map(opt => (
                  <button
                    key={opt.v}
                    type="button"
                    onClick={() => setSmoking(opt.v)}
                    className={`flex-1 min-h-[44px] rounded-btn border text-sm font-medium transition-all ${
                      smoking === opt.v ? 'bg-blue-light border-blue text-blue' : 'bg-white border-border text-text'
                    }`}
                  >
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Locked section */}
        {lockedFields.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-text-sub uppercase tracking-wider mb-3">
              修改以下项目需重新填写相关问题
            </p>
            <div className="bg-card rounded-card divide-y divide-border">
              {lockedFields.map(f => (
                <div key={f.field} className="flex items-center px-4 py-3">
                  <div className="flex-1">
                    <p className="text-base text-text">{f.label}</p>
                    <p className="text-sm text-text-sub">{f.value}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConfirmModal({ field: f.label, group: f.group })}
                    className="min-h-[44px] flex items-center gap-1 text-sm text-text-sub"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="11" width="18" height="11" rx="2" stroke="#888780" strokeWidth="1.8" />
                      <path d="M7 11V7C7 5 9 3 12 3C15 3 17 5 17 7V11" stroke="#888780" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                    修改
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 bg-bg border-t border-border px-4 pt-3 pb-6">
        {saved ? (
          <div className="w-full min-h-[56px] flex items-center justify-center text-green text-base font-medium">
            ✓ 已保存
          </div>
        ) : (
          <Button onClick={handleSave} disabled={!hasChanges || hasRangeError}>
            保存修改
          </Button>
        )}
      </div>

      {confirmModal && (
        <div className="absolute inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-bg rounded-t-2xl px-6 pt-6 pb-8 w-full max-w-[390px]">
            <h3 className="text-lg font-bold text-text mb-2">需要重新填写相关问题</h3>
            <p className="text-base text-text leading-relaxed mb-6">
              修改「{confirmModal.field}」需要重新填写第 {confirmModal.group} 部分的相关问题。确认后会跳转到对应问题，完成后自动返回。
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="flex-1 min-h-[52px] bg-card rounded-btn border border-border text-base font-medium text-text"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => { setConfirmModal(null); router.push('/assessment?from=update') }}
                className="flex-1 min-h-[52px] bg-blue rounded-btn text-base font-medium text-white"
              >
                继续
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
