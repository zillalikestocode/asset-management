import { useNavigate } from 'react-router-dom'
import { ClipboardText, QrCode, Warning, Clock } from '@phosphor-icons/react'
import { useWorkOrders } from '@/hooks/useWorkOrders'
import { useAuth } from '@/contexts/AuthContext'
import { StatusPill, PriorityPill } from '@/components/ui/Badge'
import { PageSpinner } from '@/components/ui/Spinner'
import { formatDate } from '@/lib/utils'

export function TechHomePage() {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const { data, isLoading } = useWorkOrders({ assigneeId: user?.id, status: 'open', perPage: 10 })
  const { data: inProgressData } = useWorkOrders({ assigneeId: user?.id, status: 'in_progress', perPage: 10 })

  if (isLoading) return <PageSpinner />

  const openOrders = data?.data ?? []
  const inProgress = inProgressData?.data ?? []
  const allActive  = [...inProgress, ...openOrders]

  const overdue = allActive.filter(w => new Date(w.dueDate) < new Date())

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div>
        <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-af-muted">AssetFlow</p>
        <h1 className="text-[22px] font-semibold tracking-[-0.015em] mt-0.5">
          Good morning, {user?.name.split(' ')[0]} 👋
        </h1>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-af-border bg-white p-4">
          <div className="flex items-center gap-2 mb-2 text-af-muted">
            <ClipboardText size={14} />
            <span className="font-mono text-[10px] uppercase tracking-[0.1em]">My tasks</span>
          </div>
          <p className="text-[28px] font-semibold tabular-nums tracking-[-0.02em]">{allActive.length}</p>
          <p className="text-[11px] text-af-muted mt-0.5">{inProgress.length} in progress</p>
        </div>
        <div className={`rounded-xl border p-4 ${overdue.length > 0 ? 'border-af-crit-200 bg-af-crit-050' : 'border-af-border bg-white'}`}>
          <div className={`flex items-center gap-2 mb-2 ${overdue.length > 0 ? 'text-af-crit-600' : 'text-af-muted'}`}>
            <Clock size={14} />
            <span className="font-mono text-[10px] uppercase tracking-[0.1em]">Overdue</span>
          </div>
          <p className={`text-[28px] font-semibold tabular-nums tracking-[-0.02em] ${overdue.length > 0 ? 'text-af-crit-600' : ''}`}>{overdue.length}</p>
          <p className="text-[11px] text-af-muted mt-0.5">need attention</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/tech/scan')}
          className="flex items-center gap-3 p-4 rounded-xl border border-af-border bg-white hover:bg-af-ink-050 transition-colors duration-[120ms] text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-af-orange-500/10 flex items-center justify-center">
            <QrCode size={20} className="text-af-orange-500" />
          </div>
          <div>
            <p className="text-[14px] font-semibold">Scan asset</p>
            <p className="text-[11px] text-af-muted">QR / barcode</p>
          </div>
        </button>
        <button
          onClick={() => navigate('/tech/work-orders')}
          className="flex items-center gap-3 p-4 rounded-xl border border-af-border bg-white hover:bg-af-ink-050 transition-colors duration-[120ms] text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-af-blue-100 flex items-center justify-center">
            <ClipboardText size={20} className="text-af-blue-600" />
          </div>
          <div>
            <p className="text-[14px] font-semibold">My tasks</p>
            <p className="text-[11px] text-af-muted">{allActive.length} open</p>
          </div>
        </button>
      </div>

      {/* Recent work orders */}
      {allActive.length > 0 && (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-af-muted mb-3">Recent tasks</p>
          <div className="space-y-2">
            {allActive.slice(0, 5).map(wo => (
              <div
                key={wo.id}
                onClick={() => navigate(`/tech/work-orders/${wo.id}/log`)}
                className="flex items-center gap-3 p-3 rounded-xl border border-af-border bg-white hover:bg-af-ink-050 transition-colors duration-[120ms] cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <PriorityPill priority={wo.priority} />
                    <StatusPill status={wo.status} />
                  </div>
                  <p className="text-[14px] font-medium truncate">{wo.title}</p>
                  <p className="text-[11px] text-af-muted">{wo.asset?.name ?? '—'}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-mono text-[10px] text-af-muted">{formatDate(wo.dueDate)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
