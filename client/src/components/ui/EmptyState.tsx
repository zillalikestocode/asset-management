import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn(
      'af-grid-bg flex flex-col items-center justify-center text-center py-16 px-6 rounded-lg border border-dashed border-af-border',
      className,
    )}>
      {icon && (
        <div className="w-12 h-12 rounded-lg bg-af-ink-100 flex items-center justify-center text-af-muted mb-4">
          {icon}
        </div>
      )}
      <p className="text-[13px] font-medium text-af-fg mb-1">{title}</p>
      {description && <p className="text-[12px] text-af-muted max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
