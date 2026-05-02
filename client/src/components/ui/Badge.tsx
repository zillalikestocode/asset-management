import { cn } from '@/lib/utils'
import type { AssetStatus, Priority, WorkOrderStatus, IssueSeverity } from '@/types'

// ── Status pill — Healthy / Due soon / Overdue / Scheduled / Archived ──
interface StatusPillProps {
  status: AssetStatus | WorkOrderStatus | 'healthy' | 'due_soon' | 'overdue' | 'scheduled'
  className?: string
}

const statusMap: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  active:       { label: 'Active',      dot: 'bg-af-ok-600',   bg: 'bg-af-ok-100',   text: 'text-[#3A6912]' },
  healthy:      { label: 'Healthy',     dot: 'bg-af-ok-600',   bg: 'bg-af-ok-100',   text: 'text-[#3A6912]' },
  due_soon:     { label: 'Due soon',    dot: 'bg-af-warn-600',  bg: 'bg-af-warn-100', text: 'text-[#7A3B06]' },
  overdue:      { label: 'Overdue',     dot: 'bg-af-crit-600',  bg: 'bg-af-crit-100', text: 'text-[#8B1C1F]' },
  scheduled:    { label: 'Scheduled',   dot: 'bg-af-blue-600',  bg: 'bg-af-blue-100', text: 'text-[#1A4BA5]' },
  in_progress:  { label: 'In progress', dot: 'bg-af-blue-600',  bg: 'bg-af-blue-100', text: 'text-[#1A4BA5]' },
  open:         { label: 'Open',        dot: 'bg-af-warn-600',  bg: 'bg-af-warn-100', text: 'text-[#7A3B06]' },
  completed:    { label: 'Completed',   dot: 'bg-af-ok-600',   bg: 'bg-af-ok-100',   text: 'text-[#3A6912]' },
  cancelled:    { label: 'Cancelled',   dot: 'bg-af-ink-400',   bg: 'bg-af-ink-100',  text: 'text-af-muted' },
  maintenance:  { label: 'Maintenance', dot: 'bg-af-blue-600',  bg: 'bg-af-blue-100', text: 'text-[#1A4BA5]' },
  inactive:     { label: 'Inactive',    dot: 'bg-af-ink-400',   bg: 'bg-af-ink-100',  text: 'text-af-muted' },
  retired:      { label: 'Retired',     dot: 'bg-af-ink-400',   bg: 'bg-af-ink-100',  text: 'text-af-muted' },
}

export function StatusPill({ status, className }: StatusPillProps) {
  const s = statusMap[status] ?? statusMap.inactive
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-pill text-[11px] font-medium',
      s.bg, s.text, className,
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full', s.dot)} />
      {s.label}
    </span>
  )
}

// ── Priority pill — CRITICAL / HIGH / MEDIUM / LOW ─────────
interface PriorityPillProps {
  priority: Priority
  className?: string
}

const priorityMap: Record<Priority, { bg: string; text: string }> = {
  critical: { bg: 'bg-af-crit-100',  text: 'text-[#8B1C1F]' },
  high:     { bg: 'bg-af-warn-100',  text: 'text-[#7A3B06]' },
  medium:   { bg: 'bg-af-blue-100',  text: 'text-[#1A4BA5]' },
  low:      { bg: 'bg-af-ink-100',   text: 'text-af-muted'  },
}

export function PriorityPill({ priority, className }: PriorityPillProps) {
  const p = priorityMap[priority]
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-pill font-mono text-[10px] font-medium tracking-[0.08em] uppercase',
      p.bg, p.text, className,
    )}>
      {priority}
    </span>
  )
}

// ── Severity pill ─────────────────────────────────────────
interface SeverityPillProps { severity: IssueSeverity; className?: string }
const severityMap: Record<IssueSeverity, { bg: string; text: string }> = {
  critical: { bg: 'bg-af-crit-100',  text: 'text-[#8B1C1F]' },
  medium:   { bg: 'bg-af-warn-100',  text: 'text-[#7A3B06]' },
  low:      { bg: 'bg-af-ink-100',   text: 'text-af-muted'  },
}
export function SeverityPill({ severity, className }: SeverityPillProps) {
  const s = severityMap[severity]
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-pill font-mono text-[10px] font-medium tracking-[0.08em] uppercase',
      s.bg, s.text, className,
    )}>
      {severity}
    </span>
  )
}

// ── ID tag — AF-0042, WO-2174 ─────────────────────────────
interface IdTagProps { children: React.ReactNode; accent?: boolean; className?: string }
export function IdTag({ children, accent, className }: IdTagProps) {
  return (
    <span className={cn(
      'inline-flex items-center font-mono text-[11px] px-1.5 py-0.5 rounded-sm border',
      accent
        ? 'text-af-orange-600 border-af-orange-100 bg-af-orange-050'
        : 'text-af-fg border-af-border bg-af-ink-100',
      className,
    )}>
      {children}
    </span>
  )
}
