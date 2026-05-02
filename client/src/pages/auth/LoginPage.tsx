import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import type { ApiError } from '@/types'

const schema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})
type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [submitting, setSubmitting] = useState(false)

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? null

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  // Already logged in — redirect immediately
  if (user) {
    const dest = user.role === 'technician' ? '/tech' : '/dashboard'
    navigate(from ?? dest, { replace: true })
    return null
  }

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true)
    try {
      await login(values.email, values.password)
      // Auth context sets user; navigate based on role
      const dest = from ?? '/dashboard'
      navigate(dest, { replace: true })
    } catch (err) {
      toast.error((err as ApiError).message ?? 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-af-bg flex">
      {/* Left panel — brand / blueprint */}
      <div className="hidden lg:flex w-[420px] flex-shrink-0 bg-af-ink-900 flex-col p-10 relative overflow-hidden">
        <div className="af-grid-bg absolute inset-0 opacity-[0.04]" />
        <div className="relative z-10 flex items-center gap-3 mb-auto">
          <img src="/logo-mark.svg" alt="AssetFlow" className="w-8 h-8" />
          <span className="text-white font-semibold text-[15px] tracking-[-0.01em]">AssetFlow</span>
          <span className="ml-auto font-mono text-[9px] tracking-[0.14em] uppercase text-af-ink-500 bg-white/5 px-1.5 py-0.5 rounded-[3px]">PROD</span>
        </div>
        <div className="relative z-10 mt-auto">
          <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-af-ink-500 mb-3">
            Asset management
          </p>
          <h1 className="text-white text-3xl font-semibold leading-tight tracking-[-0.02em] mb-4">
            Keep every asset<br />accounted for.
          </h1>
          <p className="text-af-ink-400 text-[13px] leading-relaxed">
            Register, scan, schedule maintenance, and monitor every piece of equipment — from your desk or the floor.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <img src="/logo-mark.svg" alt="AssetFlow" className="w-7 h-7" />
            <span className="font-semibold text-[15px]">AssetFlow</span>
          </div>

          <h2 className="text-[22px] font-semibold tracking-[-0.015em] mb-1">Sign in</h2>
          <p className="text-af-muted text-[13px] mb-6">Enter your credentials to continue.</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <label className="block font-mono text-[10px] tracking-[0.1em] uppercase text-af-muted mb-1.5">
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                placeholder="sarah@acme-mfg.com"
                className="w-full h-9 px-3 rounded border border-af-border bg-white text-[13px] text-af-fg placeholder:text-af-subtle outline-none focus:border-af-focus focus:shadow-focus transition-[border-color,box-shadow] duration-1"
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1 text-[11px] text-af-crit-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block font-mono text-[10px] tracking-[0.1em] uppercase text-af-muted mb-1.5">
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full h-9 px-3 rounded border border-af-border bg-white text-[13px] text-af-fg placeholder:text-af-subtle outline-none focus:border-af-focus focus:shadow-focus transition-[border-color,box-shadow] duration-1"
                {...register('password')}
              />
              {errors.password && (
                <p className="mt-1 text-[11px] text-af-crit-600">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-9 bg-af-ink-900 text-white text-[13px] font-medium rounded hover:bg-af-ink-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-1"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-[12px] text-af-muted text-center">
            New to AssetFlow?{' '}
            <a href="/onboarding" className="text-af-orange-600 hover:underline">
              Set up your organisation
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
