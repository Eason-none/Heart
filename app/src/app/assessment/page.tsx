'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { calculateRiskLevel } from '@/lib/exercise/risk'
import { generateInitialPrescription } from '@/lib/exercise/prescription'

// ─── Types ────────────────────────────────────────────────────────────────────

type Answers = Record<string, unknown>

// ─── VSAQ items (simplified) ──────────────────────────────────────────────────

const VSAQ_ITEMS = [
  { score: 1, label: '只能做轻度家务（如扫地、洗碗）' },
  { score: 2, label: '可以慢走（3 km/h）' },
  { score: 3, label: '可以平地慢走（4 km/h）或做轻松家务（如拖地）' },
  { score: 4, label: '可以以中等速度步行（5 km/h）或做园艺工作' },
  { score: 5, label: '可以快走（6 km/h）或爬 1 层楼梯不感到明显费力' },
  { score: 6, label: '可以爬 2 层楼梯或做稍重的家务（如搬轻物）' },
  { score: 7, label: '可以骑自行车（平路，轻松速度）或慢跑短距离' },
  { score: 8, label: '可以慢跑（8 km/h）或爬山（平缓坡道）' },
  { score: 9, label: '可以较快骑车或爬较陡的坡道' },
  { score: 10, label: '可以持续慢跑 20–30 分钟' },
  { score: 11, label: '可以中速跑步或打球类运动（羽毛球/乒乓球）' },
  { score: 12, label: '可以快跑或打激烈球类运动' },
  { score: 13, label: '可以进行高强度运动（如跑步超过 10 km/h）' },
]

// ─── Group configs ─────────────────────────────────────────────────────────────

const GROUP_LABELS = ['基本信息', '心脏功能', '慢病与用药', '功能储备', '心理基线']
const GROUP_INTROS = [
  '先了解一些基本情况，帮助我们了解你的起点。',
  '接下来几个问题关于你的心脏功能状态。有些可以跳过。',
  '了解一下你目前的慢性病和用药情况。',
  '这部分评估你目前的运动能力，是制定处方的核心依据。',
  '最后几题关注你的心理状态，这对康复同样重要。',
]

// ─── Main component ───────────────────────────────────────────────────────────

