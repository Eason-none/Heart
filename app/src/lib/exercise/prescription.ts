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

/** Weekly plan: 7 days starting from start_date (defaults to today), anchored to real calendar dates */
export function generateWeeklyPlan(params: {
  aerobic_freq: number
  resistance_freq: number
  diagnosis_type: DiagnosisType
  months_since_surgery: number
  start_date?: Date
}): Array<{ date: string; exercise_type: ExerciseType; is_rest: boolean }> {
  const { aerobic_freq, resistance_freq, diagnosis_type, months_since_surgery } = params
  const start = params.start_date ?? new Date()

  const aerobicDow = [1, 3, 5].slice(0, aerobic_freq) // Mon, Wed, Fri
  const canDoResistance = !(diagnosis_type === 'cabg' && months_since_surgery < 3)
  const resistanceDow = canDoResistance ? [2, 4].slice(0, resistance_freq) : []

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    const dow = d.getDay()
    const date = d.toISOString().slice(0, 10)
    if (aerobicDow.includes(dow)) return { date, exercise_type: 'walking' as ExerciseType, is_rest: false }
    if (resistanceDow.includes(dow)) return { date, exercise_type: 'resistance' as ExerciseType, is_rest: false }
    return { date, exercise_type: 'walking' as ExerciseType, is_rest: true }
  })
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
