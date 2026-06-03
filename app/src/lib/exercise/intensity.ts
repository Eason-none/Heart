import type { RPELevel, Layer2Window, AdjustmentSignal, HRRecovery } from '@/types'

// ─── RPE Labels ───────────────────────────────────────────────────────────────

export const RPE_LABELS: Record<RPELevel, { label: string; aerobic: string; resistance: string }> = {
  1: {
    label: '轻松',
    aerobic: '呼吸顺畅，全程很轻松',
    resistance: '还能再做 6+ 次',
  },
  2: {
    label: '适中',
    aerobic: '能说话但不能唱歌，有点喘',
    resistance: '还能再做 3–5 次',
  },
  3: {
    label: '较累',
    aerobic: '明显费力，说话需要停顿',
    resistance: '还能再做 1–2 次',
  },
  4: {
    label: '很累',
    aerobic: '几乎说不了话，很吃力',
    resistance: '几乎无法再做',
  },
}

/** Map VSAQ score (1-13 METs) to initial RPE target */
export function vsaqToInitialRPE(vsaq: number): RPELevel {
  if (vsaq <= 3) return 1
  if (vsaq <= 6) return 2
  if (vsaq <= 9) return 3
  return 2 // high capacity → still start at moderate
}

/** Map VSAQ to initial duration (minutes) */
export function vsaqToInitialDuration(vsaq: number): number {
  if (vsaq <= 3) return 15
  if (vsaq <= 5) return 20
  if (vsaq <= 8) return 25
  return 30
}

// ─── Day state ────────────────────────────────────────────────────────────────

export type SleepRating = 'good' | 'average' | 'poor'
export type FatigueRating = 'energized' | 'okay' | 'tired' | 'exhausted'
export type DayState = 'good' | 'normal' | 'bad'

/**
 * Three-tier day state machine (spec F2-4).
 * good  = sleep good/avg + fatigue energized, OR sleep avg + fatigue energized
 * bad   = sleep poor OR fatigue exhausted
 * normal = everything else
 */
export function calcDayState(sleep: SleepRating, fatigue: FatigueRating): DayState {
  if (sleep === 'poor' || fatigue === 'exhausted') return 'bad'
  if (
    (sleep === 'good' && fatigue === 'energized') ||
    (sleep === 'average' && fatigue === 'energized') ||
    (sleep === 'good' && fatigue === 'okay')
  ) return 'good'
  return 'normal'
}

// ─── Layer 2 trigger (14-day window) ─────────────────────────────────────────

const HR_ELEVATED: HRRecovery[] = ['still_high', 'over_30min']

function isHRRecoveryBad(hr: HRRecovery): boolean {
  return HR_ELEVATED.includes(hr)
}

/**
 * Evaluates Layer 2 signal from a 3-session window within 14 days.
 * Returns 'down', 'up', or 'maintain'.
 * hasBetaBlocker: if true, ignores HR-related conditions.
 */
export function evalLayer2Signal(
  window: Layer2Window,
  hasBetaBlocker: boolean
): AdjustmentSignal {
  const sessions = window.sessions
  if (sessions.length < 3) return 'maintain'

  const last3 = sessions.slice(-3)

  // ─── Down triggers (any one is enough) ───
  const highRPECount = last3.filter(s => s.rpe >= 3).length
  if (highRPECount >= 2) return 'down'

  const hadDiscomfort = last3.some(s => s.had_discomfort)
  if (hadDiscomfort) return 'down'

  if (!hasBetaBlocker) {
    const badHR = last3.filter(s => isHRRecoveryBad(s.hr_recovery)).length
    if (badHR >= 2) return 'down'
  }

  // ─── Up triggers (all four required) ─────
  const allLowRPE = last3.every(s => s.rpe <= 2)
  const noDiscomfort = last3.every(s => !s.had_discomfort)
  const allGoodHR = hasBetaBlocker
    ? true
    : last3.every(s => !isHRRecoveryBad(s.hr_recovery))
  const twoWeeksSinceLastAdj =
    !window.last_adjustment_date ||
    daysBetween(sessions[sessions.length - 1].date, window.last_adjustment_date) >= 14

  if (allLowRPE && noDiscomfort && allGoodHR && twoWeeksSinceLastAdj) return 'up'

  return 'maintain'
}

function daysBetween(a: string, b: string): number {
  return Math.abs(
    Math.floor((new Date(a).getTime() - new Date(b).getTime()) / (1000 * 60 * 60 * 24))
  )
}

/** Apply adjustment to prescription (max ±10%, one dimension at a time) */
export function applyRPEAdjustment(
  currentRPE: RPELevel,
  signal: AdjustmentSignal
): RPELevel {
  if (signal === 'up' && currentRPE < 4) return (currentRPE + 1) as RPELevel
  if (signal === 'down' && currentRPE > 1) return (currentRPE - 1) as RPELevel
  return currentRPE
}

export function applyDurationAdjustment(
  currentMin: number,
  signal: AdjustmentSignal
): number {
  if (signal === 'up') return Math.min(60, currentMin + 5)
  if (signal === 'down') return Math.max(10, currentMin - 5)
  return currentMin
}
