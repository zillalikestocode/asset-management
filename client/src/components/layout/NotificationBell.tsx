import { useState, useRef, useEffect } from 'react'
import { Bell } from '@phosphor-icons/react'
import { useNotifications, useMarkRead, useMarkAllRead } from '@/hooks/useNotifications'
import { cn } from '@/lib/utils'
import { formatRelative } from '@/lib/utils'

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { data: notifications = [] } = useNotifications()
  const markRead    = useMarkRead()
  const markAllRead = useMarkAllRead()

  const unread = notifications.filter(n => !n.read).length

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative w-8 h-8 flex items-center justify-center rounded border border-af-border bg-white text-af-muted hover:text-af-fg hover:bg-af-ink-050 transition-colors duration-[120ms]"
      >
        <Bell size={15} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-af-orange-500 text-white font-mono text-[9px] flex items-center justify-center leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white rounded-lg border border-af-border shadow-3 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-af-border">
            <span className="text-[13px] font-semibold">Notifications</span>
            {unread > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                className="text-[11px] text-af-orange-600 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-af-border">
            {notifications.length === 0 ? (
              <p className="text-[13px] text-af-muted text-center py-8">No notifications</p>
            ) : notifications.slice(0, 10).map(n => (
              <button
                key={n.id}
                onClick={() => { markRead.mutate(n.id); setOpen(false) }}
                className={cn(
                  'w-full text-left px-4 py-3 hover:bg-af-ink-050 transition-colors duration-[120ms]',
                  !n.read && 'bg-af-blue-050',
                )}
              >
                <p className={cn('text-[13px] leading-snug', n.read ? 'text-af-fg' : 'font-medium text-af-fg')}>
                  {n.title}
                </p>
                <p className="text-[11px] text-af-muted mt-0.5 line-clamp-2">{n.body}</p>
                <p className="font-mono text-[10px] text-af-subtle mt-1">{formatRelative(n.createdAt)}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
