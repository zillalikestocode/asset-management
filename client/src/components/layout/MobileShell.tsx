import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { House, QrCode, ClipboardText, User } from '@phosphor-icons/react'
import { useAuth } from '@/contexts/AuthContext'
import { initials } from '@/lib/utils'

const TABS = [
  { to: '/tech',             label: 'Home',   icon: House,          exact: true },
  { to: '/tech/scan',        label: 'Scan',   icon: QrCode,         exact: false },
  { to: '/tech/work-orders', label: 'Tasks',  icon: ClipboardText,  exact: false },
  { to: '/tech/profile',     label: 'Profile', icon: User,          exact: false },
]

export function MobileShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const handleLogout = async () => { await logout(); navigate('/login') }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-af-bg max-w-[430px] mx-auto relative">
      {/* Status bar spacer */}
      <div className="h-safe-top bg-white" />

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-[72px]">
        {pathname === '/tech/profile' ? (
          <ProfileScreen user={user} onLogout={handleLogout} />
        ) : (
          <Outlet />
        )}
      </main>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] grid grid-cols-4 px-4 pt-2.5 pb-safe bg-white/95 backdrop-blur-sm border-t border-af-border z-40">
        {TABS.map(tab => {
            return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className="flex flex-col items-center gap-0.5 py-1.5 font-mono text-[10px] tracking-[0.06em] uppercase transition-colors duration-[120ms]"
              style={({ isActive }) => ({
                color: isActive ? 'var(--af-ink-900)' : 'var(--af-fg-muted)',
              })}
            >
              {({ isActive }) => (
                <>
                  <tab.icon
                    size={22}
                    weight={isActive ? 'bold' : 'regular'}
                    style={{ color: isActive ? 'var(--af-orange-500)' : undefined }}
                  />
                  {tab.label}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}

// ── Inline profile screen (no separate route needed) ──────
function ProfileScreen({ user, onLogout }: { user: ReturnType<typeof useAuth>['user']; onLogout: () => void }) {
  return (
    <div className="p-5">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-af-orange-500 to-af-orange-600 flex items-center justify-center text-white text-xl font-semibold">
          {user ? initials(user.name) : '?'}
        </div>
        <div>
          <p className="text-[17px] font-semibold tracking-[-0.01em]">{user?.name}</p>
          <p className="text-[13px] text-af-muted">{user?.email}</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-af-muted mt-0.5">{user?.role}</p>
        </div>
      </div>
      <button
        onClick={onLogout}
        className="w-full h-10 rounded-lg border border-af-border bg-white text-[14px] font-medium text-af-crit-600 hover:bg-af-crit-100 transition-colors duration-[120ms]"
      >
        Sign out
      </button>
    </div>
  )
}
