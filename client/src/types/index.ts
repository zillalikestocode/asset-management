// ── Auth ──────────────────────────────────────────────────
export type Role = 'admin' | 'manager' | 'technician'

export interface User {
  id: string
  orgId: string
  name: string
  email: string
  role: Role
  active: boolean
  avatarUrl?: string
  createdAt?: string
}

// Backend /auth/me returns orgId but not orgName
export interface AuthUser extends User {
  orgName?: string
}

// ── Organisation ──────────────────────────────────────────
export interface Org {
  id: string
  name: string
  industry: string
  plan: 'starter' | 'pro' | 'enterprise'
  seatsUsed: number
  seatsTotal: number
}

// ── Location / Category ───────────────────────────────────
export interface Location {
  id: string
  orgId?: string
  name: string
  parentId?: string
  createdAt?: string
}

export interface Category {
  id: string
  orgId?: string
  name: string
  color?: string
  createdAt?: string
}

// ── Assets ────────────────────────────────────────────────
export type AssetStatus = 'active' | 'inactive' | 'maintenance' | 'retired'

export interface Asset {
  id: string
  orgId: string
  assetCode: string
  name: string
  description?: string
  model?: string
  manufacturer?: string
  serialNumber?: string
  status: AssetStatus
  customFields?: Record<string, unknown>
  categoryId?: string
  category?: Category
  locationId?: string
  location?: Location
  assignedUserId?: string
  assignedUser?: User
  purchaseCost?: number
  purchaseDate?: string
  lastLat?: number
  lastLong?: number
  lastLocationAt?: string
  createdAt: string
  updatedAt: string
}

export interface AssetHistory {
  id: string
  assetId: string
  field: string
  oldValue?: string
  newValue: string
  changedBy: string
  changedAt: string
}

// ── Maintenance ───────────────────────────────────────────
export type ScheduleType = 'time_based' | 'usage_based'
export type Priority = 'low' | 'medium' | 'high' | 'critical'

export interface MaintenanceSchedule {
  id: string
  orgId: string
  name: string
  description?: string
  taskType: string
  scheduleType: ScheduleType
  priority: Priority
  intervalDays?: number
  intervalHours?: number
  leadTimeDays: number
  estimatedHours?: number
  assetId?: string
  asset?: Asset
  categoryId?: string
  defaultAssigneeId?: string
  defaultAssignee?: User
  active: boolean
  lastTriggeredAt?: string
  nextDueAt?: string
  createdAt: string
  updatedAt: string
}

// ── Work Orders ───────────────────────────────────────────
export type WorkOrderStatus = 'open' | 'in_progress' | 'completed' | 'cancelled'
export type WorkOrderType = 'scheduled' | 'manual'

export interface WorkOrderPhoto {
  id: string
  url: string
  filename: string
  createdAt: string
}

export interface WorkOrderComment {
  id: string
  authorId: string
  author: string
  body: string
  createdAt: string
}

export interface WorkOrder {
  id: string
  orgId: string
  title: string
  description?: string
  priority: Priority
  status: WorkOrderStatus
  type: WorkOrderType
  assetId: string
  asset?: Asset
  assignedToId?: string
  assignedTo?: User
  createdById: string
  createdBy?: User
  maintenanceScheduleId?: string
  dueDate?: string
  completedAt?: string
  estimatedHours?: number
  actualHours?: number
  completionNotes?: string
  photos?: WorkOrderPhoto[]
  comments?: WorkOrderComment[]
  createdAt: string
  updatedAt: string
}

// ── Issues ────────────────────────────────────────────────
export type IssueSeverity = 'low' | 'medium' | 'critical'
export type IssueStatus = 'open' | 'acknowledged' | 'resolved'

export interface Issue {
  id: string
  orgId: string
  assetId: string
  asset?: Asset
  reportedById: string
  reportedBy?: User
  title: string
  description: string
  severity: IssueSeverity
  status: IssueStatus
  photoUrl?: string
  resolvedById?: string
  resolvedBy?: User
  resolvedAt?: string
  resolution?: string
  createdAt: string
  updatedAt: string
}

// ── Notifications ─────────────────────────────────────────
export type NotificationEventType =
  | 'maintenance_due'
  | 'work_order_overdue'
  | 'critical_issue'
  | 'work_order_assigned'
  | 'asset_status_changed'

export interface Notification {
  id: string
  eventType: NotificationEventType
  title: string
  body: string
  refType?: string
  refId?: string
  read: boolean
  readAt?: string
  createdAt: string
}

export interface NotificationPreference {
  id: string
  eventType: NotificationEventType
  inApp: boolean
  email: boolean
}

// ── Reports ───────────────────────────────────────────────
export interface MaintenanceCompletionReport {
  period: string
  total: number
  completed: number
  overdue: number
  completionRate: number
}

export interface AssetDowntimeReport {
  assetId: string
  assetCode: string
  assetName: string
  downtimeHours: number
  incidents: number
}

export interface WorkOrderHistoryReport {
  period: string
  total: number
  completed: number
  cancelled: number
  avgResolutionHours: number
}

export interface AssetInventoryReport {
  total: number
  active: number
  inactive: number
  maintenance: number
  retired: number
  byCategory: { categoryName: string; count: number }[]
}

// ── API helpers ───────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  perPage: number
}

export interface ApiError {
  message: string
  code?: string
  fields?: Record<string, string>
}
