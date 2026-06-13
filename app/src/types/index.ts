// ─── User & Assessment ───────────────────────────────────────────────────────

export type DiagnosisType = 'stable_angina' | 'pci' | 'cabg' | 'mi_recovery' | 'chd_no_surgery'
export type RiskLevel = 'low' | 'medium' | 'high'
export type RehabPhase = 'adaptation' | 'improvement' | 'maintenance'
export type SmokingStatus = 'non_smoker' | 'smoker' | 'quit'
export type Comorbidity = 'hypertension' | 'diabetes' | 'hyperlipidemia' | 'hyperuricemia'

export interface UserProfile {
  id: string
  user_id: string
  // Group 1 — basic info
  age: number
  gender: 'male' | 'female'
  height: number // cm
  weight: number // kg
  waist: number // cm
  diagnosis_type: DiagnosisType
  months_since_surgery: number // 0 = ≥24 months
  // Group 2 — cardiac function
  resting_hr?: number
  systolic_bp?: number
  diastolic_bp?: number
  lvef?: number | 'unknown' // null = skipped
  high_risk_q1: boolean // chest pain at rest
  high_risk_q2: boolean // syncope in past 6 months
  high_risk_q3: boolean // heart failure or severe arrhythmia diagnosis
  has_icd?: boolean     // pacemaker or ICD implanted
  icd_months_ago?: number // months since implant (1 = <6w, 2 = 6w–3m, 12 = >3m)
  // Group 3 — comorbidities & meds
  comorbidities: Comorbidity[]
  has_beta_blocker: boolean
  smoking_status: SmokingStatus
  // Group 4 — functional capacity
  vsaq_score: number // 1-13 METs equivalent
  // Group 5 — psych baseline
  phq2_score: number
  gad2_score: number
  // Derived
  risk_level: RiskLevel
  // Assessment state
  assessment_status: 'not_started' | 'in_progress' | 'completed'
  assessment_group_progress: number // 1-5
  assessment_partial_data?: Record<string, unknown>
  created_at: string
  updated_at: string
}

// ─── Exercise Prescription ───────────────────────────────────────────────────

export type RPELevel = 1 | 2 | 3 | 4 // 1=轻松 2=适中 3=较累 4=很累
export type ExerciseType =
  | 'walking' | 'jogging' | 'cycling' | 'swimming'
  | 'home_aerobic' | 'resistance' | 'flexibility' | 'breathing_pldb'

export interface ExercisePrescription {
  user_id: string
  exercise_type: ExerciseType
  duration_minutes: number
  rpe_target: RPELevel
  aerobic_frequency_per_week: number
  resistance_frequency_per_week: number
  phase: RehabPhase
  total_sessions_completed: number
  adjustment_history: PrescriptionAdjustment[]
  last_adjustment_at?: string
  updated_at: string
}

export interface PrescriptionAdjustment {
  timestamp: string
  direction: 'up' | 'down'
  dimension: 'duration' | 'rpe' | 'hr_target'
  old_value: number
  new_value: number
  trigger_reason: string
  user_accepted: boolean | null // null = pending
}

// ─── Exercise Session ─────────────────────────────────────────────────────────

export type SessionStatus = 'completed' | 'symptom_locked' | 'skipped' | 'in_progress'
export type DayState = 'good' | 'normal' | 'bad'
export type HRRecovery = 'within_10min' | '10_30min' | 'over_30min' | 'not_tracked' | 'recovered' | 'still_high' | 'not_recorded'

export interface ExerciseSession {
  id: string
  user_id: string
  session_date: string // ISO date
  exercise_type: ExerciseType
  planned_duration: number
  actual_duration?: number
  rpe_target: RPELevel
  rpe_actual?: RPELevel
  hr_recovery?: HRRecovery
  symptoms_before: string[]
  symptoms_after: string[]
  day_state: DayState
  status: SessionStatus
  is_aerobic_count: boolean
  ai_summary_text?: string
  prescription_snapshot: Partial<ExercisePrescription>
  layer2_window_sessions?: string[] // session ids in current 14-day window
  created_at: string
}

