'use client'
import { usePathname, useRouter } from 'next/navigation'

const TABS = [
  {
    href: '/home',
    label: '首页',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 9L12 3L21 9V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V9Z"
          stroke={active ? '#185FA5' : '#888780'}
          strokeWidth="1.8"
          fill={active ? '#E6F1FB' : 'none'}
        />
      </svg>
    ),
  },
  {
    href: '/exercise',
    label: '运动',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="5" r="2" stroke={active ? '#185FA5' : '#888780'} strokeWidth="1.8" />
        <path
          d="M7 12H17M12 8V16M8 20L10 16M16 20L14 16"
          stroke={active ? '#185FA5' : '#888780'}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: '/nutrition',
    label: '营养',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2C8 2 4 6 4 10C4 15 8 19 12 22C16 19 20 15 20 10C20 6 16 2 12 2Z"
          stroke={active ? '#185FA5' : '#888780'}
          strokeWidth="1.8"
          fill={active ? '#E6F1FB' : 'none'}
        />
        <path d="M12 6V14M9 9L12 6L15 9" stroke={active ? '#185FA5' : '#888780'} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/assistant',
    label: '助手',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M21 15C21 15.5523 20.5523 16 20 16H7L3 20V4C3 3.44772 3.44772 3 4 3H20C20.5523 3 21 3.44772 21 4V15Z"
          stroke={active ? '#185FA5' : '#888780'}
          strokeWidth="1.8"
          fill={active ? '#E6F1FB' : 'none'}
        />
        <path d="M8 9H16M8 12H13" stroke={active ? '#185FA5' : '#888780'} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/profile',
    label: '我',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="3.5" stroke={active ? '#185FA5' : '#888780'} strokeWidth="1.8" fill={active ? '#E6F1FB' : 'none'} />
        <path
          d="M4 20C4 17 7.58172 15 12 15C16.4183 15 20 17 20 20"
          stroke={active ? '#185FA5' : '#888780'}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
]

export default function BottomNav({ followupDot = false }: { followupDot?: boolean }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleNav = (href: string) => {
    if (pathname.startsWith(href)) return
    if (localStorage.getItem('exercise_in_progress')) {
      const ok = window.confirm('运动正在进行中，离开将丢失本次计时，确定离开吗？')
      if (!ok) return
      localStorage.removeItem('exercise_in_progress')
    }
    router.push(href)
  }

  return (
    <nav
      className="bottom-nav flex-shrink-0 bg-bg border-t border-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
    >
      <div className="flex">
        {TABS.map(tab => {
          const active = pathname.startsWith(tab.href)
          return (
            <button
              key={tab.href}
              type="button"
              onClick={() => handleNav(tab.href)}
              className="flex-1 flex flex-col items-center gap-1 py-2 relative"
            >
              <div className="relative">
                {tab.icon(active)}
                {tab.href === '/profile' && followupDot && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red" />
                )}
              </div>
              <span
                className="text-xs leading-none"
                style={{ color: active ? '#185FA5' : '#888780', fontWeight: active ? 600 : 400 }}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
