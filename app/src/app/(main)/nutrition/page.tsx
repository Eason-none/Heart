'use client'
import { useState } from 'react'
import Link from 'next/link'

// ─── Data ─────────────────────────────────────────────────────────────────────

interface MethodData {
  badge: string
  badgeBg: string
  question: string
  subQuestion?: string
  preview: string
  mechanism: string
  examples: Array<{ bad: string; good: string }>
  chips: string[]
}

const METHODS: MethodData[] = [
  {
    badge: '方法①',
    badgeBg: 'bg-orange',
    question: '这顿饭，碳水占多少？',
    subQuestion: '有没有够的蛋白质？',
    preview: '警惕"清淡陷阱"：白粥+咸菜看着清素，实则高碳水、零蛋白质——对心脏康复其实不利。',
    mechanism: '心脏康复需要蛋白质来维持肌肉、支持修复。但很多患者把"清淡"理解成只吃粥和咸菜，这是碳水极高、蛋白质严重不足的组合。精制碳水吃多了还会直接升高甘油三酯——不只是"油腻食物"的问题。',
    examples: [
      { bad: '陷阱版：白粥＋腐乳＋榨菜（碳水极高，蛋白≈0）', good: '→ 燕麦粥＋水煮蛋＋清炒时蔬' },
      { bad: '外出吃面：一大碗阳春面（几乎全是精制碳水）', good: '→ 加蛋/加肉，选杂粮面，少喝汤' },
    ],
    chips: ['管血糖', '管甘油三酯', '管饱腹感'],
  },
  {
    badge: '方法②',
    badgeBg: 'bg-green',
    question: '这东西的脂肪，从哪儿来的？',
    preview: '不是"脂肪=坏"，关键是来源。鱼、坚果、植物油里的脂肪护心；油炸、起酥、肥肉里的脂肪伤心。',
    mechanism: '鱼、坚果、橄榄油里的不饱和脂肪酸有助于降低"坏"胆固醇（LDL-C）；而起酥点心、油炸食品、肥肉里的饱和脂肪和反式脂肪会升高 LDL-C，加速动脉斑块形成。买包装食品时查配料表是最直接的方法。',
    examples: [
      { bad: '配料表出现"氢化植物油""起酥油""植脂末"', good: '→ 含反式脂肪，直接避开' },
      { bad: '同时有高尿酸？避免沙丁鱼/秋刀鱼，少喝鱼汤火锅底', good: '→ 选鲈鱼、草鱼、鲫鱼' },
    ],
    chips: ['管胆固醇', '管炎症'],
  },
  {
    badge: '方法③',
    badgeBg: 'bg-blue',
    question: '"清淡" ≠ "低钠"',
    subQuestion: '这东西藏了多少盐、多少隐形糖？',
    preview: '1 勺生抽 ≈ 1000mg 钠。腐乳、榨菜、外卖——尝起来不咸，却是隐性盐的主要来源。',
    mechanism: '"清淡饮食"在很多患者心里等于少吃大鱼大肉，但隐性盐藏在每顿饭的调味里。含糖饮料里的果糖则同时升高血糖和尿酸——"鲜榨果汁=天然健康"是需要打破的误区。',
    examples: [
      { bad: '腐乳1块≈450mg · 榨菜1包≈600mg · 生抽1勺≈1000mg', good: '' },
      { bad: '鲜榨果汁 200ml：果糖 20g+，', good: '同时升血糖和尿酸，不是"天然无害"' },
    ],
    chips: ['管血压', '管血糖', '管尿酸'],
  },
]

const TIPS = [
  '每日钠摄入 < 2000mg（约 5g 盐），注意酱油、腌制品中的隐性盐',
  '避免一次性大量饮水，分次少量补充（每次 100–150ml）',
  '如服用华法林，避免突然大量增减菠菜、西蓝花等深绿色蔬菜',
]

// ─── Method card ──────────────────────────────────────────────────────────────

