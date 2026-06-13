'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getRiskDisplayLabel } from '@/lib/exercise/risk'
import type { ContentTopic } from '@/types'

// ─── Milestone card ────────────────────────────────────────────────────────────

interface MilestoneCardProps {
  count: number
  label: string
  unlocked: boolean
  special?: boolean
}

function MilestoneCard({ count, label, unlocked, special }: MilestoneCardProps) {
  const color = special ? '#185FA5' : '#BA7517'
  return (
    <div className={`flex-1 bg-card rounded-card p-3 flex flex-col items-center gap-2 ${unlocked ? '' : 'opacity-50'}`}>
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center"
        style={{ border: `2px ${unlocked ? 'solid' : 'dashed'} ${color}` }}
      >
        <div className="text-center">
          <div className="text-xl font-bold leading-none" style={{ color }}>{count}</div>
          <div className="text-[10px] leading-none" style={{ color }}>{count === 90 ? '天' : '次'}</div>
        </div>
      </div>
      <p className="text-xs text-text-sub text-center leading-tight">{label}</p>
      {unlocked && <span className="text-[10px] text-text-sub">坚持的力量</span>}
    </div>
  )
}

// ─── Health status data ────────────────────────────────────────────────────────

const DIAGNOSIS_LABELS: Record<string, string> = {
  pci: 'PCI（支架）术后',
  cabg: 'CABG（搭桥）术后',
  mi_recovery: '心梗恢复期',
  stable_angina: '稳定型心绞痛',
  chd_no_surgery: '已确诊冠心病（无手术史）',
}

const DIAGNOSIS_NOTES: Record<string, string> = {
  pci: '支架术后冠状动脉已恢复血流，规律康复可显著降低再狭窄风险，同时改善心脏功能储备。',
  cabg: '搭桥术后胸骨需约 6–12 周愈合，此期间应避免上肢中高强度训练。步行等下肢有氧运动不受此限制。',
  mi_recovery: '梗死区域心肌需要时间重建，运动应循序渐进。规律有氧训练有助于促进侧支循环建立和心肌功能恢复。',
  stable_angina: '稳定型心绞痛患者在适当强度范围内运动是安全的，长期坚持可提升心绞痛阈值、改善生活质量。',
  chd_no_surgery: '冠心病患者通过规律有氧运动可促进侧支循环建立，改善心肌供血，降低心脏事件风险。',
}

const COMORBIDITY_LABELS: Record<string, string> = {
  hypertension: '高血压',
  diabetes: '糖尿病',
  hyperlipidemia: '高血脂',
  hyperuricemia: '高尿酸',
}

const COMORBIDITY_NOTES: Record<string, string> = {
  hypertension: '高血压会加重心脏后负荷。规律有氧运动有助于长期血压管理，运动时需避免憋气（如举重时）以防血压骤升。',
  diabetes: '糖尿病损伤血管内皮，加速动脉硬化。运动既是"天然降糖药"，也需注意运动前后血糖监测，防止低血糖反应。',
  hyperlipidemia: '高血脂加速动脉硬化进程。有氧运动能有效升高保护性 HDL 胆固醇、降低 LDL，是药物治疗的有效辅助。',
  hyperuricemia: '高尿酸与心血管风险相关。运动时需充分补水，避免高强度无氧运动，低至中强度有氧运动总体有益。',
}

const BETA_NOTES: Record<string, string> = {
  true: '你正在服用 β 受体阻滞剂。这类药物会抑制运动时的心率上升，因此系统用"自感运动强度（RPE）"而非心率区间来指导运动强度，更贴合你的实际感受。',
  false: '未服用 β 受体阻滞剂，运动心率可正常反映运动强度，当前处方采用标准强度区间计算。',
  unknown: '用药情况不确定。β 受体阻滞剂对运动强度计算方式有影响，建议下次就诊时向医生确认，并通过"更新评估"更新此信息。',
}

