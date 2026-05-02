import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Wrench, Warning, ClipboardText } from '@phosphor-icons/react'
import { useAsset } from '@/hooks/useAssets'
import { useWorkOrders } from '@/hooks/useWorkOrders'
import { StatusPill, PriorityPill, IdTag } from '@/components/ui/Badge'
import { PageSpinner } from '@/components/ui/Spinner'
import { formatDate } from '@/lib/utils'

export function TechAssetPage() {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: asset, isLoading }   = useAsset(id ?? '')
  const { data: workOrdersData }     = useWorkOrders({ assetId: id, perPage: 5, status: 'open' })
  const workOrders = workOrdersData?.data ?? []

  if (isLoading || !asset) return <PageSpinner />

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-af-border text-af-muted hover:bg-af-ink-050 transition-colors duration-[120ms]"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-mono text-[11px] text-af-orange-500">{asset.assetCode}</span>
            <StatusPill status={asset.status} />
          </div>
          <h1 className="text-[20px] font-semibold tracking-[-0.015em]">{asset.name}</h1>
        </div>
      </div>

      {/* Info card */}
      <div className="rounded-xl border border-af-border bg-white p-4 space-y-3">
        {[
          { label: 'Location',    value: asset.location?.name ?? '—' },
          { label: 'Category',    value: asset.category?.name ?? '—' },
          { label: 'Manufacturer', value: asset.manufacturer ? `${asset.manufacturer} ${asset.model ?? ''}`.trim() : '—' },
          { label: 'Serial No.',  value: asset.serialNumber ?? '—', mono: true },
        ].map(row => (
          <div key={row.label} className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-af-muted">{row.label}</span>
            <span className={`text-[13px] ${row.mono ? 'font-mono' : ''}`}>{row.value}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate(`/tech/assets/${asset.id}/report`)}
          className="flex items-center gap-3 p-4 rounded-xl border border-af-border bg-white hover:bg-af-ink-050 transition-colors duration-[120ms]"
        >
          <div className="w-9 h-9 rounded-lg bg-af-crit-100 flex items-center justify-center">
            <Warning size={16} className="text-af-crit-600" />
          </div>
          <div className="text-left">
            <p className="text-[13px] font-semibold">Report issue</p>
            <p className="text-[11px] text-af-muted">Log a fault</p>
          </div>
        </button>
        <button
          onClick={() => navigate('/tech/work-orders')}
          className="flex items-center gap-3 p-4 rounded-xl border border-af-border bg-white hover:bg-af-ink-050 transition-colors duration-[120ms]"
        >
          <div className="w-9 h-9 rounded-lg bg-af-blue-100 flex items-center justify-center">
            <ClipboardText size={16} className="text-af-blue-600" />
          </div>
          <div className="text-left">
            <p className="text-[13px] font-semibold">Work orders</p>
            <p className="text-[11px] text-af-muted">{workOrders.length} open</p>
          </div>
        </button>
      </div>

      {/* Open work orders */}
      {workOrders.length > 0 && (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-af-muted mb-3">Open work orders</p>
          <div className="space-y-2">
            {workOrders.map(wo => (
              <div
                key={wo.id}
                onClick={() => navigate(`/tech/work-orders/${wo.id}/log`)}
                className="flex items-center gap-3 p-3 rounded-xl border border-af-border bg-white cursor-pointer hover:bg-af-ink-050 transition-colors duration-[120ms]"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <IdTag>{wo.workOrderCode}</IdTag>
                    <PriorityPill priority={wo.priority} />
                  </div>
                  <p className="text-[14px] font-medium truncate">{wo.title}</p>
                  <p className="text-[11px] text-af-muted">Due {formatDate(wo.dueDate)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
