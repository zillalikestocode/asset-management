import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, post, put, del } from '@/lib/api'
import { QK } from '@/lib/queryKeys'
import type { Asset, AssetHistory, PaginatedResponse } from '@/types'

interface AssetFilters {
  page?: number
  perPage?: number
  search?: string
  categoryId?: string
  locationId?: string
  status?: string
}

export function useAssets(filters?: AssetFilters) {
  return useQuery({
    queryKey: QK.assets(filters),
    queryFn: () => get<PaginatedResponse<Asset>>('/assets', filters),
  })
}

export function useAsset(id: string) {
  return useQuery({
    queryKey: QK.asset(id),
    queryFn: () => get<Asset>(`/assets/${id}`),
    enabled: !!id,
  })
}

export function useAssetHistory(id: string) {
  return useQuery({
    queryKey: QK.assetHistory(id),
    queryFn: () => get<AssetHistory[]>(`/assets/${id}/history`),
    enabled: !!id,
  })
}

export function useCreateAsset() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Asset>) => post<Asset>('/assets', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.assets() }),
  })
}

export function useUpdateAsset(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Asset>) => put<Asset>(`/assets/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.asset(id) })
      qc.invalidateQueries({ queryKey: QK.assets() })
    },
  })
}

export function useArchiveAsset() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => del(`/assets/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.assets() }),
  })
}

export function useRecordLocation(assetId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (coords: { lat: number; lng: number }) =>
      post(`/assets/${assetId}/location`, coords),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.asset(assetId) }),
  })
}
