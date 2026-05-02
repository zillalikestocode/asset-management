import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { post } from '@/lib/api'
import { cn } from '@/lib/utils'
import { CheckCircle, Buildings, Package, UserPlus, RocketLaunch } from '@phosphor-icons/react'

// ── Step schemas ───────────────────────────────────────────
const companySchema = z.object({
  orgName:   z.string().min(2, 'Required'),
  industry:  z.string().min(2, 'Required'),
  adminName: z.string().min(2, 'Required'),
  email:     z.string().email('Enter a valid email'),
  password:  z.string().min(8, 'At least 8 characters'),
})

const assetSchema = z.object({
  name:         z.string().min(2, 'Required'),
  category:     z.string().min(1, 'Required'),
  serialNumber: z.string().optional(),
  location:     z.string().optional(),
})

type CompanyValues = z.infer<typeof companySchema>
type AssetValues   = z.infer<typeof assetSchema>

// ── Step metadata ──────────────────────────────────────────
const STEPS = [
  { num: 1, label: 'Company',   sub: 'ACCOUNT SETUP',  icon: Buildings },
  { num: 2, label: 'First Asset', sub: 'ASSET SETUP',  icon: Package },
  { num: 3, label: 'Invite Team', sub: 'USERS',        icon: UserPlus },
  { num: 4, label: 'Done',       sub: 'LAUNCH',        icon: RocketLaunch },
]

// ── Field component ────────────────────────────────────────
function Field({
  label, error, children,
}: { label: string; error?: string; children: React.ReactNode }) {
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

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full h-9 px-3 rounded border border-af-border bg-white text-[13px] text-af-fg placeholder:text-af-subtle outline-none focus:border-af-focus focus:shadow-focus transition-[border-color,box-shadow] duration-1',
        className,
      )}
      {...props}
    />
  )
}

