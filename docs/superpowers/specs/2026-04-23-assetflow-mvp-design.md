# AssetFlow MVP — Product Requirements Document

**Version:** 1.0  
**Date:** April 23, 2026  
**Author:** Product Team  
**Status:** Draft  

---

## Section 1: Executive Summary

### Problem Statement

Manufacturing SMEs (10–500 employees) are losing money to unplanned equipment downtime, lost tools, and missed maintenance windows. Most track assets via spreadsheets or paper-based systems. Enterprise solutions like IBM Maximo and SAP are too expensive, too complex, and too slow to implement for this segment.

### Solution

AssetFlow is a SaaS asset management platform built specifically for manufacturing SMEs. It combines asset inventory tracking and preventive maintenance scheduling in a single, easy-to-use web and mobile PWA — no installation required, no IT team needed.

### Market Opportunity

- Global asset management system market: **$32.2 billion by 2028** (CAGR 10.1% — Grand View Research)
- Manufacturing is the highest-demand vertical for physical asset management
- Existing tools are either too expensive (enterprise) or too generic (general SME tools)
- Target addressable market: ~2.5M manufacturing SMEs in North America + Europe

### Business Model Summary

- Per-seat SaaS subscription (Starter and Pro tiers)
- Enterprise plan sold via direct sales
- Revenue model: Monthly Recurring Revenue (MRR) with annual contract option for enterprise

---

## Section 2: Product Vision & Goals

### Vision Statement

> "Give every manufacturing team the visibility and control over their physical assets that only large enterprises could afford before — at a price any SME can justify."

### MVP Objectives

1. Allow any manufacturing SME to register, tag, and track all physical assets in under one hour
2. Enable technicians to scan assets in the field and log maintenance work from their phone
3. Give managers a live dashboard to monitor asset health and upcoming maintenance
4. Automate maintenance reminders to prevent unplanned downtime

### Success Metrics (6 months post-launch)

| Metric | Target |
|--------|--------|
| Monthly Active Customers | 50 paying businesses |
| Average Seats per Customer | 8 users |
| Monthly Recurring Revenue | $25,000 MRR |
| Churn Rate | < 5% monthly |
| Asset Scan Actions per Day | 500+ across all customers |
| Maintenance Tasks Completed On-Time | > 80% |
| NPS Score | > 40 |

### Out of Scope (MVP)

- Third-party integrations (QuickBooks, Slack, SAP, REST API)
- Native iOS or Android app (PWA covers mobile for MVP)
- B2C individual tracking features
- AI-powered predictive maintenance
- Multi-site enterprise hierarchy beyond basic org management
- Offline mode (requires connectivity for MVP)

---

## Section 3: Market Context

### Target Customer

**Primary:** Manufacturing and industrial SMEs with 10–500 employees who own and maintain physical equipment, machinery, vehicles, or tools.

**Firmographics:**
- Industry: Manufacturing, light industrial, field services
- Company size: 10–500 employees
- Geography: North America (primary), English-speaking markets (secondary)
- Budget authority: Operations Manager, Plant Manager, or Business Owner
- Current state: Managing assets in spreadsheets, paper logs, or nothing at all

### Competitive Landscape

| Competitor | Strength | Weakness | AssetFlow Advantage |
|------------|----------|----------|---------------------|
| IBM Maximo | Feature-rich, enterprise-grade | $100K+ implementation, 6-month setup | 10x cheaper, same-day setup |
| UpKeep | Mobile-first, easy to use | Maintenance-only, weak asset registry | Unified registry + maintenance |
| Fiix | Good maintenance scheduling | Complex UI, steep learning curve | Simpler UX, faster onboarding |
| Limble CMMS | Great for maintenance teams | No GPS, limited asset tracking | GPS tracking + full asset registry |
| Spreadsheets | Free, familiar | No automation, error-prone, no mobile | Automated alerts + mobile scanning |

### Positioning

AssetFlow is the **only asset management tool built for manufacturing SMEs** that combines physical asset tracking (registry, QR/barcode scanning, GPS) with preventive maintenance scheduling in a single platform — accessible from desktop and mobile without an app store install.

---

## Section 4: User Personas

### Persona 1: Admin — The Operations Manager

