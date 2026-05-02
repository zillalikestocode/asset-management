import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardText, Clock } from '@phosphor-icons/react'
import { useWorkOrders } from '@/hooks/useWorkOrders'
import { useAuth } from '@/contexts/AuthContext'
import { StatusPill, PriorityPill } from '@/components/ui/Badge'
import { PageSpinner } from '@/components/ui/Spinner'
import { formatDate, cn } from '@/lib/utils'

type Filter = 'open' | 'in_progress' | 'completed'

export function TechWorkOrdersPage() {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const [filter, setFilter] = useState<Filter>('open')

  const { data, isLoading } = useWorkOrders({
    assigneeId: user?.id,
    status: filter,
    perPage: 50,
  })

  const workOrders = data?.data ?? []

  if (isLoading) return <PageSpinner />

  return (
    <div className="p-5 space-y-4">
      <div>
        <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-af-muted">My work</p>
        <h1 className="text-[22px] font-semibold tracking-[-0.015em] mt-0.5">Tasks</h1>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['open', 'in_progress', 'completed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'flex-shrink-0 font-mono text-[10px] uppercase tracking-[0.08em] px-3 py-1.5 rounded-full border transition-colors duration-[120ms]',
              filter === f
                ? 'bg-af-ink-900 text-white border-af-ink-900'
                : 'bg-white text-af-muted border-af-border hover:bg-af-ink-050',
            )}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {workOrders.length === 0 ? (
        <div className="py-16 text-center">
          <ClipboardText size={32} className="mx-auto text-af-muted mb-3 opacity-40" />
          <p className="text-[15px] font-medium">No {filter.replace('_', ' ')} tasks</p>
          <p className="text-[13px] text-af-muted mt-1">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {workOrders.map(wo => {
            const isOverdue = wo.status !== 'completed' && new Date(wo.dueDate) < new Date()
            return (
              <div
                key={wo.id}
                onClick={() => navigate(`/tech/work-orders/${wo.id}/log`)}
                className={cn(
                  'p-4 rounded-xl border bg-white cursor-pointer hover:bg-af-ink-050 transition-colors duration-[120ms]',
                  isOverdue ? 'border-af-crit-200' : 'border-af-border',
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <PriorityPill priority={wo.priority} />
                    <StatusPill status={wo.status} />
                  </div>
                </div>
                <p className="text-[16px] font-semibold leading-snug mb-1">{wo.title}</p>
                <p className="text-[12px] text-af-muted mb-2">{wo.asset?.name ?? '—'}</p>
                <div className={cn('flex items-center gap-1 font-mono text-[11px]', isOverdue ? 'text-af-crit-600' : 'text-af-muted')}>
                  <Clock size={11} />
                  {isOverdue ? 'Overdue · ' : ''}{formatDate(wo.dueDate)}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