// ── Main component ─────────────────────────────────────────
export function OnboardingPage() {
  const navigate  = useNavigate()
  const [step, setStep]         = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [inviteRows, setInviteRows] = useState([{ email: '', role: 'technician' }])
  const [companyData, setCompanyData] = useState<CompanyValues | null>(null)
  const [_assetData, setAssetData]   = useState<AssetValues | null>(null)

  const companyForm = useForm<CompanyValues>({ resolver: zodResolver(companySchema) })
  const assetForm   = useForm<AssetValues>({ resolver: zodResolver(assetSchema) })

  // ── Step 1 — Company ──────────────────────────────────────
  const submitCompany = async (values: CompanyValues) => {
    setCompanyData(values)
    setStep(2)
  }

  // ── Step 2 — Asset ────────────────────────────────────────
  const submitAsset = (values: AssetValues) => {
    setAssetData(values)
    setStep(3)
  }

  // ── Step 3 — Invite ───────────────────────────────────────
  const submitInvites = async () => {
    if (!companyData) return
    setSubmitting(true)
    try {
      const { token } = await post<{ token: string }>('/auth/register', {
        orgName:   companyData.orgName,
        industry:  companyData.industry,
        adminName: companyData.adminName,
        email:     companyData.email,
        password:  companyData.password,
        invites:   inviteRows.filter(r => r.email.trim()),
      })
      localStorage.setItem('af_token', token)
      setStep(4)
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? 'Setup failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-af-bg overflow-hidden">
      {/* ── Left rail ─────────────────────────────────────── */}
      <aside className="w-[300px] flex-shrink-0 bg-af-ink-900 flex flex-col p-7 relative overflow-hidden">
        {/* Blueprint grid tint */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(to right,rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(to bottom,rgba(255,255,255,.025) 1px,transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative z-10 flex flex-col h-full">
          {/* Brand */}
          <div className="flex items-center gap-2.5 mb-10">
            <img src="/logo-mark.svg" alt="AssetFlow" className="w-7 h-7" />
            <span className="text-white font-semibold text-[15px]">AssetFlow</span>
            <span className="ml-auto font-mono text-[9px] tracking-[0.14em] uppercase text-af-ink-500 bg-white/5 px-1.5 py-0.5 rounded-sm">SETUP</span>
          </div>

          <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-af-ink-500 mb-4">
            Getting started
          </p>

          {/* Steps */}
          <div className="flex flex-col gap-0.5 mb-auto">
            {STEPS.map(s => {
              const done   = step > s.num
              const active = step === s.num
              return (
                <div key={s.num} className="relative">
                  {s.num < STEPS.length && (
                    <div className={cn(
                      'absolute left-[13px] top-[38px] bottom-[-2px] w-0.5',
                      done ? 'bg-af-orange-500/40' : 'bg-white/6',
                    )} />
                  )}
                  <div className={cn(
                    'grid grid-cols-[28px_1fr] gap-3 px-1.5 py-2.5 rounded cursor-default',
                  )}>
                    <div className={cn(
                      'w-7 h-7 rounded-full border-2 flex items-center justify-center font-mono text-[11px] font-semibold transition-all duration-2',
                      done   && 'bg-af-orange-500 border-af-orange-500 text-white',
                      active && 'bg-af-orange-500 border-af-orange-500 text-white shadow-[0_0_0_4px_rgba(255,107,53,.2)]',
                      !done && !active && 'border-white/12 text-af-ink-400',
                    )}>
                      {done ? <CheckCircle weight="bold" size={14} /> : s.num}
                    </div>
                    <div>
                      <p className={cn(
                        'text-[13px] font-medium leading-tight',
                        active ? 'text-white' : done ? 'text-white/75' : 'text-white/50',
                      )}>{s.label}</p>
                      <p className="font-mono text-[10px] tracking-[0.06em] uppercase text-af-ink-500 mt-0.5">
                        {s.sub}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="border-t border-white/6 pt-4 text-[11px] text-af-ink-500">
            Already have an account?{' '}
            <a href="/login" className="text-af-orange-500 hover:underline">Sign in</a>
          </div>
        </div>
      </aside>

      {/* ── Right stage ───────────────────────────────────── */}
      <main className="flex-1 overflow-auto flex flex-col">
        {/* Topbar */}
        <div className="h-14 flex items-center px-8 border-b border-af-border bg-white flex-shrink-0">
          <span className="font-mono text-[11px] tracking-[0.06em] uppercase text-af-muted">
            Step {step} of {STEPS.length}
          </span>
          <div className="flex-1 mx-6 h-1 bg-af-ink-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-af-orange-500 rounded-full transition-all duration-3"
              style={{ width: `${(step / STEPS.length) * 100}%` }}
            />
          </div>
          <button onClick={() => navigate('/login')} className="text-[12px] text-af-muted hover:text-af-fg transition-colors duration-1">
            Exit setup
          </button>
        </div>

        {/* Panel */}
        <div className="flex-1 flex justify-center p-10">
          <div className="w-full max-w-lg">

            {/* ── Step 1 ──────────────────────────────────── */}
            {step === 1 && (
              <form onSubmit={companyForm.handleSubmit(submitCompany)} noValidate className="space-y-5">
                <div className="mb-6">
                  <h1 className="text-2xl font-semibold tracking-[-0.015em] mb-1">Set up your organisation</h1>
                  <p className="text-af-muted text-[13px]">This creates your AssetFlow workspace and admin account.</p>
                </div>
                <Field label="Organisation name" error={companyForm.formState.errors.orgName?.message}>
                  <Input placeholder="Acme Manufacturing" {...companyForm.register('orgName')} />
                </Field>
                <Field label="Industry" error={companyForm.formState.errors.industry?.message}>
                  <select
                    className="w-full h-9 px-3 rounded border border-af-border bg-white text-[13px] text-af-fg outline-none focus:border-af-focus focus:shadow-focus transition-[border-color,box-shadow] duration-1"
                    {...companyForm.register('industry')}
                  >
                    <option value="">Select industry…</option>
                    <option>Manufacturing</option>
                    <option>Light Industrial</option>
                    <option>Construction</option>
                    <option>Field Services</option>
                    <option>Other</option>
                  </select>
                  {companyForm.formState.errors.industry && (
                    <p className="mt-1 text-[11px] text-af-crit-600">{companyForm.formState.errors.industry.message}</p>
                  )}
                </Field>
                <div className="border-t border-af-border pt-5">
                  <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-af-muted mb-4">Admin account</p>
                  <div className="space-y-4">
                    <Field label="Your name" error={companyForm.formState.errors.adminName?.message}>
                      <Input placeholder="Sarah Chen" {...companyForm.register('adminName')} />
                    </Field>
                    <Field label="Email" error={companyForm.formState.errors.email?.message}>
                      <Input type="email" placeholder="sarah@acme-mfg.com" {...companyForm.register('email')} />
                    </Field>
                    <Field label="Password" error={companyForm.formState.errors.password?.message}>
                      <Input type="password" placeholder="At least 8 characters" {...companyForm.register('password')} />
                    </Field>
                  </div>
                </div>
                <button type="submit" className="w-full h-9 bg-af-orange-500 hover:bg-af-orange-600 text-white text-[13px] font-medium rounded transition-colors duration-1">
                  Continue →
                </button>
              </form>
            )}

            {/* ── Step 2 ──────────────────────────────────── */}
            {step === 2 && (
              <form onSubmit={assetForm.handleSubmit(submitAsset)} noValidate className="space-y-5">
                <div className="mb-6">
                  <h1 className="text-2xl font-semibold tracking-[-0.015em] mb-1">Add your first asset</h1>
                  <p className="text-af-muted text-[13px]">You can bulk-import the rest later. Let's start with one.</p>
                </div>
                <Field label="Asset name" error={assetForm.formState.errors.name?.message}>
                  <Input placeholder="Hydraulic press #4" {...assetForm.register('name')} />
                </Field>
                <Field label="Category" error={assetForm.formState.errors.category?.message}>
                  <select
                    className="w-full h-9 px-3 rounded border border-af-border bg-white text-[13px] outline-none focus:border-af-focus focus:shadow-focus transition-[border-color,box-shadow] duration-1"
                    {...assetForm.register('category')}
                  >
                    <option value="">Select category…</option>
                    <option>Machinery</option>
                    <option>Vehicles</option>
                    <option>Tools</option>
                    <option>IT Equipment</option>
                    <option>Other</option>
                  </select>
                </Field>
                <Field label="Serial number (optional)">
                  <Input placeholder="SN-00423-X" {...assetForm.register('serialNumber')} />
                </Field>
                <Field label="Location (optional)">
                  <Input placeholder="Building A – Floor 2" {...assetForm.register('location')} />
                </Field>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setStep(1)} className="h-9 px-5 rounded border border-af-border bg-white text-[13px] font-medium hover:bg-af-ink-050 transition-colors duration-1">
                    Back
                  </button>
                  <button type="submit" className="flex-1 h-9 bg-af-orange-500 hover:bg-af-orange-600 text-white text-[13px] font-medium rounded transition-colors duration-1">
                    Continue →
                  </button>
                  <button type="button" onClick={() => setStep(3)} className="h-9 px-5 rounded border border-af-border bg-white text-[13px] text-af-muted hover:text-af-fg transition-colors duration-1">
                    Skip
                  </button>
                </div>
              </form>
            )}

            {/* ── Step 3 ──────────────────────────────────── */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="mb-6">
                  <h1 className="text-2xl font-semibold tracking-[-0.015em] mb-1">Invite your team</h1>
                  <p className="text-af-muted text-[13px]">Add technicians and managers. They'll receive an email to set their password.</p>
                </div>

                <div className="space-y-2">
                  {inviteRows.map((row, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="email"
                        placeholder="team@acme-mfg.com"
                        value={row.email}
                        onChange={e => {
                          const next = [...inviteRows]
                          next[i] = { ...next[i], email: e.target.value }
                          setInviteRows(next)
                        }}
                        className="flex-1 h-9 px-3 rounded border border-af-border bg-white text-[13px] outline-none focus:border-af-focus focus:shadow-focus transition-[border-color,box-shadow] duration-1"
                      />
                      <select
                        value={row.role}
                        onChange={e => {
                          const next = [...inviteRows]
                          next[i] = { ...next[i], role: e.target.value }
                          setInviteRows(next)
                        }}
                        className="h-9 px-2 rounded border border-af-border bg-white text-[13px] outline-none focus:border-af-focus focus:shadow-focus transition-[border-color,box-shadow] duration-1"
                      >
                        <option value="technician">Technician</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                      {inviteRows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setInviteRows(inviteRows.filter((_, j) => j !== i))}
                          className="h-9 w-9 flex items-center justify-center rounded border border-af-border text-af-muted hover:text-af-crit-600 hover:border-af-crit-100 transition-colors duration-1"
                        >×</button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setInviteRows([...inviteRows, { email: '', role: 'technician' }])}
                  className="text-[12px] text-af-orange-600 hover:underline"
                >
                  + Add another
                </button>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep(2)} className="h-9 px-5 rounded border border-af-border bg-white text-[13px] font-medium hover:bg-af-ink-050 transition-colors duration-1">
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={submitInvites}
                    disabled={submitting}
                    className="flex-1 h-9 bg-af-orange-500 hover:bg-af-orange-600 disabled:opacity-50 text-white text-[13px] font-medium rounded transition-colors duration-1"
                  >
                    {submitting ? 'Setting up…' : 'Finish setup →'}
                  </button>
                  <button type="button" onClick={submitInvites} disabled={submitting} className="h-9 px-5 rounded border border-af-border bg-white text-[13px] text-af-muted hover:text-af-fg transition-colors duration-1">
                    Skip
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 4 — Done ───────────────────────────── */}
            {step === 4 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-af-ok-100 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle weight="fill" size={32} className="text-af-ok-600" />
                </div>
                <h1 className="text-2xl font-semibold tracking-[-0.015em] mb-2">You're all set!</h1>
                <p className="text-af-muted text-[13px] mb-8 max-w-xs mx-auto">
                  Your AssetFlow workspace is ready. Start by exploring the dashboard or importing your assets.
                </p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="h-9 px-8 bg-af-orange-500 hover:bg-af-orange-600 text-white text-[13px] font-medium rounded transition-colors duration-1"
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
