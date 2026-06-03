import Link from 'next/link'

const SECTIONS = [
  {
    title: '蛋白质',
    items: [
      { name: '深海鱼', tip: '首选三文鱼、沙丁鱼、鲭鱼；每周至少 2 次', good: true },
      { name: '去皮鸡胸肉 / 鸡腿肉', tip: '去皮后脂肪含量低，优质蛋白', good: true },
      { name: '豆腐 / 豆制品', tip: '植物蛋白，含大豆异黄酮，对心血管友好', good: true },
      { name: '鸡蛋', tip: '每天 1 个全蛋是安全的，无需避免', good: true },
      { name: '加工肉制品（香肠、腊肉）', tip: '高钠高饱和脂肪，尽量避免', good: false },
    ],
  },
  {
    title: '碳水化合物',
    items: [
      { name: '燕麦、糙米、杂豆', tip: '全谷物，升糖慢，富含膳食纤维', good: true },
      { name: '红薯 / 山药', tip: '替代部分精白米饭，营养更丰富', good: true },
      { name: '精白米、白面条', tip: '适量食用，配合杂粮更健康', good: null },
      { name: '蛋糕、饼干、甜面包', tip: '反式脂肪和精制糖含量高，减少摄入', good: false },
    ],
  },
  {
    title: '油脂',
    items: [
      { name: '茶油 / 橄榄油', tip: '单不饱和脂肪酸丰富，心脏友好', good: true },
      { name: '亚麻籽油', tip: '植物性 Omega-3 来源', good: true },
      { name: '花生油 / 大豆油', tip: '适量使用，避免高温反复加热', good: null },
      { name: '棕榈油 / 猪油 / 黄油', tip: '饱和脂肪高，建议减少', good: false },
    ],
  },
  {
    title: '蔬菜与水果',
    items: [
      { name: '深色叶菜（菠菜、西兰花）', tip: '每天 300–500g，种类越多越好', good: true },
      { name: '番茄、洋葱、大蒜', tip: '含天然抗氧化物质，对心血管有益', good: true },
      { name: '低糖水果（蓝莓、苹果、橙子）', tip: '每天 200–350g，控制总量', good: true },
      { name: '腌制蔬菜（咸菜、泡菜）', tip: '高钠，少吃或不吃', good: false },
    ],
  },
]

const StatusDot = ({ good }: { good: boolean | null }) => {
  if (good === true) return <span className="w-2 h-2 rounded-full bg-green flex-shrink-0 mt-2" />
  if (good === false) return <span className="w-2 h-2 rounded-full bg-red flex-shrink-0 mt-2" />
  return <span className="w-2 h-2 rounded-full bg-border flex-shrink-0 mt-2" />
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
        <h1 className="text-lg font-semibold text-text">食物选购指南</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6 space-y-5">
        <div className="flex items-center gap-4 text-sm text-text-sub">
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green inline-block" />优先选择</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-border inline-block" />适量</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red inline-block" />减少 / 避免</div>
        </div>

        {SECTIONS.map(section => (
          <div key={section.title}>
            <h2 className="text-base font-semibold text-text mb-2">{section.title}</h2>
            <div className="bg-card rounded-card divide-y divide-border">
              {section.items.map(item => (
                <div key={item.name} className="flex items-start gap-3 px-4 py-3">
                  <StatusDot good={item.good} />
                  <div>
                    <p className="text-base font-medium text-text">{item.name}</p>
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
