import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  label: string
  value: string | number
  icon?: ReactNode
  delta?: { value: string; direction: 'up' | 'down' | 'neutral' }
  variant?: 'default' | 'crit' | 'warn' | 'ok'
  sub?: string
  className?: string
}

const valueVariant = {
  default: 'text-af-fg',
  crit:    'text-af-crit-600',
  warn:    'text-af-warn-600',
  ok:      'text-af-ok-600',
}

const deltaVariant = {
  up:      'text-af-ok-600',
  down:    'text-af-crit-600',
  neutral: 'text-af-muted',
}

export function KpiCard({ label, value, icon, delta, variant = 'default', sub, className }: KpiCardProps) {
  return (
    <div className={cn(
      'bg-white border border-af-border rounded-lg p-4 relative overflow-hidden',
      className,
    )}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-af-muted">{label}</span>
        {icon && <span className="text-af-subtle">{icon}</span>}
      </div>

      <p className={cn(
        'text-[30px] font-semibold tracking-[-0.02em] leading-none tabular-nums',
        valueVariant[variant],
      )}>
        {value}
      </p>

      <div className="flex items-center justify-between mt-2">
        {sub && <span className="text-[12px] text-af-muted">{sub}</span>}
        {delta && (
          <span className={cn('font-mono text-[11px]', deltaVariant[delta.direction])}>
            {delta.direction === 'up' ? '↑' : delta.direction === 'down' ? '↓' : ''} {delta.value}
          </span>
        )}
      </div>
    </div>
  )
}
