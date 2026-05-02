import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { NotificationBell } from './NotificationBell'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard':   'Dashboard',
  '/assets':      'Assets',
  '/maintenance': 'Maintenance',
  '/work-orders': 'Work Orders',
  '/qr':          'QR Codes',
  '/reports':     'Reports',
  '/users':       'Users',
  '/settings':    'Settings',
}

export function Topbar() {
  const { pathname } = useLocation()
  const { user }     = useAuth()
  const [search, setSearch] = useState('')

  // Resolve breadcrumb label
  const segments = pathname.split('/').filter(Boolean)
  const section  = '/' + (segments[0] ?? 'dashboard')
  const label    = ROUTE_LABELS[section] ?? segments[0] ?? 'Dashboard'
  const isDetail = segments.length > 1

  return (
    <header className="h-12 flex items-center gap-3 px-5 border-b border-af-border bg-white flex-shrink-0">
      {/* Breadcrumb */}
      <div className="font-mono text-[11px] text-af-muted tracking-[0.02em] whitespace-nowrap">
        <span>{user?.orgName ?? 'AssetFlow'}</span>
        <span className="mx-1.5 opacity-40">/</span>
        <span className={cn(isDetail ? 'text-af-muted' : 'text-af-fg font-medium')}>{label}</span>
        {isDetail && (
          <>
            <span className="mx-1.5 opacity-40">/</span>
            <span className="text-af-fg font-medium capitalize">{segments[1]}</span>
          </>
        )}
      </div>

      <div className="flex-1" />

      {/* Search */}
      <div className="flex items-center gap-1.5 bg-af-ink-050 border border-af-border rounded px-2.5 py-1.5 w-64 text-[12px] text-af-muted">
        <MagnifyingGlass size={14} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search…"
          className="flex-1 bg-transparent outline-none text-af-fg placeholder:text-af-subtle text-[12px]"
        />
        <kbd className="font-mono text-[10px] text-af-subtle bg-white border border-af-border px-1 rounded-sm">
          ⌘K
        </kbd>
      </div>

      {/* Notifications */}
      <NotificationBell />
    </header>
  )
}
