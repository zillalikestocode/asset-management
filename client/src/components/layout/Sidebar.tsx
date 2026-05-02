import { NavLink, useNavigate } from 'react-router-dom'
import {
  Gauge, Package, Wrench, ClipboardText, QrCode,
  ChartBar, Users, Gear, SignOut,
} from '@phosphor-icons/react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { initials } from '@/lib/utils'
import type { Role } from '@/types'

interface NavItem {
  to: string
  label: string
  icon: React.ElementType
  roles: Role[]
  badge?: number
}

const NAV: NavItem[] = [
  { to: '/dashboard',    label: 'Dashboard',    icon: Gauge,         roles: ['admin', 'manager'] },
  { to: '/assets',       label: 'Assets',       icon: Package,       roles: ['admin', 'manager'] },
  { to: '/maintenance',  label: 'Maintenance',  icon: Wrench,        roles: ['admin', 'manager'] },
  { to: '/work-orders',  label: 'Work Orders',  icon: ClipboardText, roles: ['admin', 'manager'] },
  { to: '/qr',           label: 'QR Codes',     icon: QrCode,        roles: ['admin'] },
  { to: '/reports',      label: 'Reports',      icon: ChartBar,      roles: ['admin', 'manager'] },
  { to: '/users',        label: 'Users',        icon: Users,         roles: ['admin'] },
  { to: '/settings',     label: 'Settings',     icon: Gear,          roles: ['admin', 'manager'] },
]

export function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const visibleNav = NAV.filter(item => user?.role && item.roles.includes(user.role as Role))

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside className="w-[220px] flex-shrink-0 bg-af-ink-900 flex flex-col h-screen">
      {/* Brand */}
      <div className="flex items-center gap-2 px-4 py-[18px] border-b border-white/[0.06]">
        <div className="w-6 h-6 rounded-[5px] bg-af-ink-800 flex items-center justify-center flex-shrink-0">
          <span className="w-[5px] h-[5px] rounded-full bg-af-orange-500 block" />
        </div>
        <span className="text-white font-semibold text-[14px] tracking-[-0.01em]">AssetFlow</span>
        <span className="ml-auto font-mono text-[9px] tracking-[0.14em] uppercase text-af-ink-500 bg-white/5 px-1.5 py-0.5 rounded-sm">
          {user?.orgName?.slice(0, 6).toUpperCase() ?? 'ORG'}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        <p className="font-mono text-[9px] tracking-[0.14em] uppercase text-af-ink-500 px-2 pb-2 pt-1">
          Navigation
        </p>

        {visibleNav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              'flex items-center gap-2.5 px-2 py-1.5 rounded text-[13px] transition-colors duration-[120ms] whitespace-nowrap',
              isActive
                ? 'bg-af-orange-500/12 text-white'
                : 'text-af-ink-300 hover:bg-white/[0.04] hover:text-white',
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={16}
                  weight="regular"
                  className={cn(isActive ? 'text-af-orange-500' : 'text-af-ink-400')}
                />
                <span className="flex-1">{item.label}</span>
                {item.badge != null && item.badge > 0 && (
                  <span className={cn(
                    'font-mono text-[10px] px-1.5 py-0.5 rounded-full',
                    isActive
                      ? 'text-af-orange-500 bg-af-orange-500/15'
                      : 'text-af-ink-500 bg-white/[0.04]',
                  )}>
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-[26px] h-[26px] rounded-[5px] bg-gradient-to-br from-af-orange-500 to-af-orange-600 flex items-center justify-center text-white text-[11px] font-semibold flex-shrink-0">
            {user ? initials(user.name) : '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-[12px] font-semibold truncate leading-tight">{user?.name}</p>
            <p className="font-mono text-[9px] uppercase tracking-[0.06em] text-af-ink-500 truncate">
              {user?.role}
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="text-af-ink-500 hover:text-white transition-colors duration-[120ms] flex-shrink-0"
          >
            <SignOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  )
}
