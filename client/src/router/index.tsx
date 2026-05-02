import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleRoute } from './RoleRoute'

// Landing
import { LandingPage } from '@/pages/LandingPage'

// Auth
import { LoginPage }      from '@/pages/auth/LoginPage'
import { OnboardingPage } from '@/pages/auth/OnboardingPage'

// Admin / Manager layouts + pages
import { DesktopShell }        from '@/components/layout/DesktopShell'
import { DashboardPage }       from '@/pages/admin/DashboardPage'
import { AssetsPage }          from '@/pages/admin/AssetsPage'
import { AssetDetailPage }     from '@/pages/admin/AssetDetailPage'
import { WorkOrdersPage }      from '@/pages/admin/WorkOrdersPage'
import { WorkOrderDetailPage } from '@/pages/admin/WorkOrderDetailPage'
import { MaintenancePage }     from '@/pages/admin/MaintenancePage'
import { QRPage }              from '@/pages/admin/QRPage'
import { ReportsPage }         from '@/pages/admin/ReportsPage'
import { UsersPage }           from '@/pages/admin/UsersPage'
import { SettingsPage }        from '@/pages/admin/SettingsPage'

// Technician mobile pages
import { MobileShell }          from '@/components/layout/MobileShell'
import { TechHomePage }         from '@/pages/technician/TechHomePage'
import { TechScanPage }         from '@/pages/technician/TechScanPage'
import { TechAssetPage }        from '@/pages/technician/TechAssetPage'
import { TechWorkOrdersPage }   from '@/pages/technician/TechWorkOrdersPage'
import { TechLogPage }          from '@/pages/technician/TechLogPage'
import { TechReportIssuePage }  from '@/pages/technician/TechReportIssuePage'

export const router = createBrowserRouter([
  // ── Public ──────────────────────────────────────────────
  { path: '/',           element: <LandingPage /> },
  { path: '/login',      element: <LoginPage /> },
  { path: '/onboarding', element: <OnboardingPage /> },

  // ── Admin + Manager (desktop shell) ─────────────────────
  {
    element: <ProtectedRoute><RoleRoute allow={['admin', 'manager']}><DesktopShell /></RoleRoute></ProtectedRoute>,
    children: [
      { path: 'dashboard',              element: <DashboardPage /> },
      { path: 'assets',                 element: <AssetsPage /> },
      { path: 'assets/:id',             element: <AssetDetailPage /> },
      { path: 'work-orders',            element: <WorkOrdersPage /> },
      { path: 'work-orders/:id',        element: <WorkOrderDetailPage /> },
      { path: 'maintenance',            element: <MaintenancePage /> },
      { path: 'qr',                     element: <QRPage /> },
      { path: 'reports',                element: <ReportsPage /> },
      { path: 'users',                  element: <UsersPage /> },
      { path: 'settings',               element: <SettingsPage /> },
    ],
  },

  // ── Technician (mobile shell) ────────────────────────────
  {
    element: <ProtectedRoute><RoleRoute allow={['technician']}><MobileShell /></RoleRoute></ProtectedRoute>,
    children: [
      { path: 'tech',                   element: <TechHomePage /> },
      { path: 'tech/scan',              element: <TechScanPage /> },
      { path: 'tech/assets/:id',        element: <TechAssetPage /> },
      { path: 'tech/work-orders',       element: <TechWorkOrdersPage /> },
      { path: 'tech/work-orders/:id/log',   element: <TechLogPage /> },
      { path: 'tech/assets/:id/report', element: <TechReportIssuePage /> },
    ],
  },
])
