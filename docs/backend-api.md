# AssetFlow Backend API Reference

This document covers every API endpoint the Go server needs to implement, what each one does, and the full database schema. All endpoints are prefixed with `/api`. All protected endpoints require a `Authorization: Bearer <token>` header.

---

## Database Models

### `orgs`

Represents a customer organisation (tenant). All data is scoped to an org.

```sql
CREATE TABLE orgs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  industry   TEXT NOT NULL,
  plan       TEXT NOT NULL DEFAULT 'starter',  -- starter | pro | enterprise
  seats_total INT NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### `users`

A person who can log in. Belongs to one org. Role controls which UI shell they see.

```sql
CREATE TABLE users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'technician',  -- admin | manager | technician
  active     BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON users(org_id);
CREATE INDEX ON users(email);
```

---

### `categories`

User-defined labels for grouping assets (e.g. "Machinery", "Vehicles", "IT Equipment").

```sql
CREATE TABLE categories (
  id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name   TEXT NOT NULL,
  color  TEXT,  -- optional hex color for UI
  UNIQUE (org_id, name)
);
```

---

### `locations`

Physical places where assets live (e.g. "Building A – Floor 2", "Warehouse B").

```sql
CREATE TABLE locations (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id    UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name      TEXT NOT NULL,
  parent_id UUID REFERENCES locations(id),  -- for nesting
  UNIQUE (org_id, name)
);
```

---

### `assets`

The core record. One row per physical asset being tracked.

```sql
CREATE TABLE assets (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id           UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  asset_code       TEXT NOT NULL,        -- auto-generated, e.g. AF-0042
  name             TEXT NOT NULL,
  category_id      UUID REFERENCES categories(id),
  location_id      UUID REFERENCES locations(id),
  serial_number    TEXT,
  manufacturer     TEXT,
  model            TEXT,
  purchase_date    DATE,
  purchase_cost    NUMERIC(12, 2),
  warranty_expiry  DATE,
  assigned_user_id UUID REFERENCES users(id),
  status           TEXT NOT NULL DEFAULT 'active',  -- active | inactive | maintenance | retired
  custom_fields    JSONB,                -- arbitrary key-value pairs set by the org
  last_lat         NUMERIC(10, 7),
  last_lng         NUMERIC(10, 7),
  last_location_at TIMESTAMPTZ,
  archived_at      TIMESTAMPTZ,          -- soft delete; NULL = not archived
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, asset_code)
);

CREATE INDEX ON assets(org_id);
CREATE INDEX ON assets(status);
CREATE INDEX ON assets(category_id);
CREATE INDEX ON assets(location_id);
```

**`asset_code` generation:** On insert, the server reads the current max numeric suffix for the org and increments it, e.g. `AF-0001`, `AF-0002`. Use a transaction to avoid races.

---

### `asset_history`

Immutable audit log of every field change on an asset.

```sql
CREATE TABLE asset_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id    UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  field       TEXT NOT NULL,        -- name of the changed field
  old_value   TEXT,
  new_value   TEXT NOT NULL,
  changed_by  UUID NOT NULL REFERENCES users(id),
  changed_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON asset_history(asset_id);
