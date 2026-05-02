import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MagnifyingGlass, FunnelSimple, ClipboardText, Plus } from '@phosphor-icons/react'
import { useWorkOrders } from '@/hooks/useWorkOrders'
import { useAssets } from '@/hooks/useAssets'
import { Table, Thead, Th, Tbody, Tr, Td, TdEmpty } from '@/components/ui/Table'
import { StatusPill, PriorityPill, IdTag } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { PageSpinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { WorkOrderFormModal } from './WorkOrderFormModal'
import { formatDate } from '@/lib/utils'

export function WorkOrdersPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [showForm, setShowForm] = useState(false)

  const { data, isLoading } = useWorkOrders({
    page,
    perPage: 20,
    status: status || undefined,
    priority: priority || undefined,
  })

  const { data: assetsData } = useAssets({ perPage: 999 })

  const workOrders = data?.data ?? []
  const total = data?.total ?? 0

  const filtered = search
    ? workOrders.filter(wo =>
        wo.title.toLowerCase().includes(search.toLowerCase()) ||
        wo.asset?.name.toLowerCase().includes(search.toLowerCase()),
      )
    : workOrders

  if (isLoading) return <PageSpinner />

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-af-muted">Operations</p>
          <h1 className="text-2xl font-semibold tracking-[-0.015em] mt-0.5">Work Orders</h1>
        </div>
        <Button variant="accent" size="sm" onClick={() => setShowForm(true)}>
          <Plus size={13} className="mr-1" />New work order
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 bg-white border border-af-border rounded px-2.5 py-1.5 w-64 text-[12px] text-af-muted">
          <MagnifyingGlass size={13} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search work orders…"
            className="flex-1 bg-transparent outline-none text-af-fg placeholder:text-af-subtle text-[12px]"
          />
        </div>

        <FunnelSimple size={13} className="text-af-muted" />

        <Select className="w-36 h-8 text-[12px]" value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </Select>

        <Select className="w-36 h-8 text-[12px]" value={priority} onChange={e => { setPriority(e.target.value); setPage(1) }}>
          <option value="">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </Select>

        {(search || status || priority) && (
          <button
            onClick={() => { setSearch(''); setStatus(''); setPriority(''); setPage(1) }}
            className="font-mono text-[10px] uppercase tracking-[0.08em] text-af-muted hover:text-af-fg transition-colors duration-[120ms]"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<ClipboardText size={28} />}
          title="No work orders found"
          description={search || status || priority ? 'Try adjusting your filters.' : 'Create your first work order to get started.'}
          action={!search && !status && !priority
            ? <Button variant="accent" size="sm" onClick={() => setShowForm(true)}>+ New work order</Button>
            : undefined}
        />
      ) : (
        <>
          <Table>
            <Thead>
              <tr>
                <Th>Code</Th>
                <Th>Title</Th>
                <Th>Asset</Th>
                <Th>Priority</Th>
                <Th>Status</Th>
                <Th>Assignee</Th>
                <Th>Due</Th>
              </tr>
            </Thead>
            <Tbody>
              {filtered.map(wo => (
                <Tr key={wo.id} onClick={() => navigate(`/work-orders/${wo.id}`)}>
                  <Td><IdTag>WO-{wo.id.slice(0, 6).toUpperCase()}</IdTag></Td>
                  <Td>
                    <span className="font-medium text-[13px]">{wo.title}</span>
                  </Td>
                  <Td muted>{wo.asset?.name ?? '—'}</Td>
                  <Td><PriorityPill priority={wo.priority} /></Td>
                  <Td><StatusPill status={wo.status} /></Td>
                  <Td muted>{wo.assignedTo?.name ?? 'Unassigned'}</Td>
                  <Td muted>{formatDate(wo.dueDate)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          {total > 20 && (
            <Pagination page={page} perPage={20} total={total} onPage={setPage} />
          )}
        </>
      )}

      <WorkOrderFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        assets={assetsData?.data ?? []}
      />
    </div>
  )
}