function MethodCard({ data }: { data: MethodData }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-card rounded-card overflow-hidden mb-2.5">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start gap-2.5 px-4 pt-3.5 pb-0 text-left"
      >
        <span className={`text-[11px] font-bold text-white px-2.5 py-0.5 rounded-pill flex-shrink-0 mt-0.5 ${data.badgeBg}`}>
          {data.badge}
        </span>
        <div className="flex-1">
          <p className="text-base font-bold text-text leading-snug">{data.question}</p>
          {data.subQuestion && (
            <p className="text-sm font-medium text-text-sub mt-0.5 leading-snug">{data.subQuestion}</p>
          )}
        </div>
        <span className={`text-text-sub flex-shrink-0 mt-0.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M6 9L12 15L18 9" stroke="#888780" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
      </button>

      {!open && (
        <p className="text-sm text-text-sub leading-relaxed px-4 py-3">{data.preview}</p>
      )}

      {open && (
        <div className="border-t border-border px-4 py-3.5">
          <p className="text-sm text-text leading-relaxed mb-3">{data.mechanism}</p>
          <p className="text-[11px] font-semibold text-text-sub uppercase tracking-wide mb-2">典型场景</p>
          <div className="flex flex-col gap-1.5 mb-3">
            {data.examples.map((ex, i) => (
              <div key={i} className="bg-bg rounded-btn px-3 py-2 text-sm text-text leading-relaxed">
                <span className="text-text-sub">{ex.bad}</span>
                {ex.good && <span className="font-semibold text-green-dark"> {ex.good}</span>}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {data.chips.map(c => (
              <span key={c} className="text-xs font-semibold px-2.5 py-0.5 rounded-pill border border-border text-text-sub">
                {c}
              </span>
            ))}
          </div>
          <Link href="/assistant" className="text-sm text-blue">
            这道菜怎么判断？问助手 ›
          </Link>
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NutritionPage() {
  return (
    <div className="flex flex-col h-full bg-bg">
      <div className="flex-shrink-0 h-11 flex items-center justify-between px-5">
        <span className="text-[15px] font-semibold text-text">9:41</span>
      </div>
      <div className="flex-shrink-0 h-12 flex items-center px-4 border-b border-border">
        <h1 className="text-lg font-semibold text-text">营养</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6">

        {/* Phase card */}
        <div className="flex items-center gap-2.5 bg-blue-light rounded-card px-4 py-3 mb-3.5">
          <span className="text-2xl flex-shrink-0">🌱</span>
          <div>
            <p className="text-[13px] font-semibold text-blue mb-0.5">适应期 · 第 1–4 周饮食重点</p>
            <p className="text-[13px] text-blue opacity-80 leading-snug">先从方法③开始——把家里的腌制品和调味品查一遍。</p>
          </div>
        </div>

        {/* 三个判断方法 */}
        <p className="text-[11px] font-semibold text-text-sub uppercase tracking-widest mb-1.5">三个判断方法</p>
        <p className="text-sm text-text-sub leading-relaxed mb-3">遇到不确定的食物，问自己这三个问题。就算没见过，也能大致判断。</p>

        {METHODS.map(m => <MethodCard key={m.badge} data={m} />)}

        {/* Behavior card */}
        <div className="bg-green-light rounded-card px-4 py-3.5 mb-3.5 border-l-4 border-green">
          <p className="text-sm font-bold text-green-dark mb-1.5">🥢 控血糖小习惯（方法①延伸）</p>
          <p className="text-sm text-green-dark leading-relaxed mb-1">
            同一顿饭，改变进食顺序就能降低餐后血糖峰值：
            <br />
            <span className="font-semibold">先蔬菜 → 再肉 → 最后才吃主食</span>
          </p>
          <p className="text-xs text-green-dark opacity-75 leading-relaxed">合并糖尿病或血糖偏高时特别有效。不改变吃什么，只改变顺序。</p>
        </div>

        {/* 实战练习场 */}
        <p className="text-[11px] font-semibold text-text-sub uppercase tracking-widest mb-1.5 mt-0.5">实战练习场</p>
        <p className="text-sm text-text-sub leading-relaxed mb-3">每个例子都在演示上面三条方法——边逛边练，比读一遍更有效。</p>

        <Link
          href="/nutrition/shopping"
          className="flex items-center gap-3.5 bg-card rounded-card px-4 h-[72px] mb-2.5"
        >
          <div className="w-11 h-11 rounded-[11px] bg-green-light flex items-center justify-center text-[22px] flex-shrink-0">🛒</div>
          <div className="flex-1">
            <p className="text-base font-bold text-text">超市选购指南</p>
            <p className="text-sm text-text-sub mt-0.5">每类食物都标注了背后用的是哪条方法</p>
          </div>
          <span className="text-xl text-text-sub">›</span>
        </Link>

        <Link
          href="/nutrition/swap"
          className="flex items-center gap-3.5 bg-card rounded-card px-4 h-[72px] mb-3.5"
        >
          <div className="w-11 h-11 rounded-[11px] bg-orange-light flex items-center justify-center text-[22px] flex-shrink-0">🔄</div>
          <div className="flex-1">
            <p className="text-base font-bold text-text">中式食材替换表</p>
            <p className="text-sm text-text-sub mt-0.5">看方法在真实场景里如何起作用</p>
          </div>
          <span className="text-xl text-text-sub">›</span>
        </Link>

        {/* Tips */}
        <div className="bg-orange-light rounded-card px-4 py-3.5 border-l-4 border-orange">
          <p className="text-sm font-bold text-orange mb-1.5">⚠ 本阶段需特别注意</p>
          <ul className="flex flex-col gap-1.5">
            {TIPS.map(tip => (
              <li key={tip} className="text-sm text-text leading-relaxed flex items-start gap-2">
                <span className="text-orange flex-shrink-0 mt-0.5">·</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  )
}
