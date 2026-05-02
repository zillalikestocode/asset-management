import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize    = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

const variants: Record<ButtonVariant, string> = {
  primary:   'bg-af-ink-900 text-white hover:bg-af-ink-800 border-transparent',
  accent:    'bg-af-orange-500 text-white hover:bg-af-orange-600 border-transparent',
  secondary: 'bg-white text-af-fg border-af-border hover:bg-af-ink-050 shadow-1',
  ghost:     'bg-transparent text-af-fg border-transparent hover:bg-af-ink-100',
  danger:    'bg-af-crit-600 text-white hover:opacity-90 border-transparent',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-[26px] px-2.5 text-[12px] gap-1.5',
  md: 'h-8 px-3.5 text-[13px] gap-1.5',
  lg: 'h-[38px] px-[18px] text-[14px] gap-2',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', loading, disabled, className, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium rounded border',
        'transition-colors duration-[120ms]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus-visible:outline-none focus-visible:shadow-focus',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading ? <span className="opacity-60">Loading…</span> : children}
    </button>
  ),
)
Button.displayName = 'Button'
