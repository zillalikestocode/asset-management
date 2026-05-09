import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Select, Field } from '@/components/ui/Input'
import { useCreateAsset, useUpdateAsset } from '@/hooks/useAssets'
import { useCategories, useLocations } from '@/hooks/useCategories'
import { useUsers } from '@/hooks/useUsers'
import { CategorySetupPrompt } from './CategorySetupPrompt'
import type { Asset } from '@/types'

const schema = z.object({
  name:           z.string().min(2, 'Name is required'),
  categoryId:     z.string().min(1, 'Category is required'),
  locationId:     z.string().optional(),
  status:         z.enum(['active', 'inactive', 'maintenance', 'retired']),
  serialNumber:   z.string().optional(),
  manufacturer:   z.string().optional(),
  model:          z.string().optional(),
  purchaseDate:   z.string().optional(),
  purchaseCost:   z.coerce.number().optional(),
  assignedUserId: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  asset?: Asset | null
}

export function AssetFormModal({ open, onClose, asset }: Props) {
  const isEdit = !!asset

  const { data: categories, isLoading: loadingCats } = useCategories()
  const { data: locations } = useLocations()
  const { data: usersData } = useUsers()
  const users = usersData ?? []

  const createAsset = useCreateAsset()
  const updateAsset = useUpdateAsset(asset?.id ?? '')

  // Show the category setup prompt when creating a new asset and no categories exist
  const needsCategories = !isEdit && !loadingCats && (categories ?? []).length === 0
  const [categoryPromptDone, setCategoryPromptDone] = useState(false)
  const showCategoryPrompt = needsCategories && !categoryPromptDone

  // Reset the "done" flag each time the modal closes so it re-evaluates on next open
  useEffect(() => {
    if (!open) setCategoryPromptDone(false)
  }, [open])

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'active' },
  })

  useEffect(() => {
    if (open) {
      reset(asset ? {
        name:           asset.name,
        categoryId:     asset.categoryId ?? '',
        locationId:     asset.locationId ?? '',
        status:         asset.status,
        serialNumber:   asset.serialNumber ?? '',
        manufacturer:   asset.manufacturer ?? '',
        model:          asset.model ?? '',
        purchaseDate:   asset.purchaseDate ?? '',
        purchaseCost:   asset.purchaseCost ?? undefined,
        assignedUserId: asset.assignedUserId ?? '',
      } : { status: 'active' })
    }
  }, [open, asset, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        ...values,
        purchaseCost:   values.purchaseCost || undefined,
        serialNumber:   values.serialNumber || undefined,
        manufacturer:   values.manufacturer || undefined,
        model:          values.model || undefined,
        purchaseDate:   values.purchaseDate || undefined,
        locationId:     values.locationId || undefined,
        assignedUserId: values.assignedUserId || undefined,
      }
      if (isEdit) {
        await updateAsset.mutateAsync(payload)
        toast.success('Asset updated')
      } else {
        await createAsset.mutateAsync(payload)
        toast.success('Asset created')
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
      title={showCategoryPrompt ? 'Before you add an asset…' : isEdit ? 'Edit asset' : 'New asset'}
      size="lg"
      footer={
        showCategoryPrompt ? null : (
          <>
            <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
            <Button variant="accent" size="sm" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create asset'}
            </Button>
          </>
        )
      }
    >
      {showCategoryPrompt ? (
        <CategorySetupPrompt
          onDone={() => setCategoryPromptDone(true)}
          onCancel={onClose}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <Field label="Asset name" required error={errors.name?.message} className="col-span-2">
            <Input {...register('name')} placeholder="e.g. CNC Mill A3" />
          </Field>

          <Field label="Category" required error={errors.categoryId?.message}>
            <Select {...register('categoryId')}>
              <option value="">Select category…</option>
              {(categories ?? []).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </Field>

          <Field label="Location" error={errors.locationId?.message}>
            <Select {...register('locationId')}>
              <option value="">No location</option>
              {(locations ?? []).map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </Select>
          </Field>

          <Field label="Status" required error={errors.status?.message}>
            <Select {...register('status')}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Under maintenance</option>
              <option value="retired">Retired</option>
            </Select>
          </Field>

          <Field label="Assigned to" error={errors.assignedUserId?.message}>
            <Select {...register('assignedUserId')}>
              <option value="">Unassigned</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </Select>
          </Field>

          <Field label="Manufacturer" error={errors.manufacturer?.message}>
            <Input {...register('manufacturer')} placeholder="e.g. Haas" />
          </Field>

          <Field label="Model" error={errors.model?.message}>
            <Input {...register('model')} placeholder="e.g. ST-10Y" />
          </Field>

          <Field label="Serial number" error={errors.serialNumber?.message}>
            <Input {...register('serialNumber')} placeholder="SN-XXXX-XXXX" />
          </Field>

          <Field label="Purchase date" error={errors.purchaseDate?.message}>
            <Input type="date" {...register('purchaseDate')} />
          </Field>

          <Field label="Purchase cost (USD)" error={errors.purchaseCost?.message}>
            <Input type="number" step="0.01" {...register('purchaseCost')} placeholder="0.00" />
          </Field>
        </div>
      )}
    </Modal>
  )
}