// ─── Followup ────────────────────────────────────────────────────────────────

export type FollowupType = 'weekly' | 'monthly'
export type PsychSeverity = 'normal' | 'mild' | 'moderate' | 'severe'

export interface FollowupRecord {
  id: string
  user_id: string
  followup_type: FollowupType
  followup_date: string
  // Weekly questions
  exercise_count: 0 | 1 | 2 | 3 | 4 // 4 = 4+
  exercise_symptoms: string[]
  sleep_quality: 'good' | 'average' | 'poor'
  mood: 'good' | 'okay' | 'low'
  constipation: 'none' | 'occasional' | 'notable'
  // Comorbidity extras
  blood_pressure?: { systolic: number; diastolic: number }
  medication_adherence?: 'good' | 'occasional_miss' | 'frequent_miss'
  // Monthly extras
  weight?: number
  waist?: number
  new_symptoms?: 'none' | 'unvisited' | 'visited'
  doctor_adjusted?: boolean
  vsaq_score?: number
  chair_stand_count?: number
  doctor_contact?: 'yes' | 'no' | 'planned'
  // Psych
  phq9_score?: number
  gad7_score?: number
  psych_severity?: PsychSeverity
  created_at: string
}

// ─── Content ──────────────────────────────────────────────────────────────────

export type ContentPhase = 'adaptation' | 'improvement' | 'maintenance'
export type ContentAudience = 'general' | 'cabg' | 'hypertension' | 'diabetes'
export type ContentTopic =
  | 'exercise_knowledge' | 'disease_knowledge' | 'nutrition'
  | 'mental_health' | 'daily_life' | 'emergency' | 'social_return' | 'smoking_cessation'
export type CardType = 'milestone' | 'concept' | 'principle' | 'safety' | 'behavior_reinforcement'

export interface ScienceCard {
  id: string
  topic: ContentTopic
  card_type: CardType
  phase: ContentPhase[]
  audience: ContentAudience[]
  title: string
  body: string
  requires_smoker?: boolean
}

// ─── Knowledge Map ────────────────────────────────────────────────────────────

export type KMSectionId = 'heart' | 'risk' | 'emergency' | 'exercise' | 'diet' | 'meds' | 'psych' | 'daily'
export type KMPriority = 'P0' | 'P1' | 'P2'

export interface KnowledgeCard {
  id: string
  section: KMSectionId
  subsection: string
  priority: KMPriority
  phase: ContentPhase[]
  audience: ContentAudience[]
  title: string
  body: string
  requires_smoker?: boolean
}

export interface KMSectionMeta {
  id: KMSectionId
  label: string
  description: string
  urgent?: boolean
}

// ─── Exercise State Machine ───────────────────────────────────────────────────

export type ExercisePageState = 'checkin' | 'prescription' | 'active' | 'feedback' | 'summary'

export interface CheckInData {
  symptoms_before: string[]
  sleep_rating: 'good' | 'average' | 'poor' | null
  fatigue_rating: 'energized' | 'okay' | 'tired' | 'exhausted' | null
}

export interface FeedbackData {
  rpe_actual: RPELevel | null
  symptoms_after: string[]
  hr_recovery: HRRecovery | null
}

export interface ActiveSessionState {
  pageState: ExercisePageState
  checkIn: CheckInData
  feedback: FeedbackData
  dayState: DayState | null
  selectedExerciseType: ExerciseType | null
  startTime: string | null
  elapsedSeconds: number
  sessionId: string | null
}

// ─── Intensity Adjustment ────────────────────────────────────────────────────

export type AdjustmentSignal = 'up' | 'down' | 'maintain'
export interface Layer2Window {
  sessions: Array<{
    rpe: RPELevel
    hr_recovery: HRRecovery
    had_discomfort: boolean
    date: string
    day_state?: DayState
  }>
  last_adjustment_date?: string
}
