import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, post, put, del } from '@/lib/api'
import { QK } from '@/lib/queryKeys'
import type { WorkOrder, WorkOrderComment, WorkOrderPhoto, PaginatedResponse } from '@/types'

interface WOFilters {
  page?: number
  perPage?: number
  status?: string
  priority?: string
  assignedToId?: string
  assetId?: string
  from?: string
  to?: string
}

export function useWorkOrders(filters?: WOFilters) {
  return useQuery({
    queryKey: QK.workOrders(filters),
    queryFn: () => get<PaginatedResponse<WorkOrder>>('/work-orders', filters),
  })
}

export function useWorkOrder(id: string) {
  return useQuery({
    queryKey: QK.workOrder(id),
    queryFn: () => get<WorkOrder>(`/work-orders/${id}`),
    enabled: !!id,
  })
}

export function useCreateWorkOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      title: string
      assetId: string
      description?: string
      priority?: string
      assignedToId?: string
      dueDate?: string
      estimatedHours?: number
    }) => post<WorkOrder>('/work-orders', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.workOrders() }),
  })
}

export function useUpdateWorkOrder(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      title?: string
      description?: string
      priority?: string
      status?: string
      assignedToId?: string
      dueDate?: string
      estimatedHours?: number
      actualHours?: number
      completionNotes?: string
    }) => put<WorkOrder>(`/work-orders/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.workOrder(id) })
      qc.invalidateQueries({ queryKey: QK.workOrders() })
    },
  })
}

// Convenience wrapper — completes a work order via the standard update endpoint
export function useCompleteWorkOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, notes, actualHours }: { id: string; notes?: string; actualHours?: number }) =>
      put<WorkOrder>(`/work-orders/${id}`, {
        status: 'completed',
        completionNotes: notes,
        actualHours,
      }),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: QK.workOrder(id) })
      qc.invalidateQueries({ queryKey: QK.workOrders() })
    },
  })
}

export function useDeleteWorkOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => del(`/work-orders/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.workOrders() }),
  })
}

export function useListComments(workOrderId: string) {
  return useQuery({
    queryKey: [...QK.workOrder(workOrderId), 'comments'],
    queryFn: () => get<WorkOrderComment[]>(`/work-orders/${workOrderId}/comments`),
    enabled: !!workOrderId,
  })
}

export function useAddComment(workOrderId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: string) =>
      post<WorkOrderComment>(`/work-orders/${workOrderId}/comments`, { body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.workOrder(workOrderId) }),
  })
}

export function useAddPhoto(workOrderId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { url: string; filename: string }) =>
      post<WorkOrderPhoto>(`/work-orders/${workOrderId}/photos`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.workOrder(workOrderId) }),
  })
}

export function useDeletePhoto(workOrderId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (photoId: string) =>
      del(`/work-orders/${workOrderId}/photos/${photoId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.workOrder(workOrderId) }),
  })
}