const SMOKING_NOTES: Record<string, string> = {
  non_smoker: '不吸烟是心脏健康的重要保护因素，可降低冠心病、心律失常和心衰的发生风险。',
  quit: '戒烟是明智的选择。戒烟后心血管风险随时间持续降低：1 年内冠心病风险降幅约 50%，5–15 年后卒中风险接近从不吸烟水平。\n\n吸烟通过损伤血管内皮、升高血压与心率、促进血小板聚集等机制增加心血管风险，戒烟后这些损害效应会逐步逆转。你的心脏正在从戒烟中持续获益。',
  smoker: '吸烟是心脏康复中最重要的可控危险因素之一。尼古丁和一氧化碳损伤血管内皮，加速动脉硬化，增加血栓风险，并干扰心肺功能恢复。\n\n戒烟是心脏康复中效果最快的单项干预——戒烟 24 小时内，心脏病发作风险即开始降低。建议与医生讨论尼古丁替代疗法或药物辅助戒烟方案，成功率远高于纯意志力。',
}

// ─── Risk factor display maps ─────────────────────────────────────────────────

const BP_DISPLAY: Record<string, { label: string; urgent: boolean }> = {
  not_measured: { label: '未测量', urgent: false },
  normal: { label: '< 130 良好', urgent: false },
  elevated: { label: '130–139 需注意', urgent: true },
  high: { label: '≥ 140 请联系医生', urgent: true },
}

const WEIGHT_DISPLAY: Record<string, { label: string; urgent: boolean }> = {
  stable: { label: '稳定', urgent: false },
  gained: { label: '增加 > 1 kg', urgent: true },
  lost: { label: '减轻 > 1 kg', urgent: false },
}

const SMOKING_CHECK_DISPLAY: Record<string, { label: string; urgent: boolean }> = {
  none: { label: '本周未吸烟', urgent: false },
  few: { label: '吸了少量', urgent: true },
  more: { label: '吸了较多', urgent: true },
}

// ─── Content preference data ───────────────────────────────────────────────────

const TOPIC_LABELS: Record<ContentTopic, string> = {
  exercise_knowledge: '运动知识',
  disease_knowledge: '疾病知识',
  nutrition: '营养饮食',
  mental_health: '心理健康',
  daily_life: '日常生活',
  emergency: '急救知识',
  social_return: '回归社会',
  smoking_cessation: '戒烟',
}

