import Link from 'next/link'

const NUTRITION_CARDS = [
  {
    title: '本周饮食重点：减钠',
    body: '心脏病患者每日钠摄入建议控制在 2000 mg 以内（约 5 g 盐）。实用做法：炒菜出锅前再放盐、用醋和葱姜替代部分酱油、避免腌制食品和加工食品。',
    tag: '营养饮食',
  },
  {
    title: '优质脂肪，你吃对了吗？',
    body: '不是所有脂肪都是心脏的敌人。深海鱼（鲑鱼、沙丁鱼）中的 Omega-3、茶油/橄榄油中的单不饱和脂肪酸，都对心血管有保护作用。需要限制的是反式脂肪（油炸食品、人造黄油）和饱和脂肪（肥肉、奶油）。',
    tag: '营养饮食',
  },
]

export default function NutritionPage() {
  return (
    <div className="flex flex-col h-full bg-bg">
      <div className="flex-shrink-0 h-11 flex items-center justify-between px-5">
        <span className="text-[15px] font-semibold text-text">9:41</span>
      </div>
      <div className="flex-shrink-0 h-12 flex items-center px-4 border-b border-border">
        <h1 className="text-lg font-semibold text-text">营养</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4 space-y-3">
        {/* Science cards */}
        {NUTRITION_CARDS.map((card, i) => (
          <div key={i} className="bg-card rounded-card p-4">
            <span className="inline-block px-2.5 py-0.5 rounded-pill bg-green text-white text-xs font-medium mb-2">
              {card.tag}
            </span>
            <h2 className="text-lg font-bold text-text mb-2 leading-tight">{card.title}</h2>
            <p className="text-base text-text leading-relaxed">{card.body}</p>
          </div>
        ))}

        {/* Entry cards */}
        <Link
          href="/nutrition/shopping"
          className="flex items-center min-h-[56px] bg-card rounded-card px-4 border border-border"
        >
          <div className="flex-1">
            <p className="text-base font-semibold text-text">食物选购指南</p>
            <p className="text-sm text-text-sub">超市购物场景参考</p>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M9 18L15 12L9 6" stroke="#888780" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </Link>

        <Link
          href="/nutrition/swap"
          className="flex items-center min-h-[56px] bg-card rounded-card px-4 border border-border"
        >
          <div className="flex-1">
            <p className="text-base font-semibold text-text">中式替代食材对照表</p>
            <p className="text-sm text-text-sub">烹饪场景，找到更健康的替代</p>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M9 18L15 12L9 6" stroke="#888780" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
