'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function UpdateAssessmentPage() {
  const router = useRouter()
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [waist, setWaist] = useState('')
  const [smoking, setSmoking] = useState('')
  const [confirmModal, setConfirmModal] = useState<{ field: string; group: number } | null>(null)
  const [saved, setSaved] = useState(false)

  const hasChanges = height || weight || waist || smoking

  const handleSave = () => {
    // In production: update DB
    setSaved(true)
    setTimeout(() => router.push('/profile'), 1200)
  }

  const LOCKED_FIELDS = [
    { label: '诊断类型 / 手术距今月数', field: 'diagnosis', group: 1, value: 'PCI 术后 · 约 6 个月' },
    { label: 'LVEF / 高危三问', field: 'lvef', group: 2, value: '已填写' },
    { label: 'VSAQ 功能储备', field: 'vsaq', group: 4, value: '5 MET' },
  ]

  return (
    <div className="flex flex-col h-full bg-bg">
      <div className="flex-shrink-0 h-11 flex items-center justify-between px-5">
        <span className="text-[15px] font-semibold text-text">9:41</span>
      </div>
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
            {[
              { label: '身高', state: height, setState: setHeight, unit: 'cm', min: 100, max: 220 },
              { label: '体重', state: weight, setState: setWeight, unit: 'kg', min: 30, max: 200 },
              { label: '腰围', state: waist, setState: setWaist, unit: 'cm', min: 40, max: 180 },
            ].map(f => (
              <div key={f.label}>
                <p className="text-sm text-text-sub mb-1">{f.label}</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={f.state}
                    onChange={e => f.setState(e.target.value)}
                    placeholder="请输入"
                    className="flex-1 h-11 px-3 rounded-btn border border-border bg-white text-base outline-none focus:border-blue"
                  />
                  <span className="text-text-sub text-sm w-8">{f.unit}</span>
                </div>
              </div>
            ))}
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
        <div>
          <p className="text-xs font-semibold text-text-sub uppercase tracking-wider mb-3">
            修改以下项目需重新填写相关问题
          </p>
          <div className="bg-card rounded-card divide-y divide-border">
            {LOCKED_FIELDS.map(f => (
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
      </div>

      <div className="flex-shrink-0 bg-bg border-t border-border px-4 pt-3 pb-6">
        {saved ? (
          <div className="w-full min-h-[56px] flex items-center justify-center text-green text-base font-medium">
            ✓ 已保存
          </div>
        ) : (
          <Button onClick={handleSave} disabled={!hasChanges}>
            保存修改
          </Button>
        )}
      </div>

      {/* Confirm modal */}
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
                onClick={() => { setConfirmModal(null); router.push('/assessment') }}
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
