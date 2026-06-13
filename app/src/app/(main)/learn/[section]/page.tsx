'use client'
import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { KM_SECTIONS, KNOWLEDGE_CARDS } from '@/lib/content/knowledge-map'
import type { KnowledgeCard, KMSectionId } from '@/types'

function CardItem({ card }: { card: KnowledgeCard }) {
  const [expanded, setExpanded] = useState(false)
  const router = useRouter()

  const handleAskAssistant = () => {
    try {
      localStorage.setItem('assistant_card_context', JSON.stringify({
        id: card.id,
        title: card.title,
        body: card.body,
      }))
    } catch {}
    router.push('/assistant')
  }

  return (
    <div className="bg-card rounded-card p-4">
      <h2 className="text-base font-semibold text-text leading-tight mb-2">{card.title}</h2>
      <div
        className="text-sm text-text leading-relaxed"
        style={
          expanded
            ? {}
            : ({ display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties)
        }
      >
        {card.body}
      </div>
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
        <button
          type="button"
          onClick={() => setExpanded(e => !e)}
          className="min-h-[40px] text-sm text-blue"
        >
          {expanded ? '收起 ↑' : '展开 ↓'}
        </button>
        <button
          type="button"
          onClick={handleAskAssistant}
          className="min-h-[40px] text-sm text-text-sub"
        >
          有疑问？问助手 →
        </button>
      </div>
    </div>
  )
}

export default function SectionPage() {
  const router = useRouter()
  const params = useParams()
  const sectionId = params.section as KMSectionId

  const section = KM_SECTIONS.find(s => s.id === sectionId)
  const cards = KNOWLEDGE_CARDS.filter(c => c.section === sectionId)

  if (!section) {
    return (
      <div className="flex flex-col h-full bg-bg items-center justify-center px-4">
        <p className="text-text-sub">找不到该分类</p>
        <button type="button" onClick={() => router.back()} className="mt-4 text-blue min-h-[44px]">返回</button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-bg">
      <div className="flex-shrink-0 h-11 flex items-center justify-between px-5">
        <span className="text-[15px] font-semibold text-text">9:41</span>
        <div className="flex gap-1.5 text-xs text-text"><span>●●● WiFi 🔋</span></div>
      </div>

      <div className="flex-shrink-0 px-4 pt-3 pb-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2 text-blue"
        >
          ←
        </button>
        <div>
          <h1 className="text-lg font-bold text-text leading-tight">{section.label}</h1>
          <p className="text-xs text-text-sub">{section.description}</p>
        </div>
        {section.urgent && (
          <span className="ml-auto text-xs px-2 py-0.5 bg-orange text-white rounded-pill flex-shrink-0">
            建议优先了解
          </span>
        )}
      </div>

      {section.urgent && (
        <div className="flex-shrink-0 mx-4 mb-3 px-3 py-2 bg-orange-light border border-orange/30 rounded-card">
          <p className="text-xs text-orange leading-relaxed">
            这部分内容与您的安全直接相关，建议在开始康复训练前完整阅读。
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        {cards.length === 0 ? (
          <p className="text-sm text-text-sub text-center pt-8">该分类暂无内容，敬请期待</p>
        ) : (
          cards.map(card => <CardItem key={card.id} card={card} />)
        )}
      </div>
    </div>
  )
}
