import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, post, put, del } from '@/lib/api'
import { QK } from '@/lib/queryKeys'
import type { Issue, PaginatedResponse } from '@/types'

interface IssueFilters {
  page?: number
  perPage?: number
  status?: string
  severity?: string
  assetId?: string
}

export function useIssues(filters?: IssueFilters) {
  return useQuery({
    queryKey: QK.issues(filters),
    queryFn: () => get<PaginatedResponse<Issue>>('/issues', filters),
  })
}

export function useIssue(id: string) {
  return useQuery({
    queryKey: [...QK.issues(), id],
    queryFn: () => get<Issue>(`/issues/${id}`),
    enabled: !!id,
  })
}

export function useCreateIssue() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      assetId: string
      title: string
      description: string
      severity?: string
      photoUrl?: string
    }) => post<Issue>('/issues', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.issues() }),
  })
}

export function useUpdateIssue(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      title?: string
      description?: string
      severity?: string
      status?: string
      resolution?: string
    }) => put<Issue>(`/issues/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...QK.issues(), id] })
      qc.invalidateQueries({ queryKey: QK.issues() })
    },
  })
}

export function useDeleteIssue() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => del(`/issues/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.issues() }),
  })
}
