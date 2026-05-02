import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, post, put, del } from '@/lib/api'
import { QK } from '@/lib/queryKeys'
import type { MaintenanceSchedule } from '@/types'

export function useSchedules(params?: object) {
  return useQuery({
    queryKey: QK.schedules(params),
    queryFn: () => get<MaintenanceSchedule[]>('/maintenance/schedules', params),
  })
}

export function useSchedule(id: string) {
  return useQuery({
    queryKey: QK.schedule(id),
    queryFn: () => get<MaintenanceSchedule>(`/maintenance/schedules/${id}`),
    enabled: !!id,
  })
}

export function useCreateSchedule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<MaintenanceSchedule>) =>
      post<MaintenanceSchedule>('/maintenance/schedules', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.schedules() }),
  })
}

export function useUpdateSchedule(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<MaintenanceSchedule>) =>
      put<MaintenanceSchedule>(`/maintenance/schedules/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.schedule(id) })
      qc.invalidateQueries({ queryKey: QK.schedules() })
    },
  })
}

export function useDeleteSchedule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => del(`/maintenance/schedules/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.schedules() }),
  })
}
