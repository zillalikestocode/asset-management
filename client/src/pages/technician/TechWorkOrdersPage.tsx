import { useNavigate } from 'react-router-dom'
import { ClipboardText, Clock, CheckCircle } from '@phosphor-icons/react'
import { useWorkOrders } from '@/hooks/useWorkOrders'
import { useAuth } from '@/contexts/AuthContext'
import { StatusPill, PriorityPill } from '@/components/ui/Badge'
import { PageSpinner } from '@/components/ui/Spinner'
import { formatDate, cn } from '@/lib/utils'
import { useState } from 'react'

type Filter = 'open' | 'in_progress' | 'completed'

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'open',        label: 'Open' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed',   label: 'History' },
]

export function TechWorkOrdersPage() {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const [filter, setFilter] = useState<Filter>('open')

  const { data: openData }       = useWorkOrders({ assignedToId: user?.id, status: 'open',        perPage: 999 })
  const { data: inProgressData } = useWorkOrders({ assignedToId: user?.id, status: 'in_progress', perPage: 999 })
  const { data, isLoading }      = useWorkOrders({ assignedToId: user?.id, status: filter,        perPage: 50  })

  const workOrders   = data?.data ?? []
  const openCount    = openData?.total ?? 0
  const activeCount  = inProgressData?.total ?? 0

  const counts: Record<Filter, number> = {
    open:        openCount,
    in_progress: activeCount,
    completed:   0, // don't badge history
  }

  if (isLoading) return <PageSpinner />

  return (
    <div className="p-5 space-y-4">
      <div>
        <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-af-muted">My work</p>
        <h1 className="text-[22px] font-semibold tracking-[-0.015em] mt-0.5">Tasks</h1>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'flex-shrink-0 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.08em] px-3 py-1.5 rounded-full border transition-colors duration-[120ms]',
              filter === f.value
                ? 'bg-af-ink-900 text-white border-af-ink-900'
                : 'bg-white text-af-muted border-af-border hover:bg-af-ink-050',
            )}
          >
            {f.label}
            {counts[f.value] > 0 && (
              <span className={cn(
                'text-[9px] font-bold rounded-full px-1.5 py-px',
                filter === f.value ? 'bg-white/20 text-white' : 'bg-af-orange-100 text-af-orange-600',
              )}>
                {counts[f.value]}
              </span>
            )}
          </button>
        ))}
      </div>

      {workOrders.length === 0 ? (
        <div className="py-16 text-center">
          {filter === 'completed'
            ? <CheckCircle size={32} className="mx-auto text-af-ok-500 mb-3 opacity-60" />
            : <ClipboardText size={32} className="mx-auto text-af-muted mb-3 opacity-40" />
          }
          <p className="text-[15px] font-medium">
            {filter === 'completed' ? 'No completed tasks yet' : `No ${filter.replace('_', ' ')} tasks`}
          </p>
          <p className="text-[13px] text-af-muted mt-1">
            {filter === 'completed' ? 'Completed work orders will appear here' : "You're all caught up!"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {workOrders.map(wo => {
            const isOverdue = wo.status !== 'completed' && !!wo.dueDate && new Date(wo.dueDate) < new Date()
            const isDone    = wo.status === 'completed'
            return (
              <div
                key={wo.id}
                onClick={() => navigate(`/tech/work-orders/${wo.id}/log`)}
                className={cn(
                  'p-4 rounded-xl border bg-white cursor-pointer hover:bg-af-ink-050 transition-colors duration-[120ms]',
                  isOverdue ? 'border-af-crit-200' : isDone ? 'border-af-ok-100' : 'border-af-border',
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <PriorityPill priority={wo.priority} />
                    <StatusPill status={wo.status} />
                  </div>
                  {isDone && wo.actualHours && (
                    <span className="font-mono text-[10px] text-af-ok-600">{wo.actualHours}h logged</span>
                  )}
                </div>
                <p className="text-[16px] font-semibold leading-snug mb-1">{wo.title}</p>
                <p className="text-[12px] text-af-muted mb-2">{wo.asset?.name ?? '—'}</p>
                <div className={cn('flex items-center gap-1 font-mono text-[11px]', isOverdue ? 'text-af-crit-600' : 'text-af-muted')}>
                  <Clock size={11} />
                  {isDone && wo.completedAt
                    ? `Completed ${formatDate(wo.completedAt)}`
                    : `${isOverdue ? 'Overdue · ' : ''}${wo.dueDate ? formatDate(wo.dueDate) : '—'}`
                  }
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
