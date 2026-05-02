import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, put, del } from '@/lib/api'
import { QK } from '@/lib/queryKeys'
import type { Notification, NotificationPreference } from '@/types'

export function useNotifications() {
  return useQuery({
    queryKey: QK.notifications(),
    queryFn: () => get<Notification[]>('/notifications'),
    refetchInterval: 30_000,
  })
}

export function useUnreadNotifications() {
  return useQuery({
    queryKey: [...QK.notifications(), 'unread'],
    queryFn: () => get<Notification[]>('/notifications/unread'),
    refetchInterval: 30_000,
  })
}

export function useMarkRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => put(`/notifications/${id}/read`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.notifications() }),
  })
}

export function useMarkAllRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => put('/notifications/read-all', {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.notifications() }),
  })
}

export function useDeleteNotification() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => del(`/notifications/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.notifications() }),
  })
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ['notification-preferences'],
    queryFn: () => get<NotificationPreference[]>('/notification-preferences'),
  })
}

export function useUpsertNotificationPreference() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { eventType: string; inApp: boolean; email: boolean }) =>
      put<NotificationPreference>('/notification-preferences', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notification-preferences'] }),
  })
}