**Name:** Sarah, 42, Operations Manager  
**Company:** 80-person metal fabrication company  
**Goal:** Have a single source of truth for all equipment. Know what they own, where it is, and when it needs servicing.  
**Frustrations:** Spreadsheets get out of date. No one knows which technician has which tool. Maintenance gets missed.  
**Tech comfort:** Comfortable with business software. Uses QuickBooks, email, basic SaaS tools.

**Key jobs to be done:**
- Register all company assets once (bulk import or one-by-one)
- Assign assets to locations, departments, or individuals
- Configure maintenance schedules for each asset type
- Manage user accounts and permissions
- View audit history for compliance

---

### Persona 2: Technician — The Field Worker

**Name:** Marcus, 28, Equipment Technician  
**Company:** Same metal fabrication company  
**Goal:** Know what maintenance needs doing today and log it quickly without paperwork.  
**Frustrations:** Paper work orders get lost. Hard to find asset history on the floor. Maintenance reminders go to the manager, not the person doing the work.  
**Tech comfort:** Uses phone daily. Prefers simple, fast apps. No patience for complex UIs.

**Key jobs to be done:**
- Scan a QR code on a machine and immediately see its history and next service date
- Log a completed maintenance task in under 60 seconds
- Report an issue or flag an asset as out of service
- View assigned work orders for the day

---

### Persona 3: Manager — The Plant Manager

**Name:** David, 55, Plant Manager  
**Company:** Same metal fabrication company  
**Goal:** Prevent downtime. Know at a glance which assets are healthy, overdue for maintenance, or flagged for issues.  
**Frustrations:** Only finds out about equipment problems after a breakdown. No visibility into whether maintenance is actually happening. Manual reports from spreadsheets take hours.  
**Tech comfort:** Uses email and basic dashboards. Wants simple summaries, not complex tools.

**Key jobs to be done:**
- View a dashboard showing asset health status across the facility
- See upcoming and overdue maintenance tasks
- Approve work orders and assign them to technicians
- Export a monthly maintenance report for the board

---

## Section 5: User Journeys

### 5.1 Admin Journey — Onboarding & Setup

```
1. Sign Up
   └── Creates account, sets up company profile (name, industry, location)
   
2. Add Assets
   └── Imports assets via CSV upload or adds individually
   └── Assigns each asset: name, category, serial number, location, purchase date
   
3. Generate QR/Barcode Labels
   └── System generates printable QR codes for each asset
   └── Admin prints and physically attaches labels to equipment
   
4. Configure Maintenance Schedules
   └── Sets recurring maintenance tasks per asset or asset category
   └── Defines interval (daily, weekly, monthly, by usage hours)
   └── Assigns default technician responsible
   
5. Invite Team
   └── Sends email invites to Technicians and Managers
   └── Assigns roles and permissions per user
   
6. Verify Setup
   └── Reviews asset list, scans a test QR code, confirms alerts are working
```

---

### 5.2 Technician Journey — Daily Work

```
1. Start of Shift
   └── Opens AssetFlow on mobile browser (PWA)
   └── Views "My Work Orders" — tasks assigned for today
   
2. Scan an Asset
   └── Taps "Scan Asset" — camera opens
   └── Scans QR code on machine
   └── Sees asset profile: name, location, last service date, status, open issues
   
3. Log Maintenance
   └── Taps "Log Maintenance" on the asset
   └── Selects task type (from predefined list or free text)
   └── Adds notes, photos (optional), marks duration
   └── Submits — work order auto-closes if linked
   
4. Report an Issue
   └── Taps "Report Issue" on scanned asset
   └── Selects severity (Low / Medium / Critical)
   └── Adds description and photo
   └── Submits — manager gets alert immediately for Critical issues
   
5. End of Shift
   └── Views completion status of assigned tasks
   └── Any incomplete tasks automatically flagged for manager
```

---

### 5.3 Manager Journey — Monitoring & Oversight

