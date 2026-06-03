import Link from 'next/link'

const SWAPS = [
  { original: '猪油 / 动物油', swap: '茶油 / 橄榄油', reason: '减少饱和脂肪，增加单不饱和脂肪酸' },
  { original: '精白米饭（一碗）', swap: '白米 + 糙米 / 杂豆（1:1）', reason: '降低升糖指数，增加膳食纤维' },
  { original: '猪肉馅', swap: '鸡肉馅 / 豆腐', reason: '降低饱和脂肪含量' },
  { original: '酱油（大量）', swap: '少量酱油 + 醋 + 葱姜', reason: '减钠，同时保留风味' },
  { original: '腌制咸鱼', swap: '新鲜三文鱼 / 鲭鱼', reason: '高钠换成富含 Omega-3 的鲜鱼' },
  { original: '全脂牛奶', swap: '低脂牛奶 / 豆奶', reason: '减少饱和脂肪' },
  { original: '油条 / 炸糕（早餐）', swap: '燕麦粥 / 全麦馒头', reason: '减少反式脂肪和精制糖' },
  { original: '薯片 / 零食', swap: '原味坚果（一小把）/ 水果', reason: '用健康脂肪替代空热量' },
  { original: '甜饮料', swap: '白开水 / 淡绿茶', reason: '减少精制糖，控制热量' },
  { original: '红烧肉（肥肉部分）', swap: '去皮鸡腿肉 / 瘦牛肉', reason: '减少饱和脂肪，保留蛋白质' },
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
        <h1 className="text-lg font-semibold text-text">中式替代食材</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6">
        <p className="text-sm text-text-sub mb-4 leading-relaxed">
          不用颠覆饮食习惯，从一点一点的替代开始。每一个小改变都有意义。
        </p>
        <div className="bg-card rounded-card divide-y divide-border">
          {SWAPS.map(item => (
            <div key={item.original} className="px-4 py-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-text line-through opacity-60">{item.original}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M13 6L19 12L13 18" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className="text-base font-semibold text-green">{item.swap}</span>
              </div>
              <p className="text-sm text-text-sub leading-relaxed">{item.reason}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
