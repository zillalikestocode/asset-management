import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { get, post } from '@/lib/api'
import type { AuthUser } from '@/types'

interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const me = await get<AuthUser>('/auth/me')
      setUser(me)
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('af_token')
    if (token) {
      refresh().finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [refresh])

  const login = async (email: string, password: string) => {
    const { accessToken, refreshToken, user: me } = await post<LoginResponse>(
      '/auth/login',
      { email, password },
    )
    localStorage.setItem('af_token', accessToken)
    localStorage.setItem('af_refresh', refreshToken)
    setUser(me)
  }

  const logout = () => {
    localStorage.removeItem('af_token')
    localStorage.removeItem('af_refresh')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
