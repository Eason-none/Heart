'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { KM_SECTIONS, KNOWLEDGE_CARDS } from '@/lib/content/knowledge-map'

const SECTION_ICONS: Record<string, string> = {
  emergency: '🚨',
  exercise:  '🏃',
  meds:      '💊',
  heart:     '❤️',
  risk:      '📊',
  diet:      '🥦',
  psych:     '🧠',
  daily:     '🌱',
}

export default function LearnPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col h-full bg-bg">

      <div className="flex-shrink-0 px-4 pt-3 pb-2 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2 text-blue"
        >
          ←
        </button>
        <h1 className="text-lg font-bold text-text">康复知识库</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Emergency pinned notice */}
        <div className="mb-3 px-3 py-2 bg-orange-light border border-orange/30 rounded-card flex items-center gap-2">
          <span className="text-sm text-orange font-medium">建议优先了解：应急应对</span>
          <Link href="/learn/emergency" className="ml-auto text-sm text-orange font-semibold">
            立即查看 →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {KM_SECTIONS.map(section => {
            const count = KNOWLEDGE_CARDS.filter(c => c.section === section.id).length
            return (
              <Link
                key={section.id}
                href={`/learn/${section.id}`}
                className="bg-card rounded-card p-4 flex flex-col gap-2 active:opacity-70"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{SECTION_ICONS[section.id]}</span>
                  {section.urgent && (
                    <span className="text-xs px-1.5 py-0.5 bg-orange text-white rounded-pill">优先</span>
                  )}
                </div>
                <p className="text-base font-semibold text-text leading-tight">{section.label}</p>
                <p className="text-xs text-text-sub leading-snug">{section.description}</p>
                <p className="text-xs text-text-sub mt-auto">{count} 篇内容</p>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
