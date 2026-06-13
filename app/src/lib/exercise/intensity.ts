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

const HR_ELEVATED: HRRecovery[] = ['over_30min', 'still_high']

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

  // 差/一般状态日不计入连续3次触发计数
  const qualifying = sessions.filter(s => !s.day_state || s.day_state === 'good')
  if (qualifying.length < 3) return 'maintain'

  const last3 = qualifying.slice(-3)

  // 连续3次须在14天内完成
  if (daysBetween(last3[0].date, last3[2].date) > 14) return 'maintain'

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
  const allLowRPE = last3.every(s => s.rpe === 1) // Borg ≤11 → level 1 only
  const noDiscomfort = last3.every(s => !s.had_discomfort)
  const allGoodHR = hasBetaBlocker
    ? true
    : last3.every(s => !isHRRecoveryBad(s.hr_recovery))
  const twoWeeksSinceLastAdj =
    !window.last_adjustment_date ||
    daysBetween(qualifying[qualifying.length - 1].date, window.last_adjustment_date) >= 14

  if (allLowRPE && noDiscomfort && allGoodHR && twoWeeksSinceLastAdj) return 'up'

  return 'maintain'
}

function daysBetween(a: string, b: string): number {
  return Math.abs(
    Math.floor((new Date(a).getTime() - new Date(b).getTime()) / (1000 * 60 * 60 * 24))
  )
}

/**
 * Adjusts exactly one prescription dimension per signal (EAPC 2022: never two at once).
 * UP:   duration < 30 min → add 5 min first; duration ≥ 30 min → raise RPE.
 * DOWN: RPE > 1 → lower RPE first; RPE already at 1 → reduce duration.
 */
export function applyPrescriptionAdjustment(
  current: { rpe_target: RPELevel; duration_minutes: number },
  signal: AdjustmentSignal
): { rpe_target: RPELevel; duration_minutes: number } {
  const DURATION_GOAL = 30
  const DURATION_STEP = 5
  const DURATION_MAX = 60
  const DURATION_MIN = 10

  if (signal === 'up') {
    if (current.duration_minutes < DURATION_GOAL)
      return { ...current, duration_minutes: Math.min(DURATION_MAX, current.duration_minutes + DURATION_STEP) }
    if (current.rpe_target < 4)
      return { ...current, rpe_target: (current.rpe_target + 1) as RPELevel }
    return current
  }
  if (signal === 'down') {
    if (current.rpe_target > 1)
      return { ...current, rpe_target: (current.rpe_target - 1) as RPELevel }
    return { ...current, duration_minutes: Math.max(DURATION_MIN, current.duration_minutes - DURATION_STEP) }
  }
  return current
}
