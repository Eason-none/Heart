'use client'
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="flex flex-col h-full bg-bg">
      <div className="flex-shrink-0 h-12 flex items-center gap-3 px-4 border-b border-border">
        <Link href="/profile" className="flex items-center min-h-[44px] min-w-[44px] -ml-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 19L8 12L15 5" stroke="#2C2A26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <h1 className="text-lg font-semibold text-text">隐私说明</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-10 space-y-6">

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-text">我们收集什么数据</h2>
          <p className="text-sm text-text leading-relaxed">
            Heart 仅收集你主动填写的信息，包括：首次评估问卷（身体状况、运动能力等）、每次运动记录、每周健康记录。这些数据全部存储在你的本机设备上。
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-text">云端同步（可选）</h2>
          <p className="text-sm text-text leading-relaxed">
            当你使用「数据备份」功能时，上述数据会通过匿名设备 ID 上传至加密服务器。我们不采集你的姓名、手机号或任何可识别身份的信息。数据与真实个人之间无法关联。
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-text">我们不做什么</h2>
          <ul className="text-sm text-text leading-relaxed space-y-1">
            <li>· 不将你的数据分享给任何第三方</li>
            <li>· 不用于广告或商业推荐</li>
            <li>· 不进行身份识别或用户画像</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-text">如何删除数据</h2>
          <p className="text-sm text-text leading-relaxed">
            卸载 App 即可清除本机数据。如需删除云端备份数据，请发送邮件至下方联系方式，注明你的设备 ID，我们将在 7 个工作日内处理。
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-text">健康数据说明</h2>
          <p className="text-sm text-text leading-relaxed">
            Heart 提供的运动建议和内容基于循证指南，仅供健康教育参考，不构成医疗诊断或处方。所有涉及健康的决策请咨询你的主治医生。
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-text">联系我们</h2>
          <p className="text-sm text-text leading-relaxed">
            如有隐私相关问题，请发送邮件至：<span className="text-blue">privacy@heart-rehab.app</span>
          </p>
        </section>

        <p className="text-xs text-text-sub">最后更新：2026 年 6 月</p>
      </div>
    </div>
  )
}
