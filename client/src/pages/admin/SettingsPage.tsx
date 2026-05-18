import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Trash } from '@phosphor-icons/react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Field } from '@/components/ui/Input'
import { useCategories, useLocations, useCreateCategory, useCreateLocation, useDeleteCategory, useDeleteLocation } from '@/hooks/useCategories'
import { useChangePassword } from '@/hooks/useUsers'
import { apiError } from '@/lib/utils'

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword:     z.string().min(8, 'Must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Required'),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})
type PasswordValues = z.infer<typeof passwordSchema>

export function SettingsPage() {
  const [newCategory, setNewCategory] = useState('')
  const [newLocation, setNewLocation] = useState('')

  const { data: categories } = useCategories()
  const { data: locations }  = useLocations()
  const createCat  = useCreateCategory()
  const createLoc  = useCreateLocation()
  const deleteCat  = useDeleteCategory()
  const deleteLoc  = useDeleteLocation()
  const changePassword = useChangePassword()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
  })

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return
    try {
      await createCat.mutateAsync({ name: newCategory.trim() })
      toast.success('Category added')
      setNewCategory('')
    } catch (err) { toast.error(apiError(err)) }
  }

  const handleAddLocation = async () => {
    if (!newLocation.trim()) return
    try {
      await createLoc.mutateAsync({ name: newLocation.trim() })
      toast.success('Location added')
      setNewLocation('')
    } catch (err) { toast.error(apiError(err)) }
  }

  const onChangePassword = async (values: PasswordValues) => {
    try {
      await changePassword.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      toast.success('Password updated')
      reset()
    } catch (err) {
      toast.error(apiError(err, 'Failed to update password'))
    }
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-af-muted">Config</p>
        <h1 className="text-2xl font-semibold tracking-[-0.015em] mt-0.5">Settings</h1>
      </div>

      {/* Security */}
      <Card>
        <CardHeader title="Security" subtitle="Change your account password" />
        <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4">
          <Field label="Current password" required error={errors.currentPassword?.message}>
            <Input type="password" {...register('currentPassword')} placeholder="Enter current password" />
          </Field>
          <Field label="New password" required error={errors.newPassword?.message}>
            <Input type="password" {...register('newPassword')} placeholder="At least 8 characters" />
          </Field>
          <Field label="Confirm new password" required error={errors.confirmPassword?.message}>
            <Input type="password" {...register('confirmPassword')} placeholder="Repeat new password" />
          </Field>
          <div className="pt-1">
            <Button type="submit" variant="accent" size="sm" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Update password'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader title="Asset categories" subtitle="Group assets by type" />
        <div className="space-y-2 mb-4">
          {(categories ?? []).map(c => (
            <div key={c.id} className="flex items-center justify-between py-1.5 border-b border-af-border last:border-0">
              <span className="text-[13px]">{c.name}</span>
              <button
                onClick={() => deleteCat.mutateAsync(c.id).then(() => toast.success('Deleted')).catch(err => toast.error(apiError(err)))}
                className="text-af-muted hover:text-af-crit-600 transition-colors duration-[120ms]"
              >
                <Trash size={14} />
              </button>
            </div>
          ))}
          {(categories ?? []).length === 0 && (
            <p className="text-[13px] text-af-muted py-2">No categories yet</p>
          )}
        </div>
        <div className="flex gap-2">
          <Input
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            placeholder="New category name…"
            onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
          />
          <Button variant="secondary" size="sm" onClick={handleAddCategory} disabled={createCat.isPending}>
            Add
          </Button>
        </div>
      </Card>

      {/* Locations */}
      <Card>
        <CardHeader title="Locations" subtitle="Physical areas where assets are kept" />
        <div className="space-y-2 mb-4">
          {(locations ?? []).map(l => (
            <div key={l.id} className="flex items-center justify-between py-1.5 border-b border-af-border last:border-0">
              <span className="text-[13px]">{l.name}</span>
              <button
                onClick={() => deleteLoc.mutateAsync(l.id).then(() => toast.success('Deleted')).catch(err => toast.error(apiError(err)))}
                className="text-af-muted hover:text-af-crit-600 transition-colors duration-[120ms]"
              >
                <Trash size={14} />
              </button>
            </div>
          ))}
          {(locations ?? []).length === 0 && (
            <p className="text-[13px] text-af-muted py-2">No locations yet</p>
          )}
        </div>
        <div className="flex gap-2">
          <Input
            value={newLocation}
            onChange={e => setNewLocation(e.target.value)}
            placeholder="New location name…"
            onKeyDown={e => e.key === 'Enter' && handleAddLocation()}
          />
          <Button variant="secondary" size="sm" onClick={handleAddLocation} disabled={createLoc.isPending}>
            Add
          </Button>
        </div>
      </Card>
    </div>
  )
}
