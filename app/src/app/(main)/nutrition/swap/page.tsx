import Link from 'next/link'

type Method = '方法①' | '方法②' | '方法③'

const METHOD_COLORS: Record<Method, string> = {
  '方法①': 'bg-orange text-white',
  '方法②': 'bg-green text-white',
  '方法③': 'bg-blue text-white',
}

const SWAPS: Array<{
  original: string
  swap: string
  reason: string
  methods: Method[]
}> = [
  {
    original: '白粥 + 咸菜（早餐）',
    swap: '燕麦粥 + 水煮蛋 + 清炒时蔬',
    reason: '碳水极高、蛋白质≈0 的"清淡陷阱"——换成有蛋白质来源的早餐结构',
    methods: ['方法①'],
  },
  {
    original: '猪油 / 色拉油',
    swap: '茶籽油 / 菜籽油（炒菜）、橄榄油（凉拌）',
    reason: '用不饱和脂肪酸替代饱和脂肪，降低 LDL 胆固醇',
    methods: ['方法②'],
  },
  {
    original: '精白米饭（一碗）',
    swap: '白米 + 糙米 / 杂豆（1:1 混煮）',
    reason: '降低升糖指数，增加膳食纤维至原来的 2–3 倍，血糖更平稳',
    methods: ['方法①'],
  },
  {
    original: '猪五花 / 排骨',
    swap: '鲈鱼 / 鳕鱼（清蒸或少油烹饪）',
    reason: '每周 2 次以上鱼类可使甘油三酯降低约 15–20%；低嘌呤鱼种也适合高尿酸患者',
    methods: ['方法①', '方法②'],
  },
  {
    original: '酱油（大量）',
    swap: '少量低钠酱油 + 醋 + 葱姜',
    reason: '1 勺酱油≈1000mg 钠——减钠不减味的核心策略',
    methods: ['方法③'],
  },
  {
    original: '腌制咸鱼 / 腊肉',
    swap: '新鲜鱼类 / 去皮禽肉',
    reason: '腌制食品高钠高亚硝酸盐；换成新鲜蛋白质，同时减少隐性盐',
    methods: ['方法②', '方法③'],
  },
  {
    original: '普通食盐',
    swap: '低钠盐（钾盐）',
    reason: '在不改变咸度感知的前提下减少约 1/3 钠摄入；肾功能不全者请咨询医生',
    methods: ['方法③'],
  },
  {
    original: '油条 / 起酥面包（早餐）',
    swap: '全麦馒头 / 杂粮面包',
    reason: '油炸起酥含反式脂肪；换成全谷物早餐同时改善碳水质量',
    methods: ['方法①', '方法②'],
  },
  {
    original: '含糖饮料 / 鲜榨果汁',
    swap: '白开水 / 淡绿茶 / 整颗水果',
    reason: '果汁丢失纤维且含大量果糖，同时升血糖和尿酸；整果比果汁更优',
    methods: ['方法③'],
  },
  {
    original: '薯片 / 饼干（零食）',
    swap: '原味坚果一小把（约 30g）',
    reason: '用健康脂肪来源替代高钠高饱和脂肪的空热量零食',
    methods: ['方法②', '方法③'],
  },
]

export default function NutritionSwapPage() {
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
        <h1 className="text-lg font-semibold text-text">中式食材替换表</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6">
        <p className="text-sm text-text-sub leading-relaxed mb-4">
          先看方法标签，理解"为什么这样换"，再试着把同一个方法用在表里没有的食物上。每次换掉一样，长期坚持效果明显。
        </p>

        <div className="flex flex-col gap-2.5">
          {SWAPS.map(item => (
            <div key={item.original} className="bg-card rounded-card px-4 py-3.5">
              <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                {item.methods.map(m => (
                  <span key={m} className={`text-[11px] font-bold px-2 py-0.5 rounded-pill ${METHOD_COLORS[m]}`}>{m}</span>
                ))}
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm text-text-sub line-through">{item.original}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M13 6L19 12L13 18" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className="text-[15px] font-semibold text-green leading-tight">{item.swap}</span>
              </div>
              <p className="text-sm text-text-sub leading-relaxed">{item.reason}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