```
1. Morning Dashboard Review
   └── Opens AssetFlow on desktop browser
   └── Sees summary: total assets, assets due for maintenance, overdue count, open issues
   └── Red/amber/green status indicators per asset category
   
2. Review Upcoming Maintenance
   └── Views maintenance calendar — next 7/30 days
   └── Sees which tasks are assigned, unassigned, or overdue
   └── Reassigns or approves work orders as needed
   
3. Respond to Alerts
   └── Receives email/in-app alert for critical issues or overdue tasks
   └── Reviews issue details, adds notes, changes priority
   └── Assigns or escalates to another technician
   
4. Monthly Reporting
   └── Navigates to Reports section
   └── Views maintenance completion rate, asset downtime events, work order history
   └── Exports PDF or on-screen summary for board/management review
```

---

## Section 6: Feature Specifications

### 6.1 Asset Registry & Management

**Description:** Central database of all company assets with full profile per asset.

**Requirements:**
- Each asset record contains: name, asset ID (auto-generated), category, serial number, manufacturer, model, purchase date, purchase cost, warranty expiry, location, assigned user, status (Active / Inactive / Under Maintenance / Retired), and custom fields (Admin-configurable key-value pairs, up to 10 per asset)
- Bulk import via CSV with field mapping wizard
- Asset categories are user-configurable (e.g., Machinery, Vehicles, Tools, IT Equipment)
- Assets can be linked to a physical location (building, floor, zone) defined by Admin
- Full edit history per asset (who changed what and when)
- Asset duplication for creating similar assets quickly
- Archive/retire assets without deletion (preserves history)
- Search and filter by any field; sortable columns in list view

---

### 6.2 QR / Barcode Scanning

**Description:** Camera-based scanning on mobile PWA to identify assets instantly in the field.

**Requirements:**
- Admin generates a unique QR code per asset — printable, downloadable as PNG or PDF sheet
- Technician taps "Scan" in mobile browser — uses device camera (no app install)
- Scanning opens the asset profile immediately
- System also accepts manual asset ID entry as fallback
- QR codes are permanent and tied to the asset ID (survive asset edits)
- Batch QR label printing: print labels for multiple assets at once (Avery-compatible sheet layout)
- Compatible with standard USB barcode scanners for fixed workstations

---

### 6.3 GPS / Location Tracking

**Description:** Track the physical location of mobile assets (vehicles, portable equipment) using browser GPS. Available on **Pro and Enterprise plans only.**

**Requirements:**
- When a Technician scans or checks in an asset from their mobile device, their GPS coordinates are optionally recorded
- Admin can view last known location of each asset on a map view (Google Maps or OpenStreetMap embed)
- Location history log per asset (timestamp + coordinates)
- GPS is opt-in: Technician is prompted for location permission on first use
- Assets can have a fixed "home location" defined by Admin; alerts triggered if asset is outside expected zone (v2 enhancement — basic version just shows last location)
- Location capture only occurs on user action (scan or check-in), not continuous background tracking

---

### 6.4 Maintenance Scheduling

**Description:** Define recurring preventive maintenance tasks per asset and track completion.

**Requirements:**
- Admin creates maintenance schedules per asset or asset category
- Schedule types: time-based (every N days/weeks/months) or usage-based (every N hours — Technician manually logs current hours when completing a work order; Admin sets the threshold)
- Each schedule defines: task name, description, estimated duration, assigned technician (default), and priority
- System auto-generates work orders based on schedule — N days before due date (configurable lead time)
- Maintenance calendar view: month/week/day views showing upcoming and overdue tasks
- Maintenance history per asset: complete log of all past tasks with timestamps and technician notes
- Bulk schedule assignment: apply a maintenance template to an entire asset category

---

### 6.5 Work Order Management

**Description:** Task-level tracking for maintenance and repair jobs from creation to completion.

**Requirements:**
- Work orders can be auto-generated (from maintenance schedule) or manually created by Admin/Manager
- Work order fields: title, asset linked, assigned technician, due date, priority (Low/Medium/High/Critical), description, estimated hours, status
- Status flow: Open → In Progress → Completed / Cancelled
- Technician updates status and adds completion notes from mobile
- Photo attachments per work order (up to 5 photos, max 10MB each)
- Manager can add comments or reassign at any stage
- Overdue work orders automatically escalate (change to red status + notification)
- Work order history retained indefinitely per asset

---

### 6.6 Automated Alerts & Notifications

**Description:** Proactive notifications to prevent missed maintenance and surface critical issues.

