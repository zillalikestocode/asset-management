import { useAssets } from '@/hooks/useAssets'
import { useWorkOrders } from '@/hooks/useWorkOrders'
import { useSchedules } from '@/hooks/useMaintenance'
import { Card, CardHeader } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { PageSpinner } from '@/components/ui/Spinner'
import { Package, ClipboardText, Wrench, CheckCircle } from '@phosphor-icons/react'

export function ReportsPage() {
  const { data: assetsData,     isLoading: la } = useAssets({ perPage: 999 })
  const { data: allWOs,         isLoading: lw } = useWorkOrders({ perPage: 999 })
  const { data: schedules,      isLoading: ls } = useSchedules()

  if (la || lw || ls) return <PageSpinner />

  const assets     = assetsData?.data ?? []
  const workOrders = allWOs?.data ?? []
  const totalWOs   = allWOs?.total ?? 0

  const completedWOs = workOrders.filter(w => w.status === 'completed')
  const overdueWOs   = workOrders.filter(w => w.status !== 'completed' && w.status !== 'cancelled' && !!w.dueDate && new Date(w.dueDate) < new Date())
  const completionRate = totalWOs > 0 ? Math.round((completedWOs.length / totalWOs) * 100) : 0

  const statusCounts: Record<string, number> = {}
  for (const a of assets) {
    statusCounts[a.status] = (statusCounts[a.status] ?? 0) + 1
  }

  const categoryCounts: Record<string, { name: string; count: number }> = {}
  for (const a of assets) {
    const key = a.categoryId ?? 'unknown'
    if (!categoryCounts[key]) categoryCounts[key] = { name: a.category?.name ?? 'Unknown', count: 0 }
    categoryCounts[key].count++
  }
  const topCategories = Object.values(categoryCounts).sort((a, b) => b.count - a.count).slice(0, 5)

  const activeSchedules = (schedules ?? []).filter(s => s.active)
  const overdueSchedules = (schedules ?? []).filter(s => s.nextDueAt && new Date(s.nextDueAt) < new Date() && s.active)

  return (
    <div className="space-y-5">
      <div>
        <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-af-muted">Analytics</p>
        <h1 className="text-2xl font-semibold tracking-[-0.015em] mt-0.5">Reports</h1>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard label="Total assets"     value={assets.length}        icon={<Package size={14} />} sub={`${statusCounts['active'] ?? 0} active`} />
        <KpiCard label="Total work orders" value={totalWOs}            icon={<ClipboardText size={14} />} sub={`${overdueWOs.length} overdue`} variant={overdueWOs.length > 0 ? 'crit' : 'default'} />
        <KpiCard label="Completion rate"  value={`${completionRate}%`} icon={<CheckCircle size={14} />} variant={completionRate >= 80 ? 'ok' : completionRate >= 50 ? 'warn' : 'crit'} />
        <KpiCard label="Active schedules" value={activeSchedules.length} icon={<Wrench size={14} />} variant={overdueSchedules.length > 0 ? 'warn' : 'default'} sub={overdueSchedules.length > 0 ? `${overdueSchedules.length} overdue` : undefined} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Asset status breakdown */}
        <Card>
          <CardHeader title="Asset status breakdown" />
          <div className="space-y-2.5">
            {[
              { label: 'Active',      key: 'active',      cls: 'bg-af-ok-500' },
              { label: 'Maintenance', key: 'maintenance', cls: 'bg-af-blue-500' },
              { label: 'Inactive',    key: 'inactive',    cls: 'bg-af-ink-300' },
              { label: 'Retired',     key: 'retired',     cls: 'bg-af-ink-200' },
            ].map(row => {
              const count = statusCounts[row.key] ?? 0
              const pct   = assets.length > 0 ? (count / assets.length) * 100 : 0
              return (
                <div key={row.key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] text-af-muted">{row.label}</span>
                    <span className="font-mono text-[12px] font-semibold">{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-af-ink-100 overflow-hidden">
                    <div className={`h-full rounded-full ${row.cls} transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Work order breakdown */}
        <Card>
          <CardHeader title="Work order breakdown" />
          <div className="space-y-2.5">
            {[
              { label: 'Open',        key: 'open',        cls: 'bg-af-blue-500' },
              { label: 'In progress', key: 'in_progress', cls: 'bg-af-orange-500' },
              { label: 'Completed',   key: 'completed',   cls: 'bg-af-ok-500' },
              { label: 'Cancelled',   key: 'cancelled',   cls: 'bg-af-ink-300' },
            ].map(row => {
              const count = workOrders.filter(w => w.status === row.key).length
              const pct   = workOrders.length > 0 ? (count / workOrders.length) * 100 : 0
              return (
                <div key={row.key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] text-af-muted">{row.label}</span>
                    <span className="font-mono text-[12px] font-semibold">{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-af-ink-100 overflow-hidden">
                    <div className={`h-full rounded-full ${row.cls} transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Top categories */}
        <Card>
          <CardHeader title="Assets by category" />
          {topCategories.length === 0
            ? <p className="text-[13px] text-af-muted py-4 text-center">No data</p>
            : (
              <div className="space-y-2.5">
                {topCategories.map(cat => {
                  const pct = assets.length > 0 ? (cat.count / assets.length) * 100 : 0
                  return (
                    <div key={cat.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[12px] text-af-muted">{cat.name}</span>
                        <span className="font-mono text-[12px] font-semibold">{cat.count}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-af-ink-100 overflow-hidden">
                        <div className="h-full rounded-full bg-af-orange-400 transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          }
        </Card>

        {/* Priority breakdown */}
        <Card>
          <CardHeader title="Work orders by priority" />
          <div className="space-y-2.5">
            {[
              { label: 'Critical', key: 'critical', cls: 'bg-af-crit-600' },
              { label: 'High',     key: 'high',     cls: 'bg-af-orange-500' },
              { label: 'Medium',   key: 'medium',   cls: 'bg-af-amber-500' },
              { label: 'Low',      key: 'low',      cls: 'bg-af-ink-300' },
            ].map(row => {
              const count = workOrders.filter(w => w.priority === row.key).length
              const pct   = workOrders.length > 0 ? (count / workOrders.length) * 100 : 0
              return (
                <div key={row.key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] text-af-muted">{row.label}</span>
                    <span className="font-mono text-[12px] font-semibold">{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-af-ink-100 overflow-hidden">
                    <div className={`h-full rounded-full ${row.cls} transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}
