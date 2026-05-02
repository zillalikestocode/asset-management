import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import type { Role } from '@/types'

interface Props {
  allow: Role[]
  children: ReactNode
}

export function RoleRoute({ allow, children }: Props) {
  const { user } = useAuth()

  if (!user || !allow.includes(user.role)) {
    // Redirect technicians to their home; admins/managers to dashboard
    const fallback = user?.role === 'technician' ? '/tech' : '/dashboard'
    return <Navigate to={fallback} replace />
  }

  return <>{children}</>
}
