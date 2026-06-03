import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'warning' | 'info' | 'success'
}

export function Card({ variant = 'default', className = '', children, ...props }: CardProps) {
  const variants: Record<string, string> = {
    default: 'bg-card',
    warning: 'bg-orange-light border-l-4 border-orange',
    info: 'bg-blue-light border-l-4 border-blue',
    success: 'bg-green-light border-l-4 border-green',
  }
  return (
    <div
      className={`rounded-card p-4 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function Pill({ children, color = 'blue', className = '' }: {
  children: React.ReactNode
  color?: 'blue' | 'orange' | 'red' | 'green' | 'gray'
  className?: string
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue text-white',
    orange: 'bg-orange text-white',
    red: 'bg-red text-white',
    green: 'bg-green text-white',
    gray: 'bg-border text-text-sub',
  }
  return (
    <span className={`inline-block px-3 py-0.5 rounded-pill text-xs font-medium ${colors[color]} ${className}`}>
      {children}
    </span>
  )
}