```

**How to populate:** After any `UPDATE assets` call, diff the old and new values in Go and insert one row per changed field.

---

### `maintenance_schedules`

Defines a recurring maintenance rule for an asset. The scheduler generates work orders from this.

```sql
CREATE TABLE maintenance_schedules (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                 UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  asset_id               UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  name                   TEXT NOT NULL,
  description            TEXT,
  type                   TEXT NOT NULL,   -- time | usage
  interval               TEXT,            -- daily | weekly | monthly | custom  (for type=time)
  interval_days          INT,             -- for type=time AND interval=custom
  usage_hours_threshold  INT,             -- for type=usage
  lead_time_days         INT NOT NULL DEFAULT 1,
  default_assignee_id    UUID REFERENCES users(id),
  priority               TEXT NOT NULL DEFAULT 'medium',  -- low | medium | high | critical
  active                 BOOLEAN NOT NULL DEFAULT true,
  next_due_date          DATE,            -- computed and updated by the scheduler
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON maintenance_schedules(org_id);
CREATE INDEX ON maintenance_schedules(asset_id);
CREATE INDEX ON maintenance_schedules(next_due_date);
```

**Scheduler logic (run daily as a cron job or background goroutine):**
1. Select all `active = true` schedules where `next_due_date <= now() + lead_time_days`.
2. For each, check whether an open/in-progress work order already exists for this schedule (avoid duplicates).
3. If not, create a work order with `schedule_id` set.
4. Advance `next_due_date` based on the interval.

---

### `work_orders`

A task assigned to a technician to maintain or repair an asset.

```sql
CREATE TABLE work_orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id           UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  work_order_code  TEXT NOT NULL,         -- e.g. WO-2174, auto-generated per org
  title            TEXT NOT NULL,
  asset_id         UUID NOT NULL REFERENCES assets(id),
  schedule_id      UUID REFERENCES maintenance_schedules(id),  -- NULL if created manually
  assignee_id      UUID REFERENCES users(id),
  created_by_id    UUID NOT NULL REFERENCES users(id),
  due_date         TIMESTAMPTZ NOT NULL,
  priority         TEXT NOT NULL DEFAULT 'medium',   -- low | medium | high | critical
  status           TEXT NOT NULL DEFAULT 'open',     -- open | in_progress | completed | cancelled
  description      TEXT,
  estimated_hours  NUMERIC(6, 2),
  actual_hours     NUMERIC(6, 2),
  completion_notes TEXT,
  completed_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, work_order_code)
);

CREATE INDEX ON work_orders(org_id);
CREATE INDEX ON work_orders(status);
CREATE INDEX ON work_orders(assignee_id);
CREATE INDEX ON work_orders(asset_id);
CREATE INDEX ON work_orders(due_date);
```

**`work_order_code` generation:** Same approach as `asset_code`, e.g. `WO-0001`.

**Side effects when status → `completed`:**
- Set `completed_at = now()`.
- If `schedule_id` is set, advance the parent schedule's `next_due_date`.
- If `asset_id.status == 'maintenance'`, consider setting it back to `'active'` (business rule — can be optional).

---

### `work_order_comments`

Free-text log entries on a work order. Written by technicians or managers.

```sql
CREATE TABLE work_order_comments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id  UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  author_id      UUID NOT NULL REFERENCES users(id),
  body           TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON work_order_comments(work_order_id);
```

---

### `work_order_attachments`

Files uploaded against a work order (photos, PDFs, inspection reports).

```sql
CREATE TABLE work_order_attachments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id  UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,          -- original filename
  url            TEXT NOT NULL,          -- storage URL (S3, GCS, local)
  size_bytes     BIGINT NOT NULL,
  uploaded_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON work_order_attachments(work_order_id);
