import Link from 'next/link'

const PRESCRIPTIONS = [
  { icon: '🏃', title: '运动处方', desc: '科学制定个人有氧与力量训练计划' },
  { icon: '🥗', title: '营养处方', desc: '心脏友好的中国本土化饮食建议' },
  { icon: '💊', title: '药物依从', desc: '了解用药原则，维持治疗效果' },
  { icon: '🧠', title: '心理疏导', desc: '管理康复中的焦虑与情绪变化' },
  { icon: '📊', title: '危险因素管理', desc: '血压、血糖、血脂的日常关注' },
]

export default function WelcomePage() {
  return (
    <div className="phone-shell">
      {/* Status bar */}
      <div className="flex-shrink-0 h-11 flex items-center justify-between px-5">
        <span className="text-[15px] font-semibold text-text">9:41</span>
        <div className="flex gap-1.5 items-center text-xs text-text">
          <span>●●●</span>
          <span>WiFi</span>
          <span>🔋</span>
        </div>
      </div>

      {/* Scroll content */}
      <div className="scroll-area px-4 pb-8">
        {/* Hero */}
        <div className="flex flex-col items-center gap-3 py-7">
          <div className="w-16 h-16 rounded-2xl bg-blue flex items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path d="M18 8C14 8 10 12 10 16C10 22 14 26 18 30C22 26 26 22 26 16C26 12 22 8 18 8Z" fill="white" />
              <path d="M18 13V21M15 17L18 13L21 17" stroke="#185FA5" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-[22px] font-bold text-text text-center leading-tight">
            心脏康复，从科学运动开始
          </h1>
          <p className="text-sm text-text-sub text-center leading-relaxed">
            基于循证医学的居家心脏康复管理<br />帮助冠心病患者建立持续康复习惯
          </p>
        </div>

        {/* Value proposition */}
        <p className="text-xs font-semibold text-text-sub uppercase tracking-wider mb-2.5">
          五大康复处方
        </p>
        <div className="flex flex-col gap-2.5 mb-6">
          {PRESCRIPTIONS.map(p => (
            <div key={p.title} className="bg-card rounded-card p-3.5 flex items-start gap-3">
              <span className="text-xl leading-none mt-0.5">{p.icon}</span>
              <div>
                <div className="font-semibold text-text text-base">{p.title}</div>
                <div className="text-sm text-text-sub leading-relaxed mt-0.5">{p.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Safety note */}
        <div className="bg-blue-light rounded-card p-3 mb-6">
          <p className="text-sm text-blue leading-relaxed">
            Heart 是健康管理工具，不构成医疗建议，不替代医院康复或医生指导。
          </p>
        </div>

        {/* Entry buttons */}
        <div className="flex flex-col gap-3">
          <Link
            href="/consent"
            className="w-full min-h-[56px] bg-blue text-white rounded-btn flex items-center justify-center font-medium text-base"
          >
            我已确诊冠心病 · 开始康复
          </Link>
          <Link
            href="/consent?family=1"
            className="w-full min-h-[56px] bg-card text-text border border-border rounded-btn flex items-center justify-center font-medium text-base"
          >
            我在帮家人了解
          </Link>
        </div>
      </div>
    </div>
  )
}