**Requirements:**
- In-app notifications (bell icon + notification feed)
- Email notifications (HTML formatted, configurable per user)
- Trigger conditions:
  - Maintenance due in N days (Admin configures lead time, default: 7 days)
  - Work order overdue
  - Critical issue reported on an asset
  - Asset status changed to "Under Maintenance" or "Inactive"
  - Work order assigned to a technician
- Users configure their own notification preferences (which events, in-app vs email)
- Admin can set org-level defaults for notification rules
- No SMS or push notifications in MVP (email + in-app only)

---

### 6.7 Dashboard & Reporting

**Description:** Real-time visibility into asset health and maintenance performance for Managers.

**Dashboard widgets (Manager view):**
- Total assets by status (Active / Inactive / Under Maintenance)
- Maintenance due this week / this month
- Overdue maintenance count (with link to list)
- Open work orders by priority
- Recent activity feed (last 10 actions across all assets)
- Assets with open critical issues

**Reports:**
- Maintenance completion rate (% of scheduled tasks completed on time, by period)
- Asset downtime log (assets that were inactive and for how long)
- Work order history (filterable by date range, technician, asset, status)
- Asset inventory export (full asset list as CSV or PDF)
- All reports exportable as PDF or CSV

---

### 6.8 User Management & Roles

**Description:** Role-based access control with three permission levels.

| Permission | Admin | Manager | Technician |
|------------|-------|---------|------------|
| Add/edit/delete assets | ✅ | ❌ | ❌ |
| Generate QR codes | ✅ | ❌ | ❌ |
| Create maintenance schedules | ✅ | ✅ | ❌ |
| Create/assign work orders | ✅ | ✅ | ❌ |
| Update work order status | ✅ | ✅ | ✅ |
| Log maintenance (via scan) | ✅ | ✅ | ✅ |
| Report issues | ✅ | ✅ | ✅ |
| View dashboard | ✅ | ✅ | ❌ |
| Manage users | ✅ | ❌ | ❌ |
| Export reports | ✅ | ✅ | ❌ |
| Configure notifications | ✅ | ✅ | ✅ (own only) |
| View billing | ✅ | ❌ | ❌ |

- Admin invites users via email; invited users set their own password
- Each seat = one active user account
- Admins can deactivate users (frees up the seat without deleting history)
- Each company account is isolated — no cross-company data access

---

## Section 7: Role × Feature Matrix

| Feature | Admin | Manager | Technician |
|---------|-------|---------|------------|
| Asset Registry | Full access | Read only | Read only (via scan) |
| QR Code Generation | ✅ | ❌ | ❌ |
| GPS Location View | ✅ | ✅ | Logs own location |
| Maintenance Scheduling | ✅ | Create & edit | View assigned |
| Work Orders | Full CRUD | Create & assign | Update & complete |
| Issue Reporting | ✅ | ✅ | ✅ |
| Dashboard | ✅ | ✅ | ❌ |
| Reports & Exports | ✅ | ✅ | ❌ |
| User Management | ✅ | ❌ | ❌ |
| Notification Config | Org-wide | Own | Own |
| Billing & Subscription | ✅ | ❌ | ❌ |

---

## Section 8: Technical Requirements

### Platform

| Requirement | Specification |
|-------------|---------------|
| Deployment | SaaS, cloud-hosted |
| Web App | Responsive web application (desktop-first, mobile-compatible) |
| Mobile | Progressive Web App (PWA) — installable from browser, no app store |
| Offline support | None (MVP requires connectivity) |
| Browser support | Chrome, Firefox, Safari, Edge (latest 2 versions) |
| QR Scanning | Browser camera API (getUserMedia) — no native app required |
| GPS | Browser Geolocation API (permission-based, user-triggered) |
| Map display | Embedded map (OpenStreetMap / Leaflet.js) |
| Authentication | Email + password with secure session management; MFA optional |
| Data storage | Cloud database, multi-tenant with tenant isolation |
| File storage | Cloud object storage for photos and QR label PDFs |

### Performance Targets

| Metric | Target |
|--------|--------|
| Page load time (web) | < 2 seconds (P90) |
| QR scan to asset profile | < 1 second |
| Dashboard load | < 3 seconds |
| API response time | < 500ms (P95) |
| Uptime SLA | 99.5% monthly |

