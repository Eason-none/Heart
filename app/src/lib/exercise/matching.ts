import type { ExerciseType, DiagnosisType } from '@/types'
import {
  EXERCISE_LIBRARY,
  ExerciseItem,
  EquipmentType,
  ContraFlag,
} from './library'

// ─── User Profile for Matching ───────────────────────────────────────────────

export interface UserMatchProfile {
  diagnosis_type: DiagnosisType
  months_since_surgery: number   // 0 = ≥24 months (safe)
  lvef?: number
  lvef_weak?: boolean
  systolic_bp?: number
  diastolic_bp?: number
  high_risk_q1: boolean
  high_risk_q2: boolean
  high_risk_q3: boolean
  vsaq_score: number
  // Extended fields — added to assessment (may be undefined for legacy data)
  has_icd?: boolean
  icd_months_ago?: number
  can_swim?: boolean
  has_open_wound?: boolean
}

// ─── Match Result ─────────────────────────────────────────────────────────────

export interface MatchedExercise {
  item: ExerciseItem
  active_modifications: string[]   // modification instructions that apply to this user
  requires_equipment: EquipmentType | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Converts months_since_surgery to weeks, treating 0 as "≥24 months" (always safe) */
function toWeeks(months: number): number {
  return months === 0 ? 9999 : months * 4.33
}

function evaluateContraFlag(flag: ContraFlag, p: UserMatchProfile): boolean {
  switch (flag) {
    case 'lvef_lt_40':
      if (p.lvef !== undefined) return p.lvef < 40
      return p.lvef_weak === true
    case 'uncontrolled_bp':
      return (p.systolic_bp !== undefined && p.systolic_bp >= 160) ||
             (p.diastolic_bp !== undefined && p.diastolic_bp >= 100)
    case 'high_risk_any':
      return p.high_risk_q1 || p.high_risk_q2 || p.high_risk_q3
    case 'vsaq_lt_6':
      return p.vsaq_score < 6
    case 'cannot_swim':
      return p.can_swim !== true  // block unless explicitly confirmed; Plan A: ask in exercise page
    case 'icd_lt_6w':
      if (!p.has_icd) return false
      if (p.icd_months_ago === undefined) return true  // unknown recency → conservative block
      return p.icd_months_ago * 4.33 < 6
    case 'open_wound':
      return p.has_open_wound === true
  }
}

// ─── Core Matching ────────────────────────────────────────────────────────────

/**
 * Returns all safe exercises for a given category, filtered against the user's
 * profile. Exercises requiring unavailable equipment are excluded; pass the
 * full available_equipment list after asking the user.
 *
 * Default available_equipment = [] → only bodyweight/no-equipment exercises.
 */
export function matchExercisesForCategory(
  category: ExerciseType,
  profile: UserMatchProfile,
  available_equipment: EquipmentType[] = [],
): MatchedExercise[] {
  const weeks = toWeeks(profile.months_since_surgery)
  const results: MatchedExercise[] = []

  for (const item of EXERCISE_LIBRARY) {
    if (item.category !== category) continue

    // Skip if requires equipment not in available list
    if (item.equipment && !available_equipment.includes(item.equipment)) continue

    // Block if surgery window not met
    const surgeryBlocked = item.surgery_windows.some(
      w => w.diagnoses.includes(profile.diagnosis_type) && weeks < w.min_weeks,
    )
    if (surgeryBlocked) continue

    // Block if any contra flag is triggered
    const flagBlocked = item.contra_flags.some(f => evaluateContraFlag(f, profile))
    if (flagBlocked) continue

    // Collect modifications that apply to this user
    const active_modifications: string[] = []
    for (const mod of item.modifications) {
      const { condition } = mod
      let applies = false

      if (condition.type === 'always') {
        applies = true
      } else if (condition.type === 'cabg_weeks_lt') {
        applies = profile.diagnosis_type === 'cabg' && weeks < condition.weeks
      } else if (condition.type === 'vsaq_lte') {
        applies = profile.vsaq_score <= condition.value
      }

      if (applies) active_modifications.push(mod.instruction)
    }

    results.push({
      item,
      active_modifications,
      requires_equipment: item.equipment ?? null,
    })
  }

  return results
}

/**
 * Returns which equipment types (if any) could unlock additional exercises
 * for the given category and profile — used to build the "你有X吗？" prompt.
 */
export function getEquipmentOptions(
  category: ExerciseType,
  profile: UserMatchProfile,
): EquipmentType[] {
  const weeks = toWeeks(profile.months_since_surgery)
  const needed = new Set<EquipmentType>()

  for (const item of EXERCISE_LIBRARY) {
    if (item.category !== category || !item.equipment) continue

    const surgeryBlocked = item.surgery_windows.some(
      w => w.diagnoses.includes(profile.diagnosis_type) && weeks < w.min_weeks,
    )
    if (surgeryBlocked) continue

    const flagBlocked = item.contra_flags.some(f => evaluateContraFlag(f, profile))
    if (flagBlocked) continue

    needed.add(item.equipment)
  }

  return Array.from(needed)
}

/**
 * Quick single-exercise pick for the home page "今日运动" card.
 * Returns the first bodyweight-safe exercise in the category.
 */
export function pickPrimaryExercise(
  category: ExerciseType,
  profile: UserMatchProfile,
): MatchedExercise | null {
  const results = matchExercisesForCategory(category, profile, [])
  return results[0] ?? null
}

// ─── Profile Builder ──────────────────────────────────────────────────────────

/**
 * Builds a UserMatchProfile from raw assessment_answers localStorage data.
 * Safe to call with an empty object — all fields have sensible defaults.
 */
export function buildMatchProfile(data: Record<string, unknown>): UserMatchProfile {
  return {
    diagnosis_type: (data.diagnosis_type as DiagnosisType) ?? 'pci',
    months_since_surgery: (data.months_since_surgery as number) ?? 0,
    lvef: data.lvef as number | undefined,
    lvef_weak: data.lvef_weak as boolean | undefined,
    systolic_bp: data.systolic_bp as number | undefined,
    diastolic_bp: data.diastolic_bp as number | undefined,
    high_risk_q1: (data.high_risk_q1 as boolean) ?? false,
    high_risk_q2: (data.high_risk_q2 as boolean) ?? false,
    high_risk_q3: (data.high_risk_q3 as boolean) ?? false,
    vsaq_score: (data.vsaq_score as number) ?? 5,
    has_icd: data.has_icd as boolean | undefined,
    icd_months_ago: data.icd_months_ago as number | undefined,
    can_swim: data.can_swim as boolean | undefined,
    has_open_wound: data.has_open_wound as boolean | undefined,
  }
}
