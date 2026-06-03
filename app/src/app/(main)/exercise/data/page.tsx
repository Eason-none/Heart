'use client'
import { useState } from 'react'
import Link from 'next/link'
import { RPE_LABELS } from '@/lib/exercise/intensity'
import type { RPELevel } from '@/types'

type TimeRange = 'recent2w' | 'recent1m' | 'all'

// Mock data
const MOCK_SESSIONS = [
  { date: '2026-05-28', type: '步行', duration: 28, rpe: 2 as RPELevel, adjusted: false },
  { date: '2026-05-26', type: '步行', duration: 25, rpe: 2 as RPELevel, adjusted: false },
  { date: '2026-05-24', type: '步行', duration: 25, rpe: 3 as RPELevel, adjusted: false },
  { date: '2026-05-21', type: '抗阻', duration: 30, rpe: 2 as RPELevel, adjusted: false },
  { date: '2026-05-19', type: '步行', duration: 25, rpe: 2 as RPELevel, adjusted: false },
  { date: '2026-05-17', type: '步行', duration: 20, rpe: 1 as RPELevel, adjusted: true },
]

const RPE_COLORS: Record<RPELevel, string> = { 1: '#1D9E75', 2: '#185FA5', 3: '#BA7517', 4: '#A32D2D' }

function RPETrendChart({ sessions }: { sessions: typeof MOCK_SESSIONS }) {
  const W = 335, H = 130, PADDING = { top: 12, right: 16, bottom: 24, left: 32 }
  const chartW = W - PADDING.left - PADDING.right
  const chartH = H - PADDING.top - PADDING.bottom
  const stepH = chartH / 4
  const data = sessions.filter(s => ['步行','居家有氧','慢跑','骑行'].includes(s.type)).slice(-10).reverse()

  const getX = (i: number) => PADDING.left + (data.length <= 1 ? chartW / 2 : (i / (data.length - 1)) * chartW)
  const getY = (rpe: number) => PADDING.top + stepH * (4 - rpe) + stepH / 2

  const points = data.map((s, i) => ({ x: getX(i), y: getY(s.rpe), rpe: s.rpe, date: s.date }))
  const polyline = points.map(p => `${p.x},${p.y}`).join(' ')

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      {/* Target band (RPE 2 = 适中) */}
      <rect
        x={PADDING.left} y={PADDING.top + stepH * 1}
        width={chartW} height={stepH}
        fill="#E6F1FB" opacity="0.6"
      />
      {/* Grid lines */}
      {[1,2,3,4].map((level, i) => (
        <g key={level}>
          <line
            x1={PADDING.left} x2={W - PADDING.right}
            y1={PADDING.top + stepH * i + stepH / 2}
            y2={PADDING.top + stepH * i + stepH / 2}
            stroke="#C8C5BE" strokeWidth="1" strokeDasharray="4 4"
          />
          <text x={PADDING.left - 6} y={PADDING.top + stepH * i + stepH / 2 + 4}
            textAnchor="end" fontSize="10" fill="#888780">
            {RPE_LABELS[(4 - i) as RPELevel].label}
          </text>
        </g>
      ))}
      {/* Line */}
      {points.length > 1 && (
        <polyline points={polyline} fill="none" stroke="#185FA5" strokeWidth="1.5" strokeLinejoin="round" />
      )}
      {/* Dots */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="6" fill={RPE_COLORS[p.rpe as RPELevel]} />
      ))}
    </svg>
  )
}

function ProgressRing({ done, target }: { done: number; target: number }) {
  const r = 48, strokeW = 12
  const circ = 2 * Math.PI * r
  const pct = Math.min(1, done / Math.max(1, target))
  const dash = pct * circ

  return (
    <svg width="130" height="130" viewBox="0 0 130 130">
      <circle cx="65" cy="65" r={r} fill="none" stroke="#B4B2A9" strokeWidth={strokeW} />
      <circle
        cx="65" cy="65" r={r} fill="none"
        stroke="#1D9E75" strokeWidth={strokeW}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        transform="rotate(-90 65 65)"
      />
      <text x="65" y="60" textAnchor="middle" fontSize="24" fontWeight="700" fill="#2C2A26">{done}</text>
      <text x="65" y="76" textAnchor="middle" fontSize="13" fill="#888780">/ 目标 {target} 次</text>
    </svg>
  )
}