### Security Requirements

- All data encrypted in transit (TLS 1.2+) and at rest (AES-256)
- Tenant data strictly isolated — no cross-account data leakage
- Role-based access enforced server-side (not just UI)
- Password requirements: minimum 8 characters, enforced on create/reset
- Session timeout after 24 hours of inactivity
- Audit log for all data changes (who, what, when) — retained 12 months

### Scalability

- Architecture supports up to 10,000 concurrent users at MVP launch
- Asset records: support up to 100,000 assets per tenant
- Storage: up to 50GB per tenant for photo attachments

---

## Section 9: Pricing & Business Model

### Subscription Tiers

| | Starter | Pro | Enterprise |
|--|---------|-----|------------|
| **Price** | $15/user/month | $28/user/month | Custom (direct sales) |
| **Min seats** | 3 | 5 | 20 |
| **Assets** | Up to 200 | Unlimited | Unlimited |
| **Users** | Up to 10 | Unlimited | Unlimited |
| **QR / Barcode Scanning** | ✅ | ✅ | ✅ |
| **GPS Tracking** | ❌ | ✅ | ✅ |
| **Maintenance Scheduling** | ✅ | ✅ | ✅ |
| **Work Orders** | ✅ | ✅ | ✅ |
| **Reporting & Export** | Basic | Full | Full + Custom |
| **Support** | Email | Priority email | Dedicated CSM |
| **SLA** | 99.5% | 99.5% | 99.9% |
| **Onboarding** | Self-serve | Self-serve | White-glove setup |
| **Contract** | Monthly | Monthly / Annual | Annual |
| **Billing** | Per seat | Per seat | Negotiated |

### Enterprise Plan Details

- Sold via direct sales (outbound + inbound from website)
- Custom pricing based on seat count, asset volume, and contract length
- Includes: dedicated Customer Success Manager, custom onboarding and data migration, priority support with 4-hour SLA, custom reporting on request
- Annual contract with Net-30 invoicing
- Volume discounts for 50+ seats

### Revenue Projections (Month 6)

| Tier | Customers | Avg Seats | MRR |
|------|-----------|-----------|-----|
| Starter | 30 | 5 | $2,250 |
| Pro | 15 | 10 | $4,200 |
| Enterprise | 3 | 25 | $7,500+ |
| **Total** | **48** | — | **~$14,000–$25,000** |

---

## Section 10: MVP Timeline & Milestones

### 6-Month Build Plan

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **Phase 1: Foundation** | Weeks 1–4 | Auth system, company onboarding, asset registry (CRUD), basic user management |
| **Phase 2: Scanning & Tracking** | Weeks 5–8 | QR code generation, camera-based PWA scanning, GPS location capture, map view |
| **Phase 3: Maintenance Core** | Weeks 9–12 | Maintenance scheduling engine, work order creation & assignment, status flows |
| **Phase 4: Alerts & Dashboard** | Weeks 13–16 | Email + in-app notifications, manager dashboard, alert rules |
| **Phase 5: Reports & Polish** | Weeks 17–20 | Reporting module, PDF/CSV export, mobile PWA polish, performance tuning |
| **Phase 6: Launch Prep** | Weeks 21–24 | Security audit, billing integration (Stripe), pricing page, onboarding flow, beta testing with 3–5 design partners |

### Key Milestones

- **Week 4:** Internal demo of core asset registry — validate with 2 potential customers
- **Week 8:** First QR scan working end-to-end on mobile
- **Week 12:** First complete maintenance work order lifecycle demo
- **Week 20:** Feature-complete beta ready for design partners
- **Week 24:** Public launch — Starter and Pro plans live

### Go-To-Market

- Launch on Product Hunt + relevant manufacturing communities (r/manufacturing, r/lean)
- Outbound to manufacturing SMEs via LinkedIn Sales Navigator
- Content marketing: "The spreadsheet-to-AssetFlow migration guide"
- Design partner program: 5 early customers get 6 months free in exchange for feedback and case studies
- Enterprise leads handled by founder directly at launch

---

*Document prepared for internal product planning and investor review. All projections are estimates based on market research and comparable SaaS benchmarks.*
