import type { ExerciseType, RPELevel, RehabPhase, DiagnosisType } from '@/types'
import { vsaqToInitialDuration, vsaqToInitialRPE } from './intensity'

export interface InitialPrescription {
  exercise_type: ExerciseType
  duration_minutes: number
  rpe_target: RPELevel
  aerobic_frequency_per_week: number
  resistance_frequency_per_week: number
  phase: RehabPhase
}

/** Generate initial prescription from assessment data */
export function generateInitialPrescription(params: {
  vsaq_score: number
  months_since_surgery: number
  diagnosis_type: DiagnosisType
  risk_level: 'low' | 'medium'
}): InitialPrescription {
  const { vsaq_score, months_since_surgery, diagnosis_type } = params
  const rpe = vsaqToInitialRPE(vsaq_score)
  const duration = vsaqToInitialDuration(vsaq_score)

  return {
    exercise_type: 'walking',
    duration_minutes: duration,
    rpe_target: rpe,
    aerobic_frequency_per_week: 3,
    resistance_frequency_per_week:
      diagnosis_type === 'cabg' && months_since_surgery < 3 ? 0 : 2,
    phase: 'adaptation',
  }
}

/** Weekly plan: assign types across next 7 days */
export function generateWeeklyPlan(params: {
  aerobic_freq: number
  resistance_freq: number
  diagnosis_type: DiagnosisType
  months_since_surgery: number
  start_day?: number // 0 = Sunday
}): Array<{ day: number; exercise_type: ExerciseType; is_rest: boolean }> {
  const { aerobic_freq, resistance_freq, diagnosis_type, months_since_surgery } = params
  const plan: Array<{ day: number; exercise_type: ExerciseType; is_rest: boolean }> = []

  // Simple distribution: Mon/Wed/Fri = aerobic, Tue/Thu = resistance (non-consecutive)
  const aerobicDays = [1, 3, 5].slice(0, aerobic_freq) // Mon, Wed, Fri
  const canDoResistance = !(diagnosis_type === 'cabg' && months_since_surgery < 3)
  const resistanceDays = canDoResistance ? [2, 4].slice(0, resistance_freq) : []

  for (let d = 0; d < 7; d++) {
    if (aerobicDays.includes(d)) {
      plan.push({ day: d, exercise_type: 'walking', is_rest: false })
    } else if (resistanceDays.includes(d)) {
      plan.push({ day: d, exercise_type: 'resistance', is_rest: false })
    } else {
      plan.push({ day: d, exercise_type: 'walking', is_rest: true })
    }
  }
  return plan
}

export function getExerciseTypeLabel(type: ExerciseType): string {
  const labels: Record<ExerciseType, string> = {
    walking: '步行',
    jogging: '慢跑',
    cycling: '骑行',
    swimming: '游泳',
    home_aerobic: '居家有氧',
    resistance: '抗阻训练',
    flexibility: '柔韧训练',
    breathing_pldb: '缩唇膈肌呼吸',
  }
  return labels[type]
}

export function getExerciseTagLabel(type: ExerciseType): string {
  if (type === 'resistance') return '抗阻'
  if (type === 'flexibility') return '柔韧'
  if (type === 'breathing_pldb') return '呼吸'
  return '有氧'
}

export function isAerobicCount(type: ExerciseType): boolean {
  return ['walking', 'jogging', 'cycling', 'swimming', 'home_aerobic'].includes(type)
}
