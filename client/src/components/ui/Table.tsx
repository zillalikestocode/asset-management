import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

// ── Root ──────────────────────────────────────────────────
export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table className="w-full border-collapse text-[13px]">{children}</table>
    </div>
  )
}

// ── Head ──────────────────────────────────────────────────
export function Thead({ children }: { children: ReactNode }) {
  return <thead className="border-b border-af-border">{children}</thead>
}

// ── Header cell ───────────────────────────────────────────
interface ThProps {
  children?: ReactNode
  className?: string
  sortable?: boolean
  sorted?: 'asc' | 'desc' | false
  onClick?: () => void
}

export function Th({ children, className, sortable, sorted, onClick }: ThProps) {
  return (
    <th
      className={cn(
        'px-3 py-2 text-left font-mono text-[10px] tracking-[0.1em] uppercase text-af-muted font-medium whitespace-nowrap select-none',
        sortable && 'cursor-pointer hover:text-af-fg transition-colors duration-[120ms]',
        className,
      )}
      onClick={sortable ? onClick : undefined}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {sortable && (
          <span className="text-[10px] opacity-50">
            {sorted === 'asc' ? '↑' : sorted === 'desc' ? '↓' : '↕'}
          </span>
        )}
      </span>
    </th>
  )
}

// ── Body ──────────────────────────────────────────────────
export function Tbody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-af-border">{children}</tbody>
}

// ── Row ───────────────────────────────────────────────────
interface TrProps {
  children: ReactNode
  onClick?: () => void
  className?: string
}

export function Tr({ children, onClick, className }: TrProps) {
  return (
    <tr
      className={cn(
        'bg-white transition-colors duration-[120ms]',
        onClick && 'cursor-pointer hover:bg-af-ink-050',
        className,
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

// ── Cell ──────────────────────────────────────────────────
interface TdProps {
  children?: ReactNode
  className?: string
  muted?: boolean
  mono?: boolean
}

export function Td({ children, className, muted, mono }: TdProps) {
  return (
    <td className={cn(
      'px-3 py-2.5 whitespace-nowrap',
      muted && 'text-af-muted',
      mono  && 'font-mono text-[12px]',
      className,
    )}>
      {children}
    </td>
  )
}

// ── Empty row ─────────────────────────────────────────────
export function TdEmpty({ cols, message = 'No results' }: { cols: number; message?: string }) {
  return (
    <tr>
      <td colSpan={cols} className="py-12 text-center text-[13px] text-af-muted">
        {message}
      </td>
    </tr>
  )
}
