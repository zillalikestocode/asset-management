import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Users, Plus } from '@phosphor-icons/react'
import { useUsers, useInviteUser, useDeactivateUser } from '@/hooks/useUsers'
import { Table, Thead, Th, Tbody, Tr, Td, TdEmpty } from '@/components/ui/Table'
import { Button } from '@/components/ui/Button'
import { Input, Select, Field } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { PageSpinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate, initials, cn } from '@/lib/utils'
import type { User } from '@/types'

const inviteSchema = z.object({
  name:  z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  role:  z.enum(['admin', 'manager', 'technician']),
})
type InviteValues = z.infer<typeof inviteSchema>

export function UsersPage() {
  const [showInvite, setShowInvite] = useState(false)
  const [deactivateTarget, setDeactivateTarget] = useState<User | null>(null)

  const { data: usersData, isLoading } = useUsers()
  const inviteUser    = useInviteUser()
  const deactivateUser = useDeactivateUser()

  const users = usersData ?? []

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<InviteValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: 'technician' },
  })

  const onInvite = async (values: InviteValues) => {
    try {
      await inviteUser.mutateAsync(values)
      toast.success(`Invite sent to ${values.email}`)
      reset()
      setShowInvite(false)
    } catch {
      toast.error('Failed to send invite')
    }
  }

  const handleDeactivate = async () => {
    if (!deactivateTarget) return
    try {
      await deactivateUser.mutateAsync(deactivateTarget.id)
      toast.success('User deactivated')
    } catch {
      toast.error('Failed to deactivate user')
    }
    setDeactivateTarget(null)
  }

  if (isLoading) return <PageSpinner />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-af-muted">Team</p>
          <h1 className="text-2xl font-semibold tracking-[-0.015em] mt-0.5">Users</h1>
        </div>
        <Button variant="accent" size="sm" onClick={() => setShowInvite(true)}>
          <Plus size={13} className="mr-1" />Invite user
        </Button>
      </div>

      {users.length === 0 ? (
        <EmptyState
          icon={<Users size={28} />}
          title="No team members"
          description="Invite your team to start managing assets together."
          action={<Button variant="accent" size="sm" onClick={() => setShowInvite(true)}>+ Invite user</Button>}
        />
      ) : (
        <Table>
          <Thead>
            <tr>
              <Th>User</Th>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th>Joined</Th>
              <Th />
            </tr>
          </Thead>
          <Tbody>
            {users.length === 0
              ? <TdEmpty cols={6} message="No users" />
              : users.map(u => (
                <Tr key={u.id}>
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-[5px] bg-gradient-to-br from-af-orange-500 to-af-orange-600 flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0">
                        {initials(u.name)}
                      </div>
                      <span className="font-medium text-[13px]">{u.name}</span>
                    </div>
                  </Td>
                  <Td muted>{u.email}</Td>
                  <Td>
                    <span className="font-mono text-[10px] uppercase tracking-[0.06em] px-1.5 py-0.5 rounded-full bg-af-ink-100 text-af-muted">
                      {u.role}
                    </span>
                  </Td>
                  <Td>
                    <span className={cn(
                      'font-mono text-[10px] uppercase tracking-[0.06em] px-1.5 py-0.5 rounded-full',
                      u.active ? 'bg-af-ok-100 text-af-ok-600' : 'bg-af-ink-100 text-af-muted',
                    )}>
                      {u.active ? 'Active' : 'Inactive'}
                    </span>
                  </Td>
                  <Td muted>{formatDate(u.createdAt)}</Td>
                  <Td>
                    {u.active && (
                      <button
                        onClick={() => setDeactivateTarget(u)}
                        className="font-mono text-[10px] uppercase tracking-[0.06em] px-2 py-1 rounded border border-af-crit-200 hover:bg-af-crit-100 text-af-crit-600 transition-colors duration-[120ms]"
                      >
                        Deactivate
                      </button>
                    )}
                  </Td>
                </Tr>
              ))
            }
          </Tbody>
        </Table>
      )}

      {/* Invite modal */}
      <Modal
        open={showInvite}
        onClose={() => setShowInvite(false)}
        title="Invite user"
        description="An email will be sent with a link to set up their account."
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setShowInvite(false)}>Cancel</Button>
            <Button variant="accent" size="sm" onClick={handleSubmit(onInvite)} disabled={isSubmitting}>
              {isSubmitting ? 'Sending…' : 'Send invite'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Full name" required error={errors.name?.message}>
            <Input {...register('name')} placeholder="Jane Smith" />
          </Field>
          <Field label="Email address" required error={errors.email?.message}>
            <Input type="email" {...register('email')} placeholder="jane@company.com" />
          </Field>
          <Field label="Role" required error={errors.role?.message}>
            <Select {...register('role')}>
              <option value="technician">Technician</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </Select>
          </Field>
        </div>
      </Modal>

      {/* Deactivate confirm */}
      <Modal
        open={!!deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
        title="Deactivate user"
        description="This will prevent the user from logging in."
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setDeactivateTarget(null)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={handleDeactivate} disabled={deactivateUser.isPending}>
              {deactivateUser.isPending ? 'Deactivating…' : 'Deactivate'}
            </Button>
          </>
        }
      >
        <p className="text-[13px] text-af-fg">
          Deactivate <strong>{deactivateTarget?.name}</strong>? They will be signed out immediately.
        </p>
      </Modal>
    </div>
  )
}