const MANAGEABLE_TOPICS: ContentTopic[] = [
  'exercise_knowledge', 'disease_knowledge', 'nutrition',
  'mental_health', 'daily_life', 'emergency',
]

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [riskLevel, setRiskLevel] = useState<string>('')
  const [totalSessions, setTotalSessions] = useState(0)
  const [followupRecords, setFollowupRecords] = useState<Array<{ date: string; type: string; summary: string }>>([])
  const [assessmentData, setAssessmentData] = useState<Record<string, unknown>>({})
  const [preferredTopics, setPreferredTopics] = useState<ContentTopic[]>([])
  const [healthSheet, setHealthSheet] = useState(false)
  const [contentPrefSheet, setContentPrefSheet] = useState(false)
  const [latestRiskData, setLatestRiskData] = useState<{
    bp_reading?: string; weight_change?: string; smoking_check?: string; date?: string
  } | null>(null)

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem('assessment_answers') || '{}')
      setRiskLevel(data.risk_level || '')
      setAssessmentData(data)

      const sessions = JSON.parse(localStorage.getItem('exercise_sessions') || '[]')
      setTotalSessions(sessions.length)

      const records = JSON.parse(localStorage.getItem('followup_records') || '[]')
      const SLEEP_LABEL: Record<string, string> = { good: '良好', average: '一般', poor: '较差' }
      const BP_SUMMARY: Record<string, string> = { normal: '血压良好', elevated: '血压偏高', high: '血压需关注' }
      const formatted = [...records].reverse().slice(0, 5).map((r: Record<string, unknown>) => {
        const d = new Date(r.followup_date as string)
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        const bpPart = r.bp_reading && r.bp_reading !== 'not_measured' ? `，${BP_SUMMARY[r.bp_reading as string] || ''}` : ''
        return {
          date: dateStr,
          type: r.followup_type === 'monthly' ? '每月完整随访' : '每周随访',
          summary: `运动 ${r.exercise_count} 次，睡眠${SLEEP_LABEL[r.sleep_quality as string] || '一般'}${bpPart}`,
        }
      })
      setFollowupRecords(formatted)

      const latestWithRisk = [...records].reverse().find(
        (r: Record<string, unknown>) => r.bp_reading || r.weight_change || r.smoking_check
      )
      if (latestWithRisk) {
        const d = new Date(latestWithRisk.followup_date as string)
        setLatestRiskData({
          bp_reading: latestWithRisk.bp_reading as string,
          weight_change: latestWithRisk.weight_change as string,
          smoking_check: latestWithRisk.smoking_check as string,
          date: `${d.getMonth() + 1}/${d.getDate()}`,
        })
      }

      const topics: ContentTopic[] = JSON.parse(localStorage.getItem('content_preferred_topics') || '[]')
      setPreferredTopics(topics)
    } catch {}
  }, [])

  const milestones = [
    { count: 12, label: '适应期·里程碑', unlocked: totalSessions >= 12 },
    { count: 18, label: '改善期·里程碑', unlocked: totalSessions >= 18 },
    { count: 90, label: '维持期·结业', unlocked: false, special: true },
  ]

  const smokingStatus = assessmentData.smoking_status as string
  const isSmokingRelevant = smokingStatus === 'smoker' || smokingStatus === 'quit'

  const toggleTopic = (topic: ContentTopic) => {
    const next = preferredTopics.includes(topic)
      ? preferredTopics.filter(t => t !== topic)
      : [...preferredTopics, topic]
    setPreferredTopics(next)
    try { localStorage.setItem('content_preferred_topics', JSON.stringify(next)) } catch {}
  }

  const hasAssessment = !!assessmentData.risk_level

  // ─── Health sheet content ────────────────────────────────────────────────────

  const renderHealthSheet = () => {
    if (!hasAssessment) {
      return (
        <div className="px-5 pt-5 pb-8">
          <p className="text-base text-text-sub text-center py-6">完成首次评估后，可在此查看你的身体状况档案。</p>
        </div>
      )
    }

    const diagnosis = assessmentData.diagnosis_type as string
    const comorbidities = (assessmentData.comorbidities as string[]) || []
    const hasComorbidities = comorbidities.length > 0 && !comorbidities.includes('none')
    const phq2 = (assessmentData.phq2_score as number) || 0
    const gad2 = (assessmentData.gad2_score as number) || 0
    const betaKey = String(assessmentData.has_beta_blocker || 'unknown')
    const hasDepression = phq2 >= 3
    const hasAnxiety = gad2 >= 3

    return (
      <div className="px-5 pt-5 pb-8 space-y-5 overflow-y-auto max-h-[75vh]">
        {/* 基础疾病 */}
        <section>
          <p className="text-xs font-semibold text-text-sub uppercase tracking-wider mb-3">基础疾病</p>
          <div className="bg-card rounded-card p-4 space-y-3">
            {diagnosis && (
              <div>
                <p className="text-sm font-medium text-text mb-1">{DIAGNOSIS_LABELS[diagnosis] || diagnosis}</p>
                <p className="text-sm text-text-sub leading-relaxed">{DIAGNOSIS_NOTES[diagnosis]}</p>
              </div>
            )}
            {hasComorbidities && (
              <div className={`${diagnosis ? 'pt-3 border-t border-border' : ''} space-y-3`}>
                {comorbidities.filter(c => c !== 'none').map(c => (
                  <div key={c}>
                    <p className="text-sm font-medium text-text mb-1">{COMORBIDITY_LABELS[c] || c}</p>
                    <p className="text-sm text-text-sub leading-relaxed">{COMORBIDITY_NOTES[c]}</p>
                  </div>
                ))}
              </div>
            )}
            {!diagnosis && !hasComorbidities && (
              <p className="text-sm text-text-sub">暂无记录</p>
            )}
          </div>
        </section>

        {/* 心理情况 */}
        <section>
          <p className="text-xs font-semibold text-text-sub uppercase tracking-wider mb-3">心理情况</p>
          <div className="bg-card rounded-card p-4">
            {(hasDepression || hasAnxiety) ? (
              <div className="space-y-2">
                {hasDepression && (
                  <div className="flex items-start gap-2">
                    <span className="text-orange text-sm mt-0.5">●</span>
                    <p className="text-sm text-text leading-relaxed">抑郁筛查提示需关注（PHQ-2 ≥3）</p>
                  </div>
                )}
                {hasAnxiety && (
                  <div className="flex items-start gap-2">
                    <span className="text-orange text-sm mt-0.5">●</span>
                    <p className="text-sm text-text leading-relaxed">焦虑筛查提示需关注（GAD-2 ≥3）</p>
                  </div>
                )}
                <p className="text-sm text-text-sub leading-relaxed pt-1">
                  焦虑和抑郁通过激活交感神经系统，持续升高心率和血压，削弱免疫功能，影响康复依从性。保持积极放松的心态是康复的重要组成部分，建议与医生或心理咨询师沟通。
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-green-dark mb-1">心理基线良好</p>
                <p className="text-sm text-text-sub leading-relaxed">
                  积极的心理状态有助于提升康复依从性，降低交感神经的过度激活，对心脏功能恢复有实质性的正向作用。继续保持。
                </p>
              </div>
            )}
          </div>
        </section>

        {/* 用药情况 */}
        <section>
          <p className="text-xs font-semibold text-text-sub uppercase tracking-wider mb-3">用药情况</p>
          <div className="bg-card rounded-card p-4">
            <p className="text-sm font-medium text-text mb-1">
              β 受体阻滞剂：{betaKey === 'true' ? '服用中' : betaKey === 'false' ? '未服用' : '不确定'}
            </p>
            <p className="text-sm text-text-sub leading-relaxed">{BETA_NOTES[betaKey] || BETA_NOTES['unknown']}</p>
          </div>
        </section>

        {/* 吸烟状况 */}
        <section>
          <p className="text-xs font-semibold text-text-sub uppercase tracking-wider mb-3">吸烟状况</p>
          <div className={`rounded-card p-4 ${smokingStatus === 'smoker' ? 'bg-orange-light' : 'bg-card'}`}>
            <p className="text-sm font-medium text-text mb-2">
              {smokingStatus === 'non_smoker' ? '不吸烟' : smokingStatus === 'quit' ? '已戒烟' : smokingStatus === 'smoker' ? '目前仍在吸烟' : '未记录'}
            </p>
            {smokingStatus && (
              <p className="text-sm text-text-sub leading-relaxed whitespace-pre-line">
                {SMOKING_NOTES[smokingStatus]}
              </p>
            )}
          </div>
        </section>
      </div>
    )
  }

  // ─── Content pref sheet content ──────────────────────────────────────────────

  const renderContentPrefSheet = () => {
    const activeTopics = preferredTopics.filter(t => MANAGEABLE_TOPICS.includes(t))
    const inactiveTopics = MANAGEABLE_TOPICS.filter(t => !preferredTopics.includes(t))

    return (
      <div className="px-5 pt-5 pb-8">
        <p className="text-sm text-text-sub mb-4 leading-relaxed">
          你感兴趣的话题会影响首页科普卡片的优先推送。在首页科普卡片底部点击话题标签可快速添加。
        </p>

        {isSmokingRelevant && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-text-sub uppercase tracking-wider mb-2">默认推送（不可更改）</p>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 h-9 px-3 rounded-pill bg-orange-light border border-orange text-sm text-orange font-medium">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="#BA7517" strokeWidth="2" />
                  <path d="M7 11V7C7 5 9 3 12 3C15 3 17 5 17 7V11" stroke="#BA7517" strokeWidth="2" strokeLinecap="round" />
                </svg>
                {TOPIC_LABELS['smoking_cessation']}
              </div>
            </div>
          </div>
        )}

        {activeTopics.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-text-sub uppercase tracking-wider mb-2">已选话题</p>
            <div className="flex flex-wrap gap-2">
              {activeTopics.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTopic(t)}
                  className="flex items-center gap-1.5 h-9 px-3 rounded-pill bg-blue-light border border-blue text-sm text-blue font-medium"
                >
                  {TOPIC_LABELS[t]}
                  <span className="text-blue/60 text-xs">×</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {inactiveTopics.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-text-sub uppercase tracking-wider mb-2">添加话题</p>
            <div className="flex flex-wrap gap-2">
              {inactiveTopics.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTopic(t)}
                  className="flex items-center gap-1.5 h-9 px-3 rounded-pill bg-card border border-border text-sm text-text"
                >
                  <span className="text-text-sub text-xs">+</span>
                  {TOPIC_LABELS[t]}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTopics.length === 0 && !isSmokingRelevant && (
          <p className="text-sm text-text-sub text-center py-4">
            尚未选择任何话题。在首页科普卡片底部点击感兴趣的话题即可添加。
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-bg">
      <div className="flex-shrink-0 h-11 flex items-center justify-between px-5">
        <span className="text-[15px] font-semibold text-text">9:41</span>
      </div>
      <div className="flex-shrink-0 h-12 flex items-center px-4 border-b border-border">
        <h1 className="text-lg font-semibold text-text">我</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4 space-y-4">
        {/* User info */}
        <div className="bg-card rounded-card p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-light flex items-center justify-center flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="3.5" stroke="#185FA5" strokeWidth="1.8" />
              <path d="M4 20C4 17 7.58172 15 12 15C16.4183 15 20 17 20 20" stroke="#185FA5" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-base font-semibold text-text">康复用户</p>
            {riskLevel ? (
              <span className={`text-xs px-2 py-0.5 rounded-pill font-medium ${
                riskLevel === 'high' ? 'bg-orange-light text-orange' : 'bg-green-light text-green-dark'
              }`}>
                {getRiskDisplayLabel(riskLevel as 'low' | 'medium' | 'high')}
              </span>
            ) : (
              <span className="text-xs px-2 py-0.5 rounded-pill font-medium bg-card text-text-sub">
                评估未完成
              </span>
            )}
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <button
              type="button"
              onClick={() => setHealthSheet(true)}
              className="min-h-[36px] flex items-center text-sm text-text-sub"
            >
              身体状况
            </button>
            <Link
              href="/profile/update-assessment"
              className="min-h-[36px] flex items-center text-sm text-blue"
            >
              更新评估
            </Link>
          </div>
        </div>

        {/* Rehab progress */}
        <div className="bg-card rounded-card p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-base font-semibold text-text">康复进度</h3>
            <span className="text-sm text-text-sub">适应期</span>
          </div>
          <p className="text-2xl font-bold text-blue mb-4">累计运动 {totalSessions} 次</p>
          <div className="flex gap-2">
            {milestones.map(m => (
              <MilestoneCard key={m.count} {...m} />
            ))}
          </div>
        </div>

        {/* Followup history */}
        <div className="bg-card rounded-card p-4">
          <h3 className="text-base font-semibold text-text mb-3">随访记录</h3>
          {followupRecords.length === 0 ? (
            <p className="text-sm text-text-sub text-center py-3">暂无随访记录</p>
          ) : (
            <div className="border-l-2 border-border ml-2 space-y-0">
              {followupRecords.map((r, i) => (
                <div key={i} className="relative pl-5 pb-4 last:pb-0">
                  <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue" />
                  <p className="text-sm text-text-sub">{r.date}</p>
                  <p className="text-base font-medium text-text">{r.type}</p>
                  <p className="text-sm text-text-sub">{r.summary}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Risk factor monitoring */}
        {hasAssessment && (
          <div className="bg-card rounded-card p-4">
            <h3 className="text-base font-semibold text-text mb-3">危险因素监测</h3>
            {latestRiskData ? (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-sub">血压（收缩压）</span>
                  <span className={`text-sm font-medium ${BP_DISPLAY[latestRiskData.bp_reading || '']?.urgent ? 'text-orange' : 'text-green-dark'}`}>
                    {BP_DISPLAY[latestRiskData.bp_reading || '']?.label || '暂无记录'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-sub">体重变化</span>
                  <span className={`text-sm font-medium ${WEIGHT_DISPLAY[latestRiskData.weight_change || '']?.urgent ? 'text-orange' : 'text-green-dark'}`}>
                    {WEIGHT_DISPLAY[latestRiskData.weight_change || '']?.label || '暂无记录'}
                  </span>
                </div>
                {isSmokingRelevant && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-sub">吸烟情况</span>
                    <span className={`text-sm font-medium ${
                      latestRiskData.smoking_check
                        ? SMOKING_CHECK_DISPLAY[latestRiskData.smoking_check]?.urgent ? 'text-orange' : 'text-green-dark'
                        : 'text-text-sub'
                    }`}>
                      {latestRiskData.smoking_check ? SMOKING_CHECK_DISPLAY[latestRiskData.smoking_check]?.label : '暂无记录'}
                    </span>
                  </div>
                )}
                <p className="text-xs text-text-sub pt-1 border-t border-border">上次随访 · {latestRiskData.date}</p>
              </div>
            ) : (
              <p className="text-sm text-text-sub">完成随访后，危险因素监测数据将在此显示。</p>
            )}
          </div>
        )}

        {/* Settings */}
        <div className="bg-card rounded-card divide-y divide-border">
          <Link
            href="/onboarding/guide"
            className="flex items-center justify-between min-h-[52px] px-4"
          >
            <span className="text-base text-text">重看功能引导</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="#888780" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </Link>
          <button
            type="button"
            onClick={() => setContentPrefSheet(true)}
            className="w-full flex items-center justify-between min-h-[52px] px-4"
          >
            <span className="text-base text-text">科普内容偏好</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="#888780" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <Link
            href="#"
            className="flex items-center justify-between min-h-[52px] px-4"
          >
            <span className="text-base text-text">隐私说明</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="#888780" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Health status bottom sheet */}
      {healthSheet && (
        <div
          className="absolute inset-0 bg-black/50 flex items-end z-50"
          onClick={e => { if (e.target === e.currentTarget) setHealthSheet(false) }}
        >
          <div className="bg-bg rounded-t-2xl w-full max-w-[390px] mx-auto">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border">
              <h2 className="text-lg font-semibold text-text">身体状况</h2>
              <button
                type="button"
                onClick={() => setHealthSheet(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-text-sub"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="#888780" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            {renderHealthSheet()}
          </div>
        </div>
      )}

      {/* Content preference bottom sheet */}
      {contentPrefSheet && (
        <div
          className="absolute inset-0 bg-black/50 flex items-end z-50"
          onClick={e => { if (e.target === e.currentTarget) setContentPrefSheet(false) }}
        >
          <div className="bg-bg rounded-t-2xl w-full max-w-[390px] mx-auto">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border">
              <h2 className="text-lg font-semibold text-text">科普内容偏好</h2>
              <button
                type="button"
                onClick={() => setContentPrefSheet(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-text-sub"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="#888780" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            {renderContentPrefSheet()}
          </div>
        </div>
      )}
    </div>
  )
}
