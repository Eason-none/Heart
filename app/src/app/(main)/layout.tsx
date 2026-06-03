import BottomNav from '@/components/layout/BottomNav'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="phone-shell">
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100dvh', overflow: 'hidden' }}>
        <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  )
}
