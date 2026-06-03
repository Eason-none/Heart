'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'

const STATEMENTS = [
  {
    icon: '🏥',
    title: '产品性质声明',
    body: 'Heart 是健康管理工具，不构成医疗器械，不提供诊断或处方服务。所有内容仅供参考，无法替代主治医生的专业建议。',
  },
  {
    icon: '👨‍⚕️',
    title: '遵医嘱声明',
    body: '使用本产品的康复计划时，请确保已告知主治医生，并在医生许可后开始运动康复。如医生有特殊叮嘱，以医生建议为准。',
  },
  {
    icon: '⚠️',
    title: '症状停止运动声明',
    body: '运动中出现胸痛、胸闷、心慌、头晕、呼吸困难等不适，请立即停止运动并休息。如症状持续或加重，请及时就医，不可强行坚持。',
  },
  {
    icon: '🔒',
    title: '数据声明',
    body: '您的健康数据仅用于生成个人康复计划，加密存储，不对外共享，不用于任何商业分析。您可随时删除账号及全部数据。',
  },
]

export default function ConsentPage() {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  return (
    <div className="phone-shell">
      {/* Header */}
      <div className="flex-shrink-0 h-11 flex items-center justify-between px-5">
        <span className="text-[15px] font-semibold text-text">9:41</span>
        <div className="flex gap-1.5 text-xs text-text"><span>●●● WiFi 🔋</span></div>
      </div>
      <div className="flex-shrink-0 h-12 flex items-center px-4 border-b border-border bg-bg" style={{ zIndex: 20 }}>
        <Link href="/welcome" className="flex items-center min-h-[44px] min-w-[44px] -ml-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 19L8 12L15 5" stroke="#2C2A26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <h1 className="text-lg font-semibold text-text ml-1">使用前请阅读</h1>
      </div>

      {/* Scrollable content */}
      <div className="scroll-area px-4 pt-4 pb-28">
        <p className="text-text-sub text-sm leading-relaxed mb-4">
          请仔细阅读以下内容。这些说明帮助你安全使用本产品。
        </p>
        <div className="flex flex-col gap-3">
          {STATEMENTS.map(s => (
            <div key={s.title} className="bg-card rounded-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{s.icon}</span>
                <h3 className="font-semibold text-text text-base">{s.title}</h3>
              </div>
              <p className="text-sm text-text leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer — fixed */}
      <div className="flex-shrink-0 bg-bg border-t border-border px-4 pt-3 pb-6">
        <label className="flex items-start gap-3 mb-4 cursor-pointer">
          <div
            className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              checked ? 'bg-blue border-blue' : 'border-border bg-white'
            }`}
            onClick={() => setChecked(!checked)}
          >
            {checked && (
              <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span className="text-base text-text leading-relaxed">我已阅读并同意以上内容</span>
        </label>
        <Button
          disabled={!checked}
          onClick={() => router.push('/assessment')}
        >
          开始评估
        </Button>
      </div>
    </div>
  )
}
