import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea, Field } from '@/components/ui/Input'
import { useCreateWorkOrder, useUpdateWorkOrder } from '@/hooks/useWorkOrders'
import { useUsers } from '@/hooks/useUsers'
import type { Asset, WorkOrder } from '@/types'

const schema = z.object({
  title:          z.string().min(3, 'Title is required'),
  assetId:        z.string().min(1, 'Asset is required'),
  priority:       z.enum(['low', 'medium', 'high', 'critical']),
  status:         z.enum(['open', 'in_progress', 'completed', 'cancelled']),
  dueDate:        z.string().min(1, 'Due date is required'),
  assignedToId:   z.string().optional(),
  estimatedHours: z.coerce.number().optional(),
  description:    z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  assets: Asset[]
  workOrder?: WorkOrder | null
}

export function WorkOrderFormModal({ open, onClose, assets, workOrder }: Props) {
  const isEdit = !!workOrder
  const { data: usersData } = useUsers()
  const users = usersData ?? []

  const createWO = useCreateWorkOrder()
  const updateWO = useUpdateWorkOrder(workOrder?.id ?? '')

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'medium', status: 'open' },
  })

  useEffect(() => {
    if (open) {
      reset(workOrder ? {
        title:          workOrder.title,
        assetId:        workOrder.assetId,
        priority:       workOrder.priority,
        status:         workOrder.status,
        dueDate:        workOrder.dueDate?.split('T')[0] ?? '',
        assignedToId:   workOrder.assignedToId ?? '',
        estimatedHours: workOrder.estimatedHours ?? undefined,
        description:    workOrder.description ?? '',
      } : { priority: 'medium', status: 'open' })
    }
  }, [open, workOrder, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        ...values,
        assignedToId:   values.assignedToId || undefined,
        estimatedHours: values.estimatedHours || undefined,
        description:    values.description || undefined,
      }
      if (isEdit) {
        await updateWO.mutateAsync(payload)
        toast.success('Work order updated')
      } else {
        await createWO.mutateAsync(payload)
        toast.success('Work order created')
      }
      onClose()
    } catch {
      toast.error('Something went wrong')
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit work order' : 'New work order'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="accent" size="sm" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <Field label="Title" required error={errors.title?.message} className="col-span-2">
          <Input {...register('title')} placeholder="e.g. Replace drive belt on Mill A3" />
        </Field>

        <Field label="Asset" required error={errors.assetId?.message} className="col-span-2">
          <Select {...register('assetId')}>
            <option value="">Select asset…</option>
            {assets.map(a => (
              <option key={a.id} value={a.id}>{a.assetCode} — {a.name}</option>
            ))}
          </Select>
        </Field>

        <Field label="Priority" required error={errors.priority?.message}>
          <Select {...register('priority')}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </Select>
        </Field>

        <Field label="Status" required error={errors.status?.message}>
          <Select {...register('status')}>
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </Field>

        <Field label="Due date" required error={errors.dueDate?.message}>
          <Input type="date" {...register('dueDate')} />
        </Field>

        <Field label="Assignee" error={errors.assignedToId?.message}>
          <Select {...register('assignedToId')}>
            <option value="">Unassigned</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </Select>
        </Field>

        <Field label="Estimated hours" error={errors.estimatedHours?.message}>
          <Input type="number" step="0.5" {...register('estimatedHours')} placeholder="0" />
        </Field>

        <Field label="Description" error={errors.description?.message} className="col-span-2">
          <Textarea {...register('description')} rows={3} placeholder="Describe the work to be done…" />
        </Field>
      </div>
    </Modal>
  )
}
