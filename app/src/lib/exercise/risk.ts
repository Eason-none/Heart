import type { UserProfile, RiskLevel } from '@/types'

/**
 * Derives risk level from assessment data.
 * High-risk triggers: any high-risk Q = true, or PHQ-2+GAD-2 any item ≥3.
 * Called immediately when any high-risk Q is answered "yes" (early exit).
 */
export function calculateRiskLevel(data: {
  high_risk_q1: boolean
  high_risk_q2: boolean
  high_risk_q3: boolean
  phq2_score: number
  gad2_score: number
  lvef?: number
  vsaq_score: number
}): RiskLevel {
  if (data.high_risk_q1 || data.high_risk_q2 || data.high_risk_q3) return 'high'
  if (data.phq2_score >= 3 || data.gad2_score >= 3) return 'high'
  if (data.lvef !== undefined && data.lvef < 40) return 'high'

  // Medium vs low: LVEF 40-49, or multiple comorbidities, or lower VSAQ
  if ((data.lvef !== undefined && data.lvef < 50) || data.vsaq_score <= 4) return 'medium'
  return 'low'
}

/** Human-readable risk label — never shows "低危/中危/高危" clinical terms */
export function getRiskDisplayLabel(level: RiskLevel): string {
  switch (level) {
    case 'low': return '康复条件良好'
    case 'medium': return '需要适度关注'
    case 'high': return '建议先咨询医生'
  }
}
