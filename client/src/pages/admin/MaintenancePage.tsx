import { useState } from 'react'
import { Plus, Wrench } from '@phosphor-icons/react'
import { useSchedules, useDeleteSchedule } from '@/hooks/useMaintenance'
import { useAssets } from '@/hooks/useAssets'
import { Table, Thead, Th, Tbody, Tr, Td } from '@/components/ui/Table'
import { PriorityPill } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { MaintenanceFormModal } from './MaintenanceFormModal'
import { formatRelative, cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { MaintenanceSchedule } from '@/types'

export function MaintenancePage() {
  const [showForm, setShowForm] = useState(false)
  const [editSchedule, setEditSchedule] = useState<MaintenanceSchedule | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MaintenanceSchedule | null>(null)

  const { data: schedules, isLoading } = useSchedules()
  const { data: assetsData }           = useAssets({ perPage: 999 })
  const deleteSchedule                 = useDeleteSchedule()

  const assets = assetsData?.data ?? []

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteSchedule.mutateAsync(deleteTarget.id)
      toast.success('Schedule deleted')
    } catch {
      toast.error('Failed to delete schedule')
    }
    setDeleteTarget(null)
  }

  if (isLoading) return <PageSpinner />

  const sorted = [...(schedules ?? [])].sort((a, b) => {
    if (!a.nextDueAt) return 1
    if (!b.nextDueAt) return -1
    return new Date(a.nextDueAt).getTime() - new Date(b.nextDueAt).getTime()
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-af-muted">PM</p>
          <h1 className="text-2xl font-semibold tracking-[-0.015em] mt-0.5">Maintenance</h1>
        </div>
        <Button variant="accent" size="sm" onClick={() => { setEditSchedule(null); setShowForm(true) }}>
          <Plus size={13} className="mr-1" />New schedule
        </Button>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon={<Wrench size={28} />}
          title="No maintenance schedules"
          description="Set up preventive maintenance schedules to keep assets running."
          action={
            <Button variant="accent" size="sm" onClick={() => { setEditSchedule(null); setShowForm(true) }}>
              + New schedule
            </Button>
          }
        />
      ) : (
        <Table>
          <Thead>
            <tr>
              <Th>Schedule name</Th>
              <Th>Asset</Th>
              <Th>Type</Th>
              <Th>Interval</Th>
              <Th>Priority</Th>
              <Th>Next due</Th>
              <Th>Active</Th>
              <Th />
            </tr>
          </Thead>
          <Tbody>
            {sorted.map(s => (
              <Tr key={s.id}>
                <Td>
                  <span className="font-medium text-[13px]">{s.name}</span>
                  {s.description && (
                    <p className="font-mono text-[10px] text-af-muted mt-0.5 truncate max-w-[200px]">{s.description}</p>
                  )}
                </Td>
                <Td muted>{s.asset?.name ?? '—'}</Td>
                <Td mono>{s.scheduleType === 'time_based' ? 'Time' : 'Usage'}</Td>
                <Td muted>
                  {s.scheduleType === 'time_based'
                    ? s.intervalDays ? `Every ${s.intervalDays}d` : '—'
                    : s.intervalHours ? `Every ${s.intervalHours}h` : '—'}
                </Td>
                <Td><PriorityPill priority={s.priority} /></Td>
                <Td muted>
                  {s.nextDueAt
                    ? <span className={cn(new Date(s.nextDueAt) < new Date() ? 'text-af-crit-600 font-medium' : '')}>
                        {formatRelative(s.nextDueAt)}
                      </span>
                    : '—'}
                </Td>
                <Td>
                  <span className={cn(
                    'font-mono text-[10px] uppercase tracking-[0.06em] px-1.5 py-0.5 rounded-full',
                    s.active ? 'bg-af-ok-100 text-af-ok-600' : 'bg-af-ink-100 text-af-muted',
                  )}>
                    {s.active ? 'Active' : 'Paused'}
                  </span>
                </Td>
                <Td>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditSchedule(s); setShowForm(true) }}
                      className="font-mono text-[10px] uppercase tracking-[0.06em] px-2 py-1 rounded border border-af-border hover:bg-af-ink-050 text-af-muted transition-colors duration-[120ms]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(s)}
                      className="font-mono text-[10px] uppercase tracking-[0.06em] px-2 py-1 rounded border border-af-crit-200 hover:bg-af-crit-100 text-af-crit-600 transition-colors duration-[120ms]"
                    >
                      Delete
                    </button>
                  </div>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      <MaintenanceFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        schedule={editSchedule}
        assets={assets}
      />

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete schedule"
        description="This action cannot be undone."
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleteSchedule.isPending}>
              {deleteSchedule.isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </>
        }
      >
        <p className="text-[13px] text-af-fg">
          Delete <strong>{deleteTarget?.name}</strong>? No future work orders will be auto-generated.
        </p>
      </Modal>
    </div>
  )
}
