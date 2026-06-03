'use client'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'lg' | 'md' | 'sm'
  fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'lg', fullWidth = true, className = '', children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-medium rounded-btn transition-all active:scale-[0.98] select-none'

    const variants: Record<string, string> = {
      primary: 'bg-blue text-white',
      secondary: 'bg-card text-text border border-border',
      ghost: 'text-text-sub',
      danger: 'bg-red-light text-red border border-red',
    }

    const sizes: Record<string, string> = {
      lg: 'min-h-[56px] px-6 text-base',
      md: 'min-h-[44px] px-5 text-base',
      sm: 'min-h-[36px] px-4 text-sm',
    }

    const disabledStyle = disabled ? 'opacity-40 cursor-not-allowed active:scale-100' : 'cursor-pointer'
    const widthStyle = fullWidth ? 'w-full' : ''

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`${base} ${variants[variant]} ${sizes[size]} ${disabledStyle} ${widthStyle} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export default Button
