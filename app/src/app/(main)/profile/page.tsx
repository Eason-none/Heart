'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getRiskDisplayLabel } from '@/lib/exercise/risk'

interface MilestoneCardProps {
  count: number
  label: string
  unlocked: boolean
  special?: boolean
}

function MilestoneCard({ count, label, unlocked, special }: MilestoneCardProps) {
  const color = special ? '#185FA5' : '#BA7517'
  return (
    <div className={`flex-1 bg-card rounded-card p-3 flex flex-col items-center gap-2 ${unlocked ? '' : 'opacity-50'}`}>
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center"
        style={{ border: `2px ${unlocked ? 'solid' : 'dashed'} ${color}` }}
      >
        <div className="text-center">
          <div className="text-xl font-bold leading-none" style={{ color }}>{count}</div>
          <div className="text-[10px] leading-none" style={{ color }}>{count === 90 ? '天' : '次'}</div>
        </div>
      </div>
      <p className="text-xs text-text-sub text-center leading-tight">{label}</p>
      {unlocked && (
        <span className="text-[10px] text-text-sub">坚持的力量</span>
      )}
    </div>
  )
}

export default function ProfilePage() {
  const [riskLevel, setRiskLevel] = useState<string>('low')
  const [totalSessions] = useState(3)

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem('assessment_answers') || '{}')
      setRiskLevel(data.risk_level || 'low')
    } catch {}
  }, [])

  const milestones = [
    { count: 12, label: '适应期·里程碑', unlocked: totalSessions >= 12 },
    { count: 18, label: '改善期·里程碑', unlocked: totalSessions >= 18 },
    { count: 90, label: '维持期·结业', unlocked: false, special: true },
  ]

  const FOLLOWUP_RECORDS = [
    { date: '2026-05-26', type: '每周随访', summary: '运动 3 次，睡眠一般' },
    { date: '2026-05-19', type: '每周随访', summary: '运动 2 次，状态良好' },
  ]

  return (
    <div className="flex flex-col h-full bg-bg">
      <div className="flex-shrink-0 h-11 flex items-center justify-between px-5">
        <span className="text-[15px] font-semibold text-text">9:41</span>
      </div>
      <div className="flex-shrink-0 h-12 flex items-center px-4 border-b border-border">
        <h1 className="text-lg font-semibold text-text">我</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4 space-y-4">
        {/* User info */}
        <div className="bg-card rounded-card p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-light flex items-center justify-center flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="3.5" stroke="#185FA5" strokeWidth="1.8" />
              <path d="M4 20C4 17 7.58172 15 12 15C16.4183 15 20 17 20 20" stroke="#185FA5" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-base font-semibold text-text">康复用户</p>
            <span className={`text-xs px-2 py-0.5 rounded-pill font-medium ${
              riskLevel === 'high' ? 'bg-orange-light text-orange' : 'bg-green-light text-green-dark'
            }`}>
              {getRiskDisplayLabel(riskLevel as 'low' | 'medium' | 'high')}
            </span>
          </div>
          <Link
            href="/profile/update-assessment"
            className="min-h-[44px] flex items-center text-sm text-blue"
          >
            更新评估
          </Link>
        </div>

        {/* Rehab progress */}
        <div className="bg-card rounded-card p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-base font-semibold text-text">康复进度</h3>
            <span className="text-sm text-text-sub">适应期</span>
          </div>
          <p className="text-2xl font-bold text-blue mb-4">累计运动 {totalSessions} 次</p>
          <div className="flex gap-2">
            {milestones.map(m => (
              <MilestoneCard key={m.count} {...m} />
            ))}
          </div>
        </div>

        {/* Followup history */}
        <div className="bg-card rounded-card p-4">
          <h3 className="text-base font-semibold text-text mb-3">随访记录</h3>
          {FOLLOWUP_RECORDS.length === 0 ? (
            <p className="text-sm text-text-sub text-center py-3">暂无随访记录</p>
          ) : (
            <div className="border-l-2 border-border ml-2 space-y-0">
              {FOLLOWUP_RECORDS.map((r, i) => (
                <div key={i} className="relative pl-5 pb-4 last:pb-0">
                  <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue" />
                  <p className="text-sm text-text-sub">{r.date}</p>
                  <p className="text-base font-medium text-text">{r.type}</p>
                  <p className="text-sm text-text-sub">{r.summary}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="bg-card rounded-card divide-y divide-border">
          {[
            { label: '重看功能引导', href: '/onboarding/guide' },
            { label: '内容偏好', href: '#' },
            { label: '关于 Heart', href: '#' },
            { label: '隐私说明', href: '#' },
          ].map(item => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center justify-between min-h-[52px] px-4"
            >
              <span className="text-base text-text">{item.label}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="#888780" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
