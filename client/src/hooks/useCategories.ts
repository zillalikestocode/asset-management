import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, post, put, del } from '@/lib/api'
import { QK } from '@/lib/queryKeys'
import type { Category, Location } from '@/types'

export function useCategories() {
  return useQuery({
    queryKey: QK.categories(),
    queryFn: () => get<Category[]>('/categories'),
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; color?: string }) =>
      post<Category>('/categories', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.categories() }),
  })
}

export function useUpdateCategory(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name?: string; color?: string }) =>
      put<Category>(`/categories/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.categories() }),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => del(`/categories/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.categories() }),
  })
}

export function useLocations() {
  return useQuery({
    queryKey: QK.locations(),
    queryFn: () => get<Location[]>('/locations'),
  })
}

export function useCreateLocation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; parentId?: string }) =>
      post<Location>('/locations', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.locations() }),
  })
}

export function useUpdateLocation(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name?: string; parentId?: string }) =>
      put<Location>(`/locations/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.locations() }),
  })
}

export function useDeleteLocation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => del(`/locations/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.locations() }),
  })
}
