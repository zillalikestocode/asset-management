import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { CheckCircle, Buildings } from '@phosphor-icons/react'
import { post } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import type { AuthUser } from '@/types'

const schema = z.object({
  orgName:   z.string().min(2, 'Required'),
  industry:  z.string().min(2, 'Select an industry'),
  adminName: z.string().min(2, 'Required'),
  email:     z.string().email('Enter a valid email'),
  password:  z.string().min(8, 'At least 8 characters'),
})
type FormValues = z.infer<typeof schema>

interface RegisterResponse {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

function FieldWrap({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-mono text-[10px] tracking-[0.1em] uppercase text-af-muted mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-[11px] text-af-crit-600">{error}</p>}
    </div>
  )
}

function TextInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full h-9 px-3 rounded border border-af-border bg-white text-[13px] text-af-fg placeholder:text-af-subtle outline-none focus:border-af-focus transition-[border-color,box-shadow] duration-1',
        className,
      )}
      {...props}
    />
  )
}

export function OnboardingPage() {
  const navigate  = useNavigate()
  const { refresh } = useAuth()
  const [done, setDone] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values: FormValues) => {
    try {
      const { accessToken, refreshToken } = await post<RegisterResponse>('/auth/register', {
        orgName:   values.orgName,
        industry:  values.industry,
        adminName: values.adminName,
        email:     values.email,
        password:  values.password,
      })
      localStorage.setItem('af_token', accessToken)
      localStorage.setItem('af_refresh', refreshToken)
      await refresh()
      setDone(true)
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? 'Setup failed — please try again')
    }
  }

  return (
    <div className="min-h-screen flex bg-af-bg overflow-hidden">
      {/* Left rail */}
      <aside className="w-[280px] flex-shrink-0 bg-af-ink-900 flex flex-col p-7 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right,rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(to bottom,rgba(255,255,255,.025) 1px,transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center gap-2.5 mb-10">
            <img src="/logo-mark.svg" alt="AssetFlow" className="w-7 h-7" />
            <span className="text-white font-semibold text-[15px]">AssetFlow</span>
            <span className="ml-auto font-mono text-[9px] tracking-[0.14em] uppercase text-af-ink-500 bg-white/5 px-1.5 py-0.5 rounded-sm">SETUP</span>
          </div>

          <div className="flex-1">
            <div className={cn(
              'flex items-start gap-3 p-3 rounded-lg transition-colors duration-2',
              !done ? 'bg-white/5' : 'bg-transparent',
            )}>
              <div className={cn(
                'w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-2',
                done
                  ? 'bg-af-orange-500 border-af-orange-500'
                  : 'bg-af-orange-500 border-af-orange-500 shadow-[0_0_0_4px_rgba(255,107,53,.2)]',
              )}>
                {done
                  ? <CheckCircle weight="bold" size={14} className="text-white" />
                  : <Buildings size={14} className="text-white" />
                }
              </div>
              <div>
                <p className="text-[13px] font-medium text-white">Workspace setup</p>
                <p className="font-mono text-[10px] tracking-[0.06em] uppercase text-af-ink-500 mt-0.5">Organisation + admin</p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/6 pt-4 text-[11px] text-af-ink-500">
            Already have an account?{' '}
            <a href="/login" className="text-af-orange-500 hover:underline">Sign in</a>
          </div>
        </div>
      </aside>

      {/* Right stage */}
      <main className="flex-1 flex flex-col">
        <div className="h-14 flex items-center px-8 border-b border-af-border bg-white flex-shrink-0">
          <span className="font-mono text-[11px] tracking-[0.06em] uppercase text-af-muted">
            {done ? 'Setup complete' : 'Create your workspace'}
          </span>
          <div className="flex-1 mx-6 h-1 bg-af-ink-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-af-orange-500 rounded-full transition-all duration-5"
              style={{ width: done ? '100%' : '50%' }}
            />
          </div>
          <button
            onClick={() => navigate('/login')}
            className="text-[12px] text-af-muted hover:text-af-fg transition-colors duration-1"
          >
            Exit
          </button>
        </div>

        <div className="flex-1 flex justify-center items-start p-10">
          <div className="w-full max-w-lg">
            {!done ? (
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                <div className="mb-6">
                  <h1 className="text-2xl font-semibold tracking-[-0.015em] mb-1">Set up your workspace</h1>
                  <p className="text-af-muted text-[13px]">
                    Creates your AssetFlow organisation and admin account. You can add assets and invite your team from the dashboard.
                  </p>
                </div>

                {/* Org info */}
                <div className="p-4 rounded-xl border border-af-border bg-white space-y-4">
                  <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-af-muted">Organisation</p>
                  <FieldWrap label="Organisation name" error={errors.orgName?.message}>
                    <TextInput placeholder="Acme Manufacturing" {...register('orgName')} />
                  </FieldWrap>
                  <FieldWrap label="Industry" error={errors.industry?.message}>
                    <select
                      className="w-full h-9 px-3 rounded border border-af-border bg-white text-[13px] text-af-fg outline-none focus:border-af-focus transition-[border-color] duration-1"
                      defaultValue=""
                      {...register('industry')}
                    >
                      <option value="" disabled>Select industry…</option>
                      <option>Manufacturing</option>
                      <option>Light Industrial</option>
                      <option>Construction</option>
                      <option>Field Services</option>
                      <option>Other</option>
                    </select>
                  </FieldWrap>
                </div>

                {/* Admin account */}
                <div className="p-4 rounded-xl border border-af-border bg-white space-y-4">
                  <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-af-muted">Admin account</p>
                  <FieldWrap label="Your name" error={errors.adminName?.message}>
                    <TextInput placeholder="Sarah Chen" {...register('adminName')} />
                  </FieldWrap>
                  <FieldWrap label="Email" error={errors.email?.message}>
                    <TextInput type="email" placeholder="sarah@acme-mfg.com" {...register('email')} />
                  </FieldWrap>
                  <FieldWrap label="Password" error={errors.password?.message}>
                    <TextInput type="password" placeholder="At least 8 characters" {...register('password')} />
                  </FieldWrap>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-10 bg-af-orange-500 hover:bg-af-orange-600 disabled:opacity-50 text-white text-[13px] font-semibold rounded-xl transition-colors duration-1"
                >
                  {isSubmitting ? 'Creating workspace…' : 'Create workspace →'}
                </button>
              </form>
            ) : (
              /* Done screen */
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full bg-af-ok-100 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle weight="fill" size={36} className="text-af-ok-600" />
                </div>
                <h1 className="text-2xl font-semibold tracking-[-0.015em] mb-2">Workspace ready!</h1>
                <p className="text-af-muted text-[13px] mb-8 max-w-xs mx-auto leading-relaxed">
                  Your AssetFlow workspace has been created. Head to the dashboard to add your first asset or invite your team.
                </p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="h-10 px-8 bg-af-orange-500 hover:bg-af-orange-600 text-white text-[13px] font-semibold rounded-xl transition-colors duration-1"
                >
                  Go to dashboard →
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
