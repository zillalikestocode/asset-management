import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea, Field } from '@/components/ui/Input'
import { useCreateSchedule, useUpdateSchedule } from '@/hooks/useMaintenance'
import { useUsers } from '@/hooks/useUsers'
import type { Asset, MaintenanceSchedule } from '@/types'

const schema = z.object({
  name:              z.string().min(2, 'Name is required'),
  assetId:           z.string().min(1, 'Asset is required'),
  taskType:          z.string().min(1, 'Task type is required'),
  scheduleType:      z.enum(['time_based', 'usage_based']),
  intervalDays:      z.coerce.number().optional(),
  intervalHours:     z.coerce.number().optional(),
  leadTimeDays:      z.coerce.number().min(0).default(7),
  priority:          z.enum(['low', 'medium', 'high', 'critical']),
  defaultAssigneeId: z.string().optional(),
  description:       z.string().optional(),
  active:            z.boolean().default(true),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  schedule?: MaintenanceSchedule | null
  assets: Asset[]
}

export function MaintenanceFormModal({ open, onClose, schedule, assets }: Props) {
  const isEdit = !!schedule
  const { data: usersData } = useUsers()
  const users = usersData ?? []

  const createSchedule = useCreateSchedule()
  const updateSchedule = useUpdateSchedule(schedule?.id ?? '')

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { scheduleType: 'time_based', priority: 'medium', leadTimeDays: 7, active: true },
  })

  const scheduleType = watch('scheduleType')

  useEffect(() => {
    if (open) {
      reset(schedule ? {
        name:              schedule.name,
        assetId:           schedule.assetId ?? '',
        taskType:          schedule.taskType,
        scheduleType:      schedule.scheduleType,
        intervalDays:      schedule.intervalDays ?? undefined,
        intervalHours:     schedule.intervalHours ?? undefined,
        leadTimeDays:      schedule.leadTimeDays,
        priority:          schedule.priority,
        defaultAssigneeId: schedule.defaultAssigneeId ?? '',
        description:       schedule.description ?? '',
        active:            schedule.active,
      } : { scheduleType: 'time_based', priority: 'medium', leadTimeDays: 7, active: true })
    }
  }, [open, schedule, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        ...values,
        defaultAssigneeId: values.defaultAssigneeId || undefined,
        description:       values.description || undefined,
        intervalDays:      values.scheduleType === 'time_based' ? (values.intervalDays || undefined) : undefined,
        intervalHours:     values.scheduleType === 'usage_based' ? (values.intervalHours || undefined) : undefined,
      }
      if (isEdit) {
        await updateSchedule.mutateAsync(payload)
        toast.success('Schedule updated')
      } else {
        await createSchedule.mutateAsync(payload)
        toast.success('Schedule created')
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
      title={isEdit ? 'Edit schedule' : 'New maintenance schedule'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="accent" size="sm" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create schedule'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <Field label="Schedule name" required error={errors.name?.message} className="col-span-2">
          <Input {...register('name')} placeholder="e.g. Monthly lubrication check" />
        </Field>

        <Field label="Asset" required error={errors.assetId?.message} className="col-span-2">
          <Select {...register('assetId')}>
            <option value="">Select asset…</option>
            {assets.map(a => (
              <option key={a.id} value={a.id}>{a.assetCode} — {a.name}</option>
            ))}
          </Select>
        </Field>

        <Field label="Task type" required error={errors.taskType?.message}>
          <Input {...register('taskType')} placeholder="e.g. Oil Change, Inspection" />
        </Field>

        <Field label="Priority" required error={errors.priority?.message}>
          <Select {...register('priority')}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </Select>
        </Field>

        <Field label="Schedule type" required error={errors.scheduleType?.message}>
          <Select {...register('scheduleType')}>
            <option value="time_based">Time-based</option>
            <option value="usage_based">Usage-based</option>
          </Select>
        </Field>

        {scheduleType === 'time_based' ? (
          <Field label="Interval (days)" required error={errors.intervalDays?.message}>
            <Input type="number" {...register('intervalDays')} placeholder="e.g. 30" />
          </Field>
        ) : (
          <Field label="Usage threshold (hours)" required error={errors.intervalHours?.message}>
            <Input type="number" {...register('intervalHours')} placeholder="e.g. 500" />
          </Field>
        )}

        <Field label="Lead time (days)" error={errors.leadTimeDays?.message}>
          <Input type="number" {...register('leadTimeDays')} placeholder="7" />
        </Field>

        <Field label="Default assignee" error={errors.defaultAssigneeId?.message}>
          <Select {...register('defaultAssigneeId')}>
            <option value="">Unassigned</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </Select>
        </Field>

        <Field label="Description" error={errors.description?.message} className="col-span-2">
          <Textarea {...register('description')} rows={2} placeholder="Optional notes about this schedule…" />
        </Field>

        <Field label="Status" error={errors.active?.message}>
          <Select {...register('active', { setValueAs: v => v === 'true' || v === true })}>
            <option value="true">Active</option>
            <option value="false">Paused</option>
          </Select>
        </Field>
      </div>
    </Modal>
  )
}
