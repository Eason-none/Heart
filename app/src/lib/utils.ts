export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })
}

export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export function daysBetween(a: string, b: string): number {
  return Math.abs(
    Math.floor((new Date(a).getTime() - new Date(b).getTime()) / (1000 * 60 * 60 * 24))
  )
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