```

---

### `issues`

Fault reports submitted by technicians from the mobile app. Can trigger a work order.

```sql
CREATE TABLE issues (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  asset_id        UUID NOT NULL REFERENCES assets(id),
  reported_by_id  UUID NOT NULL REFERENCES users(id),
  severity        TEXT NOT NULL DEFAULT 'medium',  -- low | medium | critical
  status          TEXT NOT NULL DEFAULT 'open',    -- open | acknowledged | resolved
  description     TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON issues(org_id);
CREATE INDEX ON issues(asset_id);
CREATE INDEX ON issues(status);
```

---

### `issue_attachments`

Photos or files attached to an issue report.

```sql
CREATE TABLE issue_attachments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id    UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  name        TEXT NOT NULL,
  size_bytes  BIGINT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### `notifications`

In-app notifications for users. Created by server-side events (overdue WO, new assignment, critical issue).

```sql
CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,   -- maintenance_due | work_order_overdue | critical_issue | work_order_assigned | asset_status_changed
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  link       TEXT,            -- optional deep-link, e.g. /work-orders/abc
  read       BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON notifications(user_id, read);
```

**When to create notifications:**
- `work_order_assigned` — when `assignee_id` is set or changed on a work order.
- `work_order_overdue` — daily job: find open WOs past `due_date` and notify the assignee.
- `maintenance_due` — when the scheduler generates a new work order from a schedule.
- `critical_issue` — when an issue with `severity = 'critical'` is created; notify all admins/managers.
- `asset_status_changed` — when an asset's `status` field changes.

---

## API Endpoints

### Authentication

#### `POST /api/auth/login`
Validates email + password, returns a signed JWT and the user profile.

**Request body:**
```json
{ "email": "admin@acme.com", "password": "secret" }
```

**Response `200`:**
```json
{
  "token": "<jwt>",
  "user": {
    "id": "uuid",
    "orgId": "uuid",
    "orgName": "Acme Corp",
    "name": "Alice",
    "email": "admin@acme.com",
    "role": "admin"
  }
}
```

**Errors:** `401` wrong credentials · `403` account deactivated

---

#### `POST /api/auth/logout`
Optional server-side token invalidation (add token to a deny-list / delete refresh token).

---

#### `GET /api/auth/me`
Returns the currently authenticated user. Useful for hydrating the client after a page refresh.

**Response `200`:** Same shape as the `user` object in `/login`.

---

#### `POST /api/auth/refresh`
Issues a new short-lived access token using a long-lived refresh token.

---

### Onboarding

#### `POST /api/onboarding`
Creates a new org and its first admin user in a single transaction. Called from the onboarding wizard on first sign-up.

**Request body:**
```json
{
  "orgName": "Acme Corp",
  "industry": "Manufacturing",
  "adminName": "Alice",
  "adminEmail": "alice@acme.com",
  "password": "secret",
  "firstAsset": {
    "name": "CNC Mill A1",
    "categoryName": "Machinery",
    "locationName": "Shop Floor"
  }
}
```

**Response `201`:** Same as `/auth/login` — token + user so the client can immediately redirect to the dashboard.

---

### Users

#### `GET /api/users`
Lists all users in the caller's org.

**Response `200`:** `User[]`

---

#### `POST /api/users/invite`
Sends an invitation email with a one-time signup link. Creates a placeholder user row with `active = false`.

**Request body:**
```json
{ "name": "Bob", "email": "bob@acme.com", "role": "technician" }
```

**Response `201`:** `User`

---

#### `GET /api/users/:id`
Returns a single user. Must belong to the caller's org.

---

#### `PUT /api/users/:id`
Updates name, role, or active status. Admins only.

**Request body:** Partial `{ name?, role?, active? }`

---

### Categories

#### `GET /api/categories`
Returns all categories for the caller's org.

**Response `200`:** `Category[]`

---

#### `POST /api/categories`
Creates a new category.

**Request body:** `{ "name": "Machinery", "color"?: "#FF6B35" }`

**Response `201`:** `Category`

---

#### `DELETE /api/categories/:id`
Deletes the category. If any assets still reference it, either set their `category_id` to NULL or return a `409 Conflict`.

---

### Locations

#### `GET /api/locations`
Returns all locations for the caller's org.

**Response `200`:** `Location[]`

---

#### `POST /api/locations`
Creates a new location.

**Request body:** `{ "name": "Warehouse B", "parentId"?: "uuid" }`

**Response `201`:** `Location`

---

#### `DELETE /api/locations/:id`
Deletes the location. Same nullification / conflict logic as categories.

---

### Assets

#### `GET /api/assets`
Paginated, filterable asset list for the org.

**Query params:**

| Param | Type | Description |
|-------|------|-------------|
| `page` | int | Page number, default `1` |
| `perPage` | int | Results per page, default `20`, max `999` |
| `search` | string | Full-text search on `name`, `asset_code`, `serial_number` |
| `categoryId` | uuid | Filter by category |
| `locationId` | uuid | Filter by location |
| `status` | string | Filter by status |

**Response `200`:**
```json
{
  "data": [ Asset ],
  "total": 142,
  "page": 1,
  "perPage": 20
}
```

Each `Asset` object includes nested `category`, `location`, and `assignedUser` (name only).

---

#### `POST /api/assets`
Creates a new asset. Auto-generates `asset_code`.

**Request body:** All asset fields except `id`, `assetCode`, `createdAt`, `updatedAt`.

**Response `201`:** Full `Asset` object.

---

#### `GET /api/assets/:id`
Returns a single asset with all relations: `category`, `location`, `assignedUser`, and `lastLocation` (lat/lng/recordedAt).

---

#### `PUT /api/assets/:id`
Updates any asset fields. After updating, write a row to `asset_history` for each changed field.

**Response `200`:** Updated `Asset`.

---

#### `DELETE /api/assets/:id`
Soft-deletes by setting `archived_at = now()`. Does not destroy the row. Archived assets should be excluded from list queries by default.

---

#### `GET /api/assets/:id/history`
Returns the full audit trail for an asset, newest first.

**Response `200`:** `AssetHistory[]` — each entry has `field`, `oldValue`, `newValue`, `changedBy` (user object), `changedAt`.

---

#### `POST /api/assets/:id/location`
Records a GPS coordinate for the asset. Updates `last_lat`, `last_lng`, `last_location_at` on the asset row.

**Request body:** `{ "lat": 6.5244, "lng": 3.3792 }`

**Response `200`:** `{ "lat": 6.5244, "lng": 3.3792, "recordedAt": "2026-04-26T10:00:00Z" }`

---

#### `GET /api/assets/:id/qr`
Generates a QR code PNG that encodes the URL `/tech/assets/:id`. Returns the image with `Content-Type: image/png`.

Use the [`skip2/go-qrcode`](https://github.com/skip2/go-qrcode) library or similar.

---

#### `POST /api/assets/:id/issues`
Creates a new issue report linked to this asset. Used by the technician mobile app.

**Request body:** `{ "severity": "medium", "description": "Grinding noise from spindle" }`

**Response `201`:** `Issue`

**Side effect:** If `severity == "critical"`, create `critical_issue` notifications for all admin/manager users in the org.

---

### Work Orders

#### `GET /api/work-orders`
Paginated, filterable work order list.

**Query params:**

| Param | Type | Description |
|-------|------|-------------|
| `page` | int | Page number |
| `perPage` | int | Results per page |
| `status` | string | Filter: `open`, `in_progress`, `completed`, `cancelled` |
| `priority` | string | Filter: `low`, `medium`, `high`, `critical` |
| `assigneeId` | uuid | Filter by technician |
| `assetId` | uuid | Filter by asset |
| `from` | date | Filter `due_date >= from` |
| `to` | date | Filter `due_date <= to` |

**Response `200`:** Paginated `WorkOrder[]`. Each item includes nested `asset` (code + name) and `assignee` (name).

---

#### `POST /api/work-orders`
Creates a work order manually. Auto-generates `work_order_code`.

**Request body:** `title`, `assetId`, `priority`, `status`, `dueDate`, `assigneeId?`, `estimatedHours?`, `description?`

**Response `201`:** Full `WorkOrder`.

**Side effect:** If `assigneeId` is set, create a `work_order_assigned` notification for the assignee.

---

#### `GET /api/work-orders/:id`
Returns a full work order including:
- `asset` (full object)
- `assignee` (user)
- `createdBy` (user)
- `comments` (array, sorted oldest-first, each with `author`)
- `attachments` (array)

---

#### `PUT /api/work-orders/:id`
Updates any fields on the work order.

**Side effect:** If `assigneeId` changes, notify the new assignee.

---

#### `POST /api/work-orders/:id/complete`
Marks the work order as completed.

**Request body:** `{ "notes"?: "Replaced belt", "actualHours"?: 2.5 }`

**Side effects:**
- Sets `status = 'completed'`, `completed_at = now()`.
- Stores `completionNotes` and `actualHours`.
- If linked to a `schedule_id`, advances the schedule's `next_due_date`.

---

#### `POST /api/work-orders/:id/comments`
Appends a comment to the work order.

**Request body:** `{ "body": "Ordered replacement part, ETA Friday." }`

**Response `201`:** `Comment` — `{ id, body, author: { id, name }, createdAt }`

---

#### `POST /api/work-orders/:id/attachments`
Accepts a `multipart/form-data` upload with a `file` field. Stores the file (local disk or object storage) and records a row in `work_order_attachments`.

**Response `201`:** `Attachment` — `{ id, name, url, sizeBytes, uploadedAt }`

---

### Maintenance Schedules

#### `GET /api/maintenance/schedules`
Returns all maintenance schedules for the org.

**Query params:** `assetId` — filter to schedules for a specific asset.

**Response `200`:** `MaintenanceSchedule[]`, each with nested `asset` (code + name) and `defaultAssignee` (name).

---

#### `POST /api/maintenance/schedules`
Creates a new maintenance schedule.

**Request body:** `name`, `assetId`, `type`, `interval?`, `intervalDays?`, `usageHoursThreshold?`, `leadTimeDays`, `priority`, `defaultAssigneeId?`, `description?`, `active`

After creation, compute and set `next_due_date` immediately:
- For `type=time`: add the interval (days/weeks/months) to `now()`.
- For `type=usage`: leave NULL until the asset reports usage data.

**Response `201`:** `MaintenanceSchedule`

---

#### `GET /api/maintenance/schedules/:id`
Returns a single schedule with full relations.

---

#### `PUT /api/maintenance/schedules/:id`
Updates the schedule. Recompute `next_due_date` if interval fields change.

---

#### `DELETE /api/maintenance/schedules/:id`
Deletes the schedule permanently. Existing work orders generated from it remain; they just lose the `schedule_id` FK (set to NULL via `ON DELETE SET NULL` if preferred, or leave as-is with `ON DELETE RESTRICT` and handle in Go).

---

### Issues

#### `GET /api/issues`
Returns issues for the org, optionally filtered.

**Query params:** `assetId`, `status` (`open` / `acknowledged` / `resolved`)

**Response `200`:** `Issue[]` with nested `asset` (code + name) and `reportedBy` (name).

---

#### `GET /api/issues/:id`
Returns a single issue with all relations and attachments.

---

#### `PUT /api/issues/:id`
Updates severity or status. An admin/manager acknowledging or resolving the issue.

**Request body:** `{ "status"?: "acknowledged", "severity"?: "low" }`

---

### Notifications

#### `GET /api/notifications`
Returns all notifications for the currently authenticated user, newest first.

**Response `200`:** `Notification[]`

The frontend polls this every 30 seconds to show the bell badge.

---

#### `PUT /api/notifications/:id/read`
Marks a single notification as read.

**Response `200`:** `{ "ok": true }`

---

#### `PUT /api/notifications/read-all`
Marks every unread notification for the current user as read.

**Response `200`:** `{ "ok": true }`

---

### Reports

These endpoints aggregate data on the fly — no separate report table needed.

#### `GET /api/reports/maintenance-completion`
Returns maintenance completion stats grouped by month.

**Query params:** `from`, `to` (ISO date strings)

**Response `200`:**
```json
[
  {
    "period": "2026-03",
    "total": 12,
    "completed": 9,
    "overdue": 2,
    "completionRate": 75
  }
]
```

---

#### `GET /api/reports/asset-downtime`
Returns total downtime hours per asset (time spent with `status = 'maintenance'`). Requires an `asset_status_log` table or can be approximated from `asset_history` where `field = 'status'`.

**Response `200`:**
```json
[
  {
    "assetId": "uuid",
    "assetCode": "AF-0042",
    "assetName": "CNC Mill A3",
    "downtimeHours": 14.5,
    "incidents": 3
  }
]
```

---

## HTTP Status Code Conventions

| Code | When to use |
|------|-------------|
| `200` | Successful GET or PUT |
| `201` | Successful POST (resource created) |
| `204` | Successful DELETE (no body) |
| `400` | Validation error — return `{ "message": "...", "fields": { "name": "required" } }` |
| `401` | Missing or invalid token |
| `403` | Valid token but insufficient role |
| `404` | Resource not found or belongs to a different org |
| `409` | Conflict (e.g. duplicate asset code, category in use) |
| `500` | Unexpected server error |

---

## Auth Middleware

All routes except `/api/auth/login`, `/api/auth/refresh`, and `/api/onboarding` require a valid JWT. The middleware should:

1. Extract the `Authorization: Bearer <token>` header.
2. Validate the JWT signature and expiry.
3. Load the `user` row and attach it to the request context.
4. Reject with `401` if the token is missing/invalid or the user is `active = false`.

Role checks (admin-only routes) should be a separate middleware or guard applied per-router-group.

---

## Multi-Tenancy Rule

Every database query **must** include an `org_id = ctx.User.OrgID` filter. Never trust a resource ID from the URL alone — always confirm it belongs to the authenticated user's org before returning or mutating it.
