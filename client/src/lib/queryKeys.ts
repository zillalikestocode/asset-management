// Centralised query key factory — prevents typo bugs across hooks
export const QK = {
  me:           () => ['me'] as const,
  users:        () => ['users'] as const,
  user:         (id: string) => ['users', id] as const,

  assets:       (params?: object) => params ? ['assets', params] : ['assets'] as const,
  asset:        (id: string) => ['assets', id] as const,
  assetHistory: (id: string) => ['assets', id, 'history'] as const,

  categories:   () => ['categories'] as const,
  locations:    () => ['locations'] as const,

  schedules:    (params?: object) => params ? ['schedules', params] : ['schedules'] as const,
  schedule:     (id: string) => ['schedules', id] as const,

  workOrders:   (params?: object) => params ? ['workOrders', params] : ['workOrders'] as const,
  workOrder:    (id: string) => ['workOrders', id] as const,

  issues:       (params?: object) => params ? ['issues', params] : ['issues'] as const,

  notifications: () => ['notifications'] as const,

  reports: {
    maintenanceCompletion: (params?: object) => ['reports', 'maintenanceCompletion', params] as const,
    assetDowntime:         (params?: object) => ['reports', 'assetDowntime', params] as const,
    workOrderHistory:      (params?: object) => ['reports', 'workOrderHistory', params] as const,
  },
}