export default function AssessmentPage() {
  const router = useRouter()
  const [group, setGroup] = useState(1)
  const [showIntro, setShowIntro] = useState(true)
  const [answers, setAnswers] = useState<Answers>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [highRiskModal, setHighRiskModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const set = useCallback((key: string, value: unknown) => {
    setAnswers(prev => ({ ...prev, [key]: value }))
    setErrors(prev => { const n = { ...prev }; delete n[key]; return n })
  }, [])

  const toggleComorbidity = (val: string) => {
    const current = (answers.comorbidities as string[]) || []
    if (val === 'none') {
      set('comorbidities', current.includes('none') ? [] : ['none'])
      return
    }
    const filtered = current.filter(v => v !== 'none')
    set('comorbidities', filtered.includes(val) ? filtered.filter(v => v !== val) : [...filtered, val])
  }

  const isSelected = (key: string, val: string) => {
    const v = answers[key]
    if (Array.isArray(v)) return v.includes(val)
    return v === val
  }

  const handleHighRiskTrigger = () => setHighRiskModal(true)

  const confirmHighRisk = () => {
    setHighRiskModal(false)
    // Store partial answers with high risk flag and navigate to summary
    const data = { ...answers, is_high_risk: true, risk_level: 'high' }
    localStorage.setItem('assessment_answers', JSON.stringify(data))
    router.push('/assessment/summary?risk=high')
  }

  const validateGroup = (): boolean => {
    const errs: Record<string, string> = {}
    if (group === 1) {
      if (!answers.age) errs.age = '此项必填'
      if (!answers.gender) errs.gender = '此项必填'
      if (!answers.height) errs.height = '此项必填'
      if (!answers.weight) errs.weight = '此项必填'
      if (!answers.waist) errs.waist = '此项必填'
      if (!answers.diagnosis_type) errs.diagnosis_type = '此项必填'
      if (!answers.months_since_surgery && answers.months_since_surgery !== 0) errs.months_since_surgery = '此项必填'
    }
    if (group === 3) {
      if (!answers.comorbidities || (answers.comorbidities as string[]).length === 0)
        errs.comorbidities = '请至少选择一项'
      if (!answers.has_beta_blocker && answers.has_beta_blocker !== false) errs.has_beta_blocker = '此项必填'
      if (!answers.smoking_status) errs.smoking_status = '此项必填'
    }
    if (group === 4) {
      if (!answers.vsaq_score) errs.vsaq_score = '此项必填'
    }
    if (group === 5) {
      if (answers.phq2_q1 === undefined) errs.phq2_q1 = '此项必填'
      if (answers.phq2_q2 === undefined) errs.phq2_q2 = '此项必填'
      if (answers.gad2_q1 === undefined) errs.gad2_q1 = '此项必填'
      if (answers.gad2_q2 === undefined) errs.gad2_q2 = '此项必填'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = () => {
    if (showIntro) { setShowIntro(false); return }
    if (!validateGroup()) return
    // Check high risk at end of group 2
    if (group === 2) {
      const q1 = answers.high_risk_q1 === true
      const q2 = answers.high_risk_q2 === true
      const q3 = answers.high_risk_q3 === true
      if (q1 || q2 || q3) { handleHighRiskTrigger(); return }
    }
    if (group === 5) { handleSubmit(); return }
    setGroup(g => g + 1)
    setShowIntro(true)
  }

  const handleBack = () => {
    if (showIntro && group > 1) { setGroup(g => g - 1); return }
    if (showIntro) { router.push('/consent'); return }
    // If on first Q of group, cross-group back would need confirmation (handled inline)
    setShowIntro(true)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    const phq2 = ((answers.phq2_q1 as number) || 0) + ((answers.phq2_q2 as number) || 0)
    const gad2 = ((answers.gad2_q1 as number) || 0) + ((answers.gad2_q2 as number) || 0)
    const riskInput = {
      high_risk_q1: answers.high_risk_q1 === true,
      high_risk_q2: answers.high_risk_q2 === true,
      high_risk_q3: answers.high_risk_q3 === true,
      phq2_score: phq2,
      gad2_score: gad2,
      lvef: answers.lvef as number | undefined,
      vsaq_score: (answers.vsaq_score as number) || 5,
    }
    const risk_level = calculateRiskLevel(riskInput)
    if (risk_level === 'high') {
      const data = { ...answers, risk_level, phq2_score: phq2, gad2_score: gad2 }
      localStorage.setItem('assessment_answers', JSON.stringify(data))
      router.push('/assessment/summary?risk=high')
      return
    }
    const prescription = generateInitialPrescription({
      vsaq_score: (answers.vsaq_score as number) || 5,
      months_since_surgery: (answers.months_since_surgery as number) || 12,
      diagnosis_type: (answers.diagnosis_type as 'pci') || 'pci',
      risk_level,
    })
    const data = { ...answers, risk_level, phq2_score: phq2, gad2_score: gad2, prescription }
    localStorage.setItem('assessment_answers', JSON.stringify(data))
    router.push(`/assessment/summary?risk=${risk_level}`)
  }

  // ─── Render helpers ──────────────────────────────────────────────────────────

  function SingleSelect({ qKey, options }: { qKey: string; options: { value: string; label: string }[] }) {
    return (
      <div className="flex flex-col gap-2">
        {options.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => set(qKey, opt.value)}
            className={`w-full min-h-[52px] px-4 rounded-card text-left text-base transition-all ${
              isSelected(qKey, opt.value)
                ? 'bg-blue-light border-2 border-blue text-blue font-medium'
                : 'bg-card border border-border text-text'
            }`}
          >
            {opt.label}
          </button>
        ))}
        {errors[qKey] && <p className="text-sm text-red">{errors[qKey]}</p>}
      </div>
    )
  }

  function NumberInput({ qKey, label, unit, min, max, skippable }: {
    qKey: string; label?: string; unit: string; min: number; max: number; skippable?: boolean
  }) {
    const val = answers[qKey] as string | undefined
    const num = val ? parseFloat(val) : NaN
    const outOfRange = !isNaN(num) && (num < min || num > max)
    return (
      <div>
        {label && <p className="text-base text-text mb-2">{label}</p>}
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            value={val || ''}
            onChange={e => set(qKey, e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="请输入"
            className={`flex-1 h-12 px-4 rounded-btn border bg-white text-base text-text outline-none focus:border-blue transition-colors ${
              outOfRange ? 'border-red' : 'border-border'
            }`}
          />
          <span className="text-text-sub text-base w-10">{unit}</span>
        </div>
        {outOfRange && <p className="text-sm text-red mt-1">请输入合理数值（{min}–{max}）</p>}
        {errors[qKey] && !outOfRange && <p className="text-sm text-red mt-1">{errors[qKey]}</p>}
        {skippable && <p className="text-sm text-text-sub mt-1">可跳过</p>}
      </div>
    )
  }

  function YesNo({ qKey, onYes }: { qKey: string; onYes?: () => void }) {
    return (
      <div className="flex gap-3">
        {[{ v: false, l: '没有' }, { v: true, l: '有' }].map(opt => (
          <button
            key={String(opt.v)}
            type="button"
            onClick={() => { set(qKey, opt.v); if (opt.v && onYes) onYes() }}
            className={`flex-1 min-h-[52px] rounded-card border text-base font-medium transition-all ${
              answers[qKey] === opt.v
                ? 'bg-blue-light border-2 border-blue text-blue'
                : 'bg-card border-border text-text'
            }`}
          >
            {opt.l}
          </button>
        ))}
      </div>
    )
  }

  function LikertRow({ qKey, question }: { qKey: string; question: string }) {
    return (
      <div className="mb-4">
        <p className="text-base text-text mb-2 leading-relaxed">{question}</p>
        <div className="flex gap-2">
          {[
            { v: 0, l: '完全没有' },
            { v: 1, l: '几天' },
            { v: 2, l: '一半以上时间' },
            { v: 3, l: '几乎每天' },
          ].map(opt => (
            <button
              key={opt.v}
              type="button"
              onClick={() => set(qKey, opt.v)}
              className={`flex-1 min-h-[52px] rounded-card border text-xs text-center font-medium leading-tight px-1 transition-all ${
                answers[qKey] === opt.v
                  ? 'bg-blue-light border-2 border-blue text-blue'
                  : 'bg-card border-border text-text'
              }`}
            >
              {opt.l}
            </button>
          ))}
        </div>
        {errors[qKey] && <p className="text-sm text-red mt-1">{errors[qKey]}</p>}
      </div>
    )
  }

  // ─── Group content ────────────────────────────────────────────────────────────

  const renderGroup = () => {
    if (showIntro) return null
    switch (group) {
      case 1: return (
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-base font-medium text-text mb-2">年龄</p>
            <NumberInput qKey="age" unit="岁" min={18} max={99} />
          </div>
          <div>
            <p className="text-base font-medium text-text mb-2">性别</p>
            <SingleSelect qKey="gender" options={[{ value: 'male', label: '男' }, { value: 'female', label: '女' }]} />
          </div>
          <div>
            <p className="text-base font-medium text-text mb-2">身高 / 体重 / 腰围</p>
            <div className="flex flex-col gap-2">
              <NumberInput qKey="height" label="身高" unit="cm" min={100} max={220} />
              <NumberInput qKey="weight" label="体重" unit="kg" min={30} max={200} />
              <NumberInput qKey="waist" label="腰围" unit="cm" min={40} max={180} />
            </div>
          </div>
          <div>
            <p className="text-base font-medium text-text mb-2">诊断类型</p>
            <SingleSelect qKey="diagnosis_type" options={[
              { value: 'stable_angina', label: '稳定型心绞痛' },
              { value: 'pci', label: 'PCI（支架）术后' },
              { value: 'cabg', label: 'CABG（搭桥）术后' },
              { value: 'mi_recovery', label: '心梗恢复期' },
            ]} />
          </div>
          <div>
            <p className="text-base font-medium text-text mb-2">手术/确诊距今大约多久？</p>
            <SingleSelect qKey="months_since_surgery" options={[
              { value: '1', label: '1 个月以内' },
              { value: '3', label: '1–3 个月' },
              { value: '6', label: '3–6 个月' },
              { value: '12', label: '6–12 个月' },
              { value: '18', label: '12–24 个月' },
              { value: '0', label: '24 个月以上' },
            ]} />
          </div>
        </div>
      )

      case 2: return (
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-base font-medium text-text mb-1">静息心率（可跳过）</p>
            <NumberInput qKey="resting_hr" unit="次/分" min={30} max={200} skippable />
          </div>
          <div>
            <p className="text-base font-medium text-text mb-1">血压（可跳过）</p>
            <div className="flex gap-2 items-center">
              <NumberInput qKey="systolic_bp" label="收缩压" unit="mmHg" min={60} max={250} skippable />
              <span className="text-text-sub mt-6">/</span>
              <NumberInput qKey="diastolic_bp" label="舒张压" unit="mmHg" min={40} max={150} skippable />
            </div>
          </div>
          <div>
            <p className="text-base font-medium text-text mb-2">医生有没有提过你的心脏泵血功能比较弱？</p>
            <YesNo qKey="lvef_weak" />
            {answers.lvef_weak === true && (
              <div className="mt-3">
                <p className="text-sm text-text-sub mb-2">如果知道具体数值（射血分数 EF 值），可以填写：</p>
                <div className="flex items-center gap-3">
                  <NumberInput qKey="lvef" unit="%" min={10} max={80} skippable />
                  <button
                    type="button"
                    onClick={() => set('lvef', 'unknown')}
                    className={`whitespace-nowrap min-h-[48px] px-4 rounded-btn border text-sm transition-all ${
                      answers.lvef === 'unknown' ? 'bg-blue-light border-blue text-blue' : 'bg-card border-border text-text-sub'
                    }`}
                  >
                    等我问医生
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="bg-orange-light border-l-4 border-orange rounded-card p-3">
            <p className="text-sm text-orange font-medium mb-1">以下三个问题很重要，请如实回答</p>
          </div>
          <div>
            <p className="text-base font-medium text-text mb-2">① 安静休息时，有没有出现过胸痛或胸闷？</p>
            <YesNo qKey="high_risk_q1" onYes={handleHighRiskTrigger} />
          </div>
          <div>
            <p className="text-base font-medium text-text mb-2">② 近半年内，有没有出现过晕倒或差点晕倒的情况？</p>
            <YesNo qKey="high_risk_q2" onYes={handleHighRiskTrigger} />
          </div>
          <div>
            <p className="text-base font-medium text-text mb-2">③ 是否被诊断过心力衰竭或严重心律失常？</p>
            <YesNo qKey="high_risk_q3" onYes={handleHighRiskTrigger} />
          </div>
        </div>
      )

      case 3: return (
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-base font-medium text-text mb-2">目前合并有哪些慢性病？（可多选）</p>
            {[
              { value: 'hypertension', label: '高血压' },
              { value: 'diabetes', label: '糖尿病' },
              { value: 'hyperlipidemia', label: '高血脂' },
              { value: 'hyperuricemia', label: '高尿酸' },
              { value: 'none', label: '以上都没有' },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleComorbidity(opt.value)}
                className={`w-full min-h-[52px] px-4 rounded-card border text-left text-base mb-2 transition-all ${
                  isSelected('comorbidities', opt.value)
                    ? 'bg-blue-light border-2 border-blue text-blue font-medium'
                    : 'bg-card border-border text-text'
                }`}
              >
                {opt.label}
              </button>
            ))}
            {errors.comorbidities && <p className="text-sm text-red">{errors.comorbidities}</p>}
          </div>
          <div>
            <p className="text-base font-medium text-text mb-2">
              是否服用 β 受体阻滞剂（如美托洛尔、比索洛尔、阿替洛尔等）？
            </p>
            <div className="bg-card rounded-card p-3 mb-2">
              <p className="text-sm text-text-sub">这类药物会影响心率反应，关系到运动强度计算方式。</p>
            </div>
            <SingleSelect qKey="has_beta_blocker" options={[
              { value: 'true', label: '是，我在服用' },
              { value: 'false', label: '没有' },
              { value: 'unknown', label: '不确定' },
            ]} />
          </div>
          <div>
            <p className="text-base font-medium text-text mb-2">吸烟状况</p>
            <SingleSelect qKey="smoking_status" options={[
              { value: 'non_smoker', label: '不吸烟' },
              { value: 'quit', label: '已戒烟' },
              { value: 'smoker', label: '目前仍在吸烟' },
            ]} />
          </div>
        </div>
      )

      case 4: return (
        <div className="flex flex-col gap-4">
          <div className="bg-blue-light rounded-card p-3">
            <p className="text-sm text-blue leading-relaxed">
              请选择你目前<strong>能持续完成</strong>的最高强度活动。这将用于制定你的初始运动处方。
            </p>
          </div>
          {VSAQ_ITEMS.map(item => (
            <button
              key={item.score}
              type="button"
              onClick={() => set('vsaq_score', item.score)}
              className={`w-full min-h-[52px] px-4 py-3 rounded-card border text-left text-base transition-all ${
                answers.vsaq_score === item.score
                  ? 'bg-blue-light border-2 border-blue text-blue font-medium'
                  : 'bg-card border-border text-text'
              }`}
            >
              <span className="text-text-sub text-sm mr-2">约 {item.score} MET</span>
              {item.label}
            </button>
          ))}
          {errors.vsaq_score && <p className="text-sm text-red">{errors.vsaq_score}</p>}
        </div>
      )

      case 5: return (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-text-sub leading-relaxed mb-2">
            在过去 2 周内，以下情况出现了多少天？
          </p>
          <LikertRow qKey="phq2_q1" question="做事提不起劲或缺乏兴趣" />
          <LikertRow qKey="phq2_q2" question="感到心情低落、沮丧或绝望" />
          <LikertRow qKey="gad2_q1" question="感到紧张、焦虑或烦躁不安" />
          <LikertRow qKey="gad2_q2" question="不能停止或无法控制担忧" />
        </div>
      )

      default: return null
    }
  }

  const progress = ((group - 1) / 5) * 100

  return (
    <div className="phone-shell">
      {/* Status bar */}
      <div className="flex-shrink-0 h-11 flex items-center justify-between px-5">
        <span className="text-[15px] font-semibold text-text">9:41</span>
        <div className="flex gap-1.5 text-xs text-text"><span>●●● WiFi 🔋</span></div>
      </div>

      {/* Progress */}
      <div className="flex-shrink-0 px-4 pt-2 bg-bg" style={{ zIndex: 10 }}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-text-sub">首次评估</span>
          <span className="text-sm font-semibold text-text">第 {group} 部分 / 共 5 部分</span>
        </div>
        <div className="h-1 bg-border rounded-full overflow-hidden mb-3">
          <div className="h-full bg-blue rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex gap-1.5 mb-3">
          {[1,2,3,4,5].map(g => (
            <div
              key={g}
              className={`flex-1 h-0.5 rounded-full ${g <= group ? 'bg-blue' : 'bg-border'}`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="scroll-area px-4 pt-3 pb-36">
        {showIntro ? (
          <div className="flex flex-col gap-4">
            <div className="py-4">
              <div className="text-xs font-semibold text-text-sub uppercase tracking-wider mb-1">
                第 {group} 部分
              </div>
              <h2 className="text-xl font-bold text-text mb-3">{GROUP_LABELS[group - 1]}</h2>
              <p className="text-base text-text leading-relaxed">{GROUP_INTROS[group - 1]}</p>
            </div>
          </div>
        ) : (
          renderGroup()
        )}
      </div>

      {/* Nav buttons */}
      <div className="flex-shrink-0 bg-bg border-t border-border px-4 pt-3 pb-6 flex gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="flex-shrink-0 min-h-[56px] w-14 rounded-btn bg-card border border-border flex items-center justify-center"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 19L8 12L15 5" stroke="#2C2A26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <Button
          onClick={handleNext}
          disabled={submitting}
          className="flex-1"
        >
          {submitting ? '生成计划中…' : showIntro ? '开始' : group === 5 ? '提交评估' : '下一部分'}
        </Button>
      </div>

      {/* High Risk Modal */}
      {highRiskModal && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-bg rounded-card p-6 w-full max-w-sm">
            <div className="w-14 h-14 rounded-full bg-orange-light flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18C1.64 18.32 1.55 18.69 1.55 19.05C1.55 20.16 2.44 21.05 3.55 21.05H20.45C21.56 21.05 22.45 20.16 22.45 19.05C22.45 18.69 22.36 18.32 22.18 18L13.71 3.86C13.14 2.85 11.86 2.85 11.29 3.86Z" stroke="#BA7517" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-text text-center mb-3">需要先做好准备</h3>
            <p className="text-base text-text leading-relaxed text-center mb-6">
              根据你的回答，我们建议在获得医生明确许可前，先使用营养、助手和科普等功能，暂缓开始运动康复。
            </p>
            <Button onClick={confirmHighRisk}>我明白了，继续</Button>
          </div>
        </div>
      )}
    </div>
  )
}
