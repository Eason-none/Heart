'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { RPE_LABELS } from '@/lib/exercise/intensity'
import { getExerciseTypeLabel } from '@/lib/exercise/prescription'
import type { RPELevel, ExerciseType } from '@/types'

type TimeRange = 'recent2w' | 'recent1m' | 'all'

interface DisplaySession {
  date: string
  type: string
  duration: number
  rpe: RPELevel | null
  isAerobic: boolean
}

const RPE_COLORS: Record<RPELevel, string> = { 1: '#1D9E75', 2: '#185FA5', 3: '#BA7517', 4: '#A32D2D' }

function RPETrendChart({ sessions }: { sessions: DisplaySession[] }) {
  const W = 335, H = 130, PADDING = { top: 12, right: 16, bottom: 24, left: 32 }
  const chartW = W - PADDING.left - PADDING.right
  const chartH = H - PADDING.top - PADDING.bottom
  const stepH = chartH / 4
  const data = (sessions.filter(s => s.isAerobic && s.rpe !== null) as Array<DisplaySession & { rpe: RPELevel }>).slice(-10).reverse()

  const getX = (i: number) => PADDING.left + (data.length <= 1 ? chartW / 2 : (i / (data.length - 1)) * chartW)
  const getY = (rpe: number) => PADDING.top + stepH * (4 - rpe) + stepH / 2

  const points = data.map((s, i) => ({ x: getX(i), y: getY(s.rpe), rpe: s.rpe, date: s.date }))
  const polyline = points.map(p => `${p.x},${p.y}`).join(' ')

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      <rect
        x={PADDING.left} y={PADDING.top + stepH * 1}
        width={chartW} height={stepH}
        fill="#E6F1FB" opacity="0.6"
      />
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
      {points.length > 1 && (
        <polyline points={polyline} fill="none" stroke="#185FA5" strokeWidth="1.5" strokeLinejoin="round" />
      )}
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
  const [allSessions, setAllSessions] = useState<DisplaySession[]>([])

  useEffect(() => {
    try {
      const raw: Array<{
        date: string
        exercise_type: ExerciseType
        duration: number
        rpe_actual: RPELevel | null
        is_aerobic_count: boolean
      }> = JSON.parse(localStorage.getItem('exercise_sessions') || '[]')

      const mapped: DisplaySession[] = raw.map(s => ({
        date: s.date.slice(0, 10),
        type: getExerciseTypeLabel(s.exercise_type),
        duration: s.duration,
        rpe: s.rpe_actual,
        isAerobic: s.is_aerobic_count,
      }))
      mapped.sort((a, b) => b.date.localeCompare(a.date))
      setAllSessions(mapped)
    } catch {}
  }, [])

  const now = Date.now()
  const filtered = allSessions.filter(s => {
    const t = new Date(s.date).getTime()
    if (tab === 'recent2w') return t >= now - 14 * 24 * 60 * 60 * 1000
    if (tab === 'recent1m') return t >= now - 30 * 24 * 60 * 60 * 1000
    return true
  })

  const done = filtered.filter(s => s.isAerobic).length
  const target = tab === 'recent2w' ? 6 : tab === 'recent1m' ? 12 : 18
  const avgDuration = filtered.length > 0
    ? Math.round(filtered.reduce((s, x) => s + x.duration, 0) / filtered.length)
    : 0

  const header = (
    <>
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
    </>
  )

  if (allSessions.length === 0) {
    return (
      <div className="flex flex-col h-full bg-bg">
        {header}
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-3">
          <div className="w-14 h-14 rounded-full bg-card flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="#888780" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-text">还没有运动记录</h2>
          <p className="text-sm text-text-sub leading-relaxed">完成第一次运动后，<br />你的数据会显示在这里。</p>
          <Link
            href="/exercise"
            className="mt-2 min-h-[44px] px-6 bg-blue text-white rounded-btn flex items-center text-base font-medium"
          >
            去运动
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-bg">
      {header}

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

        <div className="bg-card rounded-card p-4">
          <p className="text-sm font-semibold text-text mb-3">运动强度趋势</p>
          {filtered.filter(s => s.isAerobic).length > 0 ? (
            <RPETrendChart sessions={filtered} />
          ) : (
            <p className="text-sm text-text-sub text-center py-6">此时间段内无有氧运动记录</p>
          )}
        </div>

        <div className="bg-card rounded-card p-4">
          <p className="text-sm font-semibold text-text mb-3">运动记录</p>
          {filtered.length === 0 ? (
            <p className="text-sm text-text-sub text-center py-4">此时间段内暂无记录</p>
          ) : (
            <div className="border-l-2 border-border ml-2 space-y-0">
              {filtered.map((s, i) => (
                <div key={i} className="relative pl-5 pb-4 last:pb-0">
                  <div
                    className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full"
                    style={{ background: s.rpe ? RPE_COLORS[s.rpe] : '#C8C5BE' }}
                  />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-sub">{s.date.slice(5)}</p>
                      <p className="text-base font-medium text-text">{s.type} · {s.duration} 分钟</p>
                    </div>
                    <span className="text-sm font-medium" style={{ color: s.rpe ? RPE_COLORS[s.rpe] : '#C8C5BE' }}>
                      {s.rpe ? RPE_LABELS[s.rpe].label : '—'}
                    </span>
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
