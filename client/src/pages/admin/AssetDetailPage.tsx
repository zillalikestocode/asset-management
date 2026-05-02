import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, PencilSimple, ClipboardText, Wrench,
  Clock, MapPin, Tag,
} from '@phosphor-icons/react'
import { useAsset, useAssetHistory } from '@/hooks/useAssets'
import { useWorkOrders } from '@/hooks/useWorkOrders'
import { useSchedules } from '@/hooks/useMaintenance'
import { Card, CardHeader } from '@/components/ui/Card'
import { StatusPill, PriorityPill, IdTag } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/Spinner'
import { Table, Thead, Th, Tbody, Tr, Td, TdEmpty } from '@/components/ui/Table'
import { AssetFormModal } from './AssetFormModal'
import { formatDate, formatRelative, cn } from '@/lib/utils'

const TABS = ['Overview', 'Work Orders', 'Maintenance', 'History'] as const
type Tab = typeof TABS[number]

export function AssetDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('Overview')
  const [showEdit, setShowEdit] = useState(false)

  const { data: asset, isLoading }   = useAsset(id ?? '')
  const { data: history }            = useAssetHistory(id ?? '')
  const { data: workOrdersData }     = useWorkOrders({ assetId: id, perPage: 50 })
  const { data: schedules }          = useSchedules({ assetId: id })

  if (isLoading || !asset) return <PageSpinner />

  const workOrders = workOrdersData?.data ?? []

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/assets')}
            className="w-8 h-8 flex items-center justify-center rounded border border-af-border text-af-muted hover:text-af-fg hover:bg-af-ink-050 transition-colors duration-[120ms]"
          >
            <ArrowLeft size={15} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <IdTag>{asset.assetCode}</IdTag>
              <StatusPill status={asset.status} />
            </div>
            <h1 className="text-2xl font-semibold tracking-[-0.015em]">{asset.name}</h1>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setShowEdit(true)}>
          <PencilSimple size={13} className="mr-1" />Edit
        </Button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-0 border-b border-af-border -mb-1">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 font-mono text-[11px] uppercase tracking-[0.08em] border-b-2 -mb-px transition-colors duration-[120ms]',
              tab === t
                ? 'border-af-orange-500 text-af-fg'
                : 'border-transparent text-af-muted hover:text-af-fg',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'Overview' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Left: details */}
          <div className="xl:col-span-2 space-y-5">
            <Card>
              <CardHeader title="Asset details" />
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
                {[
                  { label: 'Manufacturer', value: asset.manufacturer ?? '—' },
                  { label: 'Model',        value: asset.model ?? '—' },
                  { label: 'Serial No.',   value: asset.serialNumber ?? '—', mono: true },
                  { label: 'Category',     value: asset.category?.name ?? '—' },
                  { label: 'Location',     value: asset.location?.name ?? '—' },
                  { label: 'Assigned to',  value: asset.assignedUser?.name ?? 'Unassigned' },
                  { label: 'Purchase date',  value: asset.purchaseDate ? formatDate(asset.purchaseDate) : '—' },
                  { label: 'Purchase cost',  value: asset.purchaseCost != null ? `$${asset.purchaseCost.toLocaleString()}` : '—' },
                  { label: 'Created',       value: formatDate(asset.createdAt) },
                ].map(row => (
                  <div key={row.label}>
                    <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-af-muted mb-0.5">{row.label}</dt>
                    <dd className={cn('text-[13px]', row.mono ? 'font-mono' : '')}>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          </div>

          {/* Right: quick stats */}
          <div className="space-y-3">
            <div className="rounded-lg border border-af-border bg-white p-4">
              <div className="flex items-center gap-2 mb-3 text-af-muted">
                <ClipboardText size={14} />
                <span className="font-mono text-[10px] uppercase tracking-[0.1em]">Work orders</span>
              </div>
              <p className="text-3xl font-semibold tabular-nums tracking-[-0.02em]">{workOrders.length}</p>
              <p className="text-[11px] text-af-muted mt-0.5">
                {workOrders.filter(w => w.status === 'open' || w.status === 'in_progress').length} open
              </p>
            </div>

            <div className="rounded-lg border border-af-border bg-white p-4">
              <div className="flex items-center gap-2 mb-3 text-af-muted">
                <Wrench size={14} />
                <span className="font-mono text-[10px] uppercase tracking-[0.1em]">Schedules</span>
              </div>
              <p className="text-3xl font-semibold tabular-nums tracking-[-0.02em]">{(schedules ?? []).length}</p>
              <p className="text-[11px] text-af-muted mt-0.5">
                {(schedules ?? []).filter(s => s.active).length} active
              </p>
            </div>

            {asset.lastLat != null && asset.lastLong != null && (
              <div className="rounded-lg border border-af-border bg-white p-4">
                <div className="flex items-center gap-2 mb-2 text-af-muted">
                  <MapPin size={14} />
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em]">Last GPS</span>
                </div>
                <p className="font-mono text-[12px]">{asset.lastLat.toFixed(5)}, {asset.lastLong.toFixed(5)}</p>
                {asset.lastLocationAt && <p className="text-[11px] text-af-muted mt-0.5">{formatRelative(asset.lastLocationAt)}</p>}
              </div>
            )}

            {asset.customFields && Object.keys(asset.customFields).length > 0 && (
              <div className="rounded-lg border border-af-border bg-white p-4">
                <div className="flex items-center gap-2 mb-3 text-af-muted">
                  <Tag size={14} />
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em]">Custom fields</span>
                </div>
                <dl className="space-y-2">
                  {Object.entries(asset.customFields).map(([k, v]) => (
                    <div key={k}>
                      <dt className="font-mono text-[10px] text-af-muted">{k}</dt>
                      <dd className="text-[13px]">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Work Orders tab */}
      {tab === 'Work Orders' && (
        <Card padding={false}>
          <div className="px-4 pt-4 pb-0 border-b border-af-border">
            <CardHeader
              title="Work orders"
              subtitle={`${workOrders.length} total`}
            />
          </div>
          <Table>
            <Thead>
              <tr>
                <Th>Code</Th>
                <Th>Title</Th>
                <Th>Priority</Th>
                <Th>Status</Th>
                <Th>Due</Th>
              </tr>
            </Thead>
            <Tbody>
              {workOrders.length === 0
                ? <TdEmpty cols={5} message="No work orders for this asset" />
                : workOrders.map(wo => (
                  <Tr key={wo.id} onClick={() => navigate(`/work-orders/${wo.id}`)}>
                    <Td><IdTag>WO-{wo.id.slice(0,6).toUpperCase()}</IdTag></Td>
                    <Td><span className="text-[13px] font-medium">{wo.title}</span></Td>
                    <Td><PriorityPill priority={wo.priority} /></Td>
                    <Td><StatusPill status={wo.status} /></Td>
                    <Td muted>{formatDate(wo.dueDate)}</Td>
                  </Tr>
                ))
              }
            </Tbody>
          </Table>
        </Card>
      )}

      {/* Maintenance tab */}
      {tab === 'Maintenance' && (
        <Card padding={false}>
          <div className="px-4 pt-4 pb-0 border-b border-af-border">
            <CardHeader title="Maintenance schedules" subtitle={`${(schedules ?? []).length} schedules`} />
          </div>
          <Table>
            <Thead>
              <tr>
                <Th>Name</Th>
                <Th>Type</Th>
                <Th>Priority</Th>
                <Th>Next due</Th>
                <Th>Active</Th>
              </tr>
            </Thead>
            <Tbody>
              {(schedules ?? []).length === 0
                ? <TdEmpty cols={5} message="No maintenance schedules" />
                : (schedules ?? []).map(s => (
                  <Tr key={s.id} onClick={() => navigate('/maintenance')}>
                    <Td><span className="text-[13px] font-medium">{s.name}</span></Td>
                    <Td mono>{s.scheduleType === 'time_based' ? 'Time' : 'Usage'}</Td>
                    <Td><PriorityPill priority={s.priority} /></Td>
                    <Td muted>{s.nextDueAt ? formatRelative(s.nextDueAt) : '—'}</Td>
                    <Td>
                      <span className={cn(
                        'font-mono text-[10px] uppercase tracking-[0.06em] px-1.5 py-0.5 rounded-full',
                        s.active ? 'bg-af-ok-100 text-af-ok-600' : 'bg-af-ink-100 text-af-muted',
                      )}>
                        {s.active ? 'Yes' : 'No'}
                      </span>
                    </Td>
                  </Tr>
                ))
              }
            </Tbody>
          </Table>
        </Card>
      )}

      {/* History tab */}
      {tab === 'History' && (
        <Card padding={false}>
          <div className="px-4 pt-4 pb-0 border-b border-af-border">
            <CardHeader title="Change history" />
          </div>
          <div className="divide-y divide-af-border">
            {(history ?? []).length === 0
              ? <p className="py-10 text-center text-[13px] text-af-muted">No history recorded</p>
              : (history ?? []).map(h => (
                <div key={h.id} className="flex items-start gap-3 px-4 py-3">
                  <div className="w-6 h-6 rounded-full bg-af-ink-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock size={11} className="text-af-muted" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px]">
                      <span className="font-medium">{h.changedBy}</span>
                      {' '}changed{' '}
                      <span className="font-mono text-[11px] text-af-muted">{h.field}</span>
                      {' '}from{' '}
                      <span className="font-mono text-[11px] bg-af-crit-100 text-af-crit-600 px-1 rounded">{h.oldValue || '—'}</span>
                      {' '}to{' '}
                      <span className="font-mono text-[11px] bg-af-ok-100 text-af-ok-600 px-1 rounded">{h.newValue}</span>
                    </p>
                  </div>
                  <p className="font-mono text-[10px] text-af-muted flex-shrink-0">{formatRelative(h.changedAt)}</p>
                </div>
              ))
            }
          </div>
        </Card>
      )}

      <AssetFormModal open={showEdit} onClose={() => setShowEdit(false)} asset={asset} />
    </div>
  )
}