export default function ExerciseDataPage() {
  const [tab, setTab] = useState<TimeRange>('recent2w')

  const filtered = tab === 'recent2w' ? MOCK_SESSIONS.slice(0, 4)
    : tab === 'recent1m' ? MOCK_SESSIONS
    : MOCK_SESSIONS

  const done = filtered.filter(s => ['步行','居家有氧','慢跑'].includes(s.type)).length
  const target = tab === 'recent2w' ? 6 : tab === 'recent1m' ? 12 : 18
  const avgDuration = Math.round(filtered.reduce((s, x) => s + x.duration, 0) / Math.max(1, filtered.length))

  return (
    <div className="flex flex-col h-full bg-bg">
      <div className="flex-shrink-0 h-11 flex items-center justify-between px-5">
        <span className="text-[15px] font-semibold text-text">9:41</span>
      </div>
      <div className="flex-shrink-0 h-12 flex items-center px-4 border-b border-border gap-3">
        <Link href="/exercise" className="flex items-center min-h-[44px] min-w-[44px] -ml-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 19L8 12L15 5" stroke="#2C2A26" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <h1 className="text-lg font-semibold text-text">运动数据</h1>
      </div>

      {/* Tab bar */}
      <div className="flex-shrink-0 flex border-b border-border">
        {([['recent2w','近 2 周'],['recent1m','近 1 个月'],['all','全程']] as const).map(([v, label]) => (
          <button
            key={v}
            type="button"
            onClick={() => setTab(v)}
            className={`flex-1 min-h-[44px] text-sm font-medium transition-colors border-b-2 ${
              tab === v ? 'text-blue border-blue' : 'text-text-sub border-transparent'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6 space-y-4">
        {/* Overview */}
        <div className="bg-card rounded-card p-4 flex items-center gap-4">
          <ProgressRing done={done} target={target} />
          <div className="flex flex-col gap-3 flex-1">
            <div>
              <p className="text-xs text-text-sub">平均时长</p>
              <p className="text-base font-semibold text-text">{avgDuration} 分钟</p>
            </div>
            <div>
              <p className="text-xs text-text-sub">完成次数</p>
              <p className="text-base font-semibold text-text">{done} 次</p>
            </div>
          </div>
        </div>

        {/* RPE chart */}
        <div className="bg-card rounded-card p-4">
          <p className="text-sm font-semibold text-text mb-3">运动强度趋势</p>
          {filtered.length > 0 ? (
            <RPETrendChart sessions={filtered} />
          ) : (
            <p className="text-sm text-text-sub text-center py-6">完成第一次运动后，数据将显示在这里</p>
          )}
        </div>

        {/* Timeline */}
        <div className="bg-card rounded-card p-4">
          <p className="text-sm font-semibold text-text mb-3">运动记录</p>
          {filtered.length === 0 ? (
            <p className="text-sm text-text-sub text-center py-4">暂无记录</p>
          ) : (
            <div className="border-l-2 border-border ml-2 space-y-0">
              {filtered.map((s, i) => (
                <div key={i} className="relative pl-5 pb-4 last:pb-0">
                  <div
                    className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full"
                    style={{ background: RPE_COLORS[s.rpe] }}
                  />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-sub">{s.date.slice(5)}</p>
                      <p className="text-base font-medium text-text">{s.type} · {s.duration} 分钟</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-medium`} style={{ color: RPE_COLORS[s.rpe] }}>
                        {RPE_LABELS[s.rpe].label}
                      </span>
                      {s.adjusted && (
                        <p className="text-xs text-orange">强度已调整</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
