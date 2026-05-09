import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, post, put } from '@/lib/api'
import { QK } from '@/lib/queryKeys'
import type { User } from '@/types'

export function useUsers() {
  return useQuery({
    queryKey: QK.users(),
    queryFn: () => get<User[]>('/users'),
  })
}

export function useInviteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; email: string; role: string; locationIds?: string[] }) =>
      post('/users/invite', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.users() }),
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      post('/auth/change-password', data),
  })
}

export function useUpdateUser(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<User>) => put<User>(`/users/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.users() }),
  })
}

export function useDeactivateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => put(`/users/${id}`, { active: false }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.users() }),
  })
}
