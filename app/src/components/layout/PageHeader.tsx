import Link from 'next/link'

interface PageHeaderProps {
  title: string
  backHref?: string
  rightAction?: React.ReactNode
}

export default function PageHeader({ title, backHref, rightAction }: PageHeaderProps) {
  return (
    <header
      className="flex-shrink-0 h-12 flex items-center px-4 justify-between bg-bg border-b border-border"
      style={{ zIndex: 20 }}
    >
      <div className="flex items-center gap-3">
        {backHref && (
          <Link href={backHref} className="flex items-center justify-center min-h-[44px] min-w-[44px] -ml-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 19L8 12L15 5" stroke="#2C2A26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        )}
        <h1 className="text-lg font-semibold text-text">{title}</h1>
      </div>
      {rightAction && <div className="flex items-center">{rightAction}</div>}
    </header>
  )
}
