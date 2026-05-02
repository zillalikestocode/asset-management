import { useQuery } from '@tanstack/react-query'
import { get } from '@/lib/api'
import { QK } from '@/lib/queryKeys'
import type {
  MaintenanceCompletionReport,
  AssetDowntimeReport,
  WorkOrderHistoryReport,
  AssetInventoryReport,
} from '@/types'

interface DateRangeParams {
  from?: string
  to?: string
}

export function useMaintenanceCompletionReport(params?: DateRangeParams) {
  return useQuery({
    queryKey: QK.reports.maintenanceCompletion(params),
    queryFn: () => get<MaintenanceCompletionReport[]>('/reports/maintenance-completion', params),
  })
}

export function useAssetDowntimeReport(params?: DateRangeParams) {
  return useQuery({
    queryKey: QK.reports.assetDowntime(params),
    queryFn: () => get<AssetDowntimeReport[]>('/reports/asset-downtime', params),
  })
}

export function useWorkOrderHistoryReport(params?: DateRangeParams) {
  return useQuery({
    queryKey: QK.reports.workOrderHistory(params),
    queryFn: () => get<WorkOrderHistoryReport[]>('/reports/work-order-history', params),
  })
}

export function useAssetInventoryReport() {
  return useQuery({
    queryKey: ['reports', 'assetInventory'],
    queryFn: () => get<AssetInventoryReport>('/reports/asset-inventory'),
  })
}
