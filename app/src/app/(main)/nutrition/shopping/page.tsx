import Link from 'next/link'

type Method = '方法①' | '方法②' | '方法③'

const METHOD_COLORS: Record<Method, string> = {
  '方法①': 'bg-orange text-white',
  '方法②': 'bg-green text-white',
  '方法③': 'bg-blue text-white',
}

function MethodBadge({ method }: { method: Method }) {
  return (
    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-pill ${METHOD_COLORS[method]}`}>
      {method}
    </span>
  )
}

const SECTIONS: Array<{
  title: string
  methods: Method[]
  principle: string
  items: Array<{ name: string; tip: string; good: boolean | null }>
}> = [
  {
    title: '主食',
    methods: ['方法①'],
    principle: '碳水来源的质量影响血糖和甘油三酯。全谷物比精制米面 GI 低、纤维多、饱腹感强。',
    items: [
      { name: '燕麦（整粒/钢切）', tip: 'β-葡聚糖降低 LDL 胆固醇，GI 低，饱腹感强', good: true },
      { name: '糙米 / 杂粮饭', tip: '保留麸皮和胚芽，膳食纤维是白米的 3–4 倍', good: true },
      { name: '红薯 / 山药', tip: '钾含量高，有助于维持血压，可替代部分主食计算', good: true },
      { name: '全麦面包（注意成分表）', tip: '需确认全麦粉排配料第一位，有添加糖的品牌需控量', good: null },
      { name: '精白米 / 白面条', tip: '精制碳水 GI 高，大量食用影响血糖，不利体重管理', good: false },
      { name: '普通白面包 / 起酥包', tip: '高 GI + 含反式脂肪酸（起酥油），双重不利因素', good: false },
    ],
  },
  {
    title: '蛋白质',
    methods: ['方法①', '方法②'],
    principle: '方法①：每餐需有蛋白质来源；方法②：优先选脂肪来源好的（鱼类、豆类），减少加工肉制品（高钠高饱和脂肪）。',
    items: [
      { name: '鲈鱼 / 鲫鱼 / 鳕鱼', tip: '富含 Omega-3，低嘌呤，适合同时有高尿酸的患者', good: true },
      { name: '豆腐 / 毛豆', tip: '植物蛋白，饱和脂肪低，大豆异黄酮有心血管保护作用', good: true },
      { name: '鸡蛋（全蛋）', tip: '优质蛋白，每天 1 个无需过度限制', good: true },
      { name: '鸡肉 / 鸭肉（去皮）', tip: '去皮后饱和脂肪显著降低，是优质白肉来源', good: null },
      { name: '瘦牛肉 / 猪里脊', tip: '铁含量高，但饱和脂肪较多，每周控制在 500g 以内', good: null },
      { name: '香肠 / 培根 / 腊肉', tip: '高钠、高饱和脂肪、含亚硝酸盐，心血管风险明确', good: false },
    ],
  },
  {
    title: '蔬菜',
    methods: ['方法①'],
    principle: '蔬菜是"植物打底"的核心——每天 ≥ 400g，深色（绿/橙/红）占一半以上，种类越多越好。',
    items: [
      { name: '西蓝花 / 菠菜 / 空心菜', tip: '深色叶菜富含叶酸和抗氧化素；服华法林者请控量', good: true },
      { name: '番茄 / 胡萝卜 / 南瓜', tip: '番茄红素和 β-胡萝卜素，抗氧化，加热后吸收更佳', good: true },
      { name: '大蒜 / 洋葱', tip: '含有机硫化物，有助于轻度降低胆固醇和血压', good: true },
      { name: '土豆 / 芋头', tip: '淀粉含量高，建议作为主食替代计算，非额外添加', good: null },
      { name: '腌制蔬菜（泡菜/咸菜）', tip: '钠含量极高，100g 泡菜含盐量可超出全天推荐量', good: false },
    ],
  },
  {
    title: '油脂',
    methods: ['方法②'],
    principle: '方法②的核心区域：脂肪来源决定好坏。植物油/坚果/鱼护心；起酥油/猪油/氢化植物油伤心。',
    items: [
      { name: '橄榄油（初榨）', tip: '单不饱和脂肪酸最丰富，适合凉拌和低温烹饪', good: true },
      { name: '核桃 / 杏仁（无盐）', tip: '含 Omega-3、维生素 E；每天一小把（约 30g）', good: true },
      { name: '茶籽油 / 菜籽油', tip: 'Omega-3/Omega-6 比例较优，耐高温，适合中式炒菜', good: true },
      { name: '花生油 / 玉米油', tip: 'Omega-6 偏高，少量使用问题不大，注意总量控制', good: null },
      { name: '猪油 / 黄油 / 椰子油', tip: '饱和脂肪酸高，过量摄入升高 LDL 胆固醇', good: false },
      { name: '起酥油 / 氢化植物油', tip: '含反式脂肪酸，明确增加心血管风险——查配料表', good: false },
    ],
  },
  {
    title: '零食 & 饮料',
    methods: ['方法③'],
    principle: '方法③的重灾区：含糖饮料的隐形糖、薯片饼干的隐性盐，都是"感觉不明显"但实际摄入很高的来源。',
    items: [
      { name: '新鲜水果（整果）', tip: '蓝莓、苹果、橙子富含黄酮和膳食纤维；果汁会丢失纤维且升糖更快', good: true },
      { name: '无盐混合坚果', tip: '健康脂肪来源，每天 30g，选无盐无糖品种', good: true },
      { name: '黑巧克力（可可 70%+）', tip: '含黄烷醇有护心作用，但热量较高，每次 1–2 片', good: null },
      { name: '含糖碳酸饮料 / 果汁饮料', tip: '每瓶可含 8–12 茶匙糖；果汁的果糖还会升高尿酸', good: false },
      { name: '饼干 / 薯片 / 膨化食品', tip: '高钠、高饱和脂肪，部分含反式脂肪，营养密度极低', good: false },
    ],
  },
]

const StatusDot = ({ good }: { good: boolean | null }) => {
  if (good === true) return <span className="w-2 h-2 rounded-full bg-green flex-shrink-0 mt-[7px]" />
  if (good === false) return <span className="w-2 h-2 rounded-full bg-red flex-shrink-0 mt-[7px]" />
  return <span className="w-2 h-2 rounded-full bg-border flex-shrink-0 mt-[7px]" />
}

export default function NutritionShoppingPage() {
  return (
    <div className="flex flex-col h-full bg-bg">
      <div className="flex-shrink-0 h-11 flex items-center justify-between px-5">
        <span className="text-[15px] font-semibold text-text">9:41</span>
      </div>
      <div className="flex-shrink-0 h-12 flex items-center gap-3 px-4 border-b border-border">
        <Link href="/nutrition" className="flex items-center min-h-[44px] min-w-[44px] -ml-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 19L8 12L15 5" stroke="#2C2A26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <h1 className="text-lg font-semibold text-text">超市选购指南</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6 space-y-4">

        {/* Intro */}
        <div className="bg-blue-light rounded-card px-4 py-3 text-sm text-blue leading-relaxed border border-blue/20">
          这里的每一条建议背后都在用营养页讲的三个方法——看到方法标签，就知道是哪条方法在起作用。
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-sm text-text-sub">
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green inline-block" />优先选</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-border inline-block" />适量</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red inline-block" />减少/避免</div>
        </div>

        {SECTIONS.map(section => (
          <div key={section.title}>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-base font-semibold text-text">{section.title}</h2>
              {section.methods.map(m => <MethodBadge key={m} method={m} />)}
            </div>
            <div className="bg-card rounded-card px-4 py-2 mb-1.5 text-sm text-text-sub leading-relaxed border-l-2 border-border">
              {section.principle}
            </div>
            <div className="bg-card rounded-card divide-y divide-border">
              {section.items.map(item => (
                <div key={item.name} className="flex items-start gap-3 px-4 py-3">
                  <StatusDot good={item.good} />
                  <div>
                    <p className="text-[15px] font-medium text-text">{item.name}</p>
                    <p className="text-sm text-text-sub leading-relaxed">{item.tip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
