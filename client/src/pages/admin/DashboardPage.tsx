import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Wrench, Warning, ClipboardText, ArrowRight, Clock } from '@phosphor-icons/react'
import { useAssets } from '@/hooks/useAssets'
import { useWorkOrders } from '@/hooks/useWorkOrders'
import { useSchedules } from '@/hooks/useMaintenance'
import { KpiCard } from '@/components/ui/KpiCard'
import { Card, CardHeader } from '@/components/ui/Card'
import { StatusPill, PriorityPill, IdTag } from '@/components/ui/Badge'
import { PageSpinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { formatDate, formatRelative } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

export function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [_tab, setTab] = useState<'week' | 'month'>('week')

  const { data: assetsData,     isLoading: loadingAssets }    = useAssets({ perPage: 999 })
  const { data: workOrdersData, isLoading: loadingWO }        = useWorkOrders({ perPage: 10, status: 'open' })
  const { data: schedules,      isLoading: loadingSchedules } = useSchedules()

  const assets     = assetsData?.data ?? []
  const workOrders = workOrdersData?.data ?? []

  const totalAssets    = assetsData?.total ?? 0
  const activeAssets   = assets.filter(a => a.status === 'active').length
  const maintenanceNow = assets.filter(a => a.status === 'maintenance').length
  const openWOs        = workOrdersData?.total ?? 0
  const criticalWOs    = workOrders.filter(w => w.priority === 'critical').length
  const overdueWOs     = workOrders.filter(w => w.dueDate && new Date(w.dueDate) < new Date()).length

  const upcoming = (schedules ?? [])
    .filter(s => s.nextDueAt)
    .sort((a, b) => new Date(a.nextDueAt!).getTime() - new Date(b.nextDueAt!).getTime())
    .slice(0, 5)

  if (loadingAssets || loadingWO || loadingSchedules) return <PageSpinner />

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-af-muted">Overview</p>
          <h1 className="text-2xl font-semibold tracking-[-0.015em] mt-0.5">Good morning, {user?.name.split(' ')[0]}</h1>
        </div>
        <Button variant="accent" size="sm" onClick={() => navigate('/assets')}>+ New asset</Button>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard label="Total assets"      value={totalAssets}    icon={<Package size={14} />} sub={`${activeAssets} active`} />
        <KpiCard label="Under maintenance" value={maintenanceNow} icon={<Wrench size={14} />}  variant={maintenanceNow > 0 ? 'warn' : 'default'} />
        <KpiCard label="Open work orders"  value={openWOs}        icon={<ClipboardText size={14} />} variant={overdueWOs > 0 ? 'crit' : 'default'} sub={overdueWOs > 0 ? `${overdueWOs} overdue` : undefined} />
        <KpiCard label="Critical issues"   value={criticalWOs}    icon={<Warning size={14} />} variant={criticalWOs > 0 ? 'crit' : 'default'} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card padding={false}>
          <div className="px-4 pt-4 pb-0 border-b border-af-border">
            <CardHeader title="Upcoming maintenance" subtitle="Next 30 days"
              actions={<div className="flex gap-1 mb-3">{(['week','month'] as const).map(t => (<button key={t} onClick={() => setTab(t)} className="font-mono text-[10px] uppercase tracking-[0.08em] px-2 py-1 rounded border border-af-border hover:bg-af-ink-050 text-af-muted transition-colors duration-[120ms]">{t}</button>))}</div>}
            />
          </div>
          <div className="divide-y divide-af-border">
            {upcoming.length === 0
              ? <p className="py-10 text-center text-[13px] text-af-muted">No upcoming maintenance</p>
              : upcoming.map(s => (
                <div key={s.id} className="flex items-center gap-3 px-4 py-3 hover:bg-af-ink-050 cursor-pointer transition-colors duration-[120ms]" onClick={() => navigate('/maintenance')}>
                  <div className="w-8 h-8 rounded bg-af-ink-100 flex items-center justify-center flex-shrink-0"><Wrench size={14} className="text-af-muted" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate">{s.name}</p>
                    <p className="font-mono text-[10px] text-af-muted mt-0.5">{s.asset?.name ?? 'Unknown asset'}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <PriorityPill priority={s.priority} />
                    <p className="font-mono text-[10px] text-af-muted mt-1">{s.nextDueAt ? formatRelative(s.nextDueAt) : '—'}</p>
                  </div>
                </div>
              ))
            }
          </div>
          <div className="px-4 py-2.5 border-t border-af-border">
            <button onClick={() => navigate('/maintenance')} className="flex items-center gap-1.5 text-[12px] text-af-orange-600 hover:underline">View all schedules <ArrowRight size={12} /></button>
          </div>
        </Card>

        <Card padding={false}>
          <div className="px-4 pt-4 pb-0 border-b border-af-border">
            <CardHeader title="Open work orders" subtitle={`${openWOs} total`} actions={<Button size="sm" variant="secondary" onClick={() => navigate('/work-orders')}>View all</Button>} />
          </div>
          <div className="divide-y divide-af-border">
            {workOrders.length === 0
              ? <p className="py-10 text-center text-[13px] text-af-muted">No open work orders</p>
              : workOrders.slice(0, 6).map(wo => (
                <div key={wo.id} className="flex items-center gap-3 px-4 py-3 hover:bg-af-ink-050 cursor-pointer transition-colors duration-[120ms]" onClick={() => navigate(`/work-orders/${wo.id}`)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5"><IdTag>WO-{wo.id.slice(0,6).toUpperCase()}</IdTag><PriorityPill priority={wo.priority} /></div>
                    <p className="text-[13px] font-medium truncate">{wo.title}</p>
                    <p className="font-mono text-[11px] text-af-muted mt-0.5">{wo.asset?.name ?? '—'}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <StatusPill status={wo.status} />
                    <p className="font-mono text-[10px] text-af-muted mt-1 flex items-center justify-end gap-1"><Clock size={10} />{wo.dueDate ? formatDate(wo.dueDate) : '—'}</p>
                  </div>
                </div>
              ))
            }
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Asset status breakdown" actions={<Button size="sm" variant="secondary" onClick={() => navigate('/assets')}>View all</Button>} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Active',      count: assets.filter(a => a.status === 'active').length,      cls: 'bg-af-ok-100 text-af-ok-600' },
            { label: 'Maintenance', count: assets.filter(a => a.status === 'maintenance').length, cls: 'bg-af-blue-100 text-af-blue-600' },
            { label: 'Inactive',    count: assets.filter(a => a.status === 'inactive').length,    cls: 'bg-af-ink-100 text-af-muted' },
            { label: 'Retired',     count: assets.filter(a => a.status === 'retired').length,     cls: 'bg-af-ink-100 text-af-muted' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-af-ink-050 border border-af-border">
              <span className="text-[13px] text-af-muted">{item.label}</span>
              <span className={`font-mono text-[12px] font-semibold px-2 py-0.5 rounded-pill ${item.cls}`}>{item.count}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
