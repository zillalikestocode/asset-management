import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Package, Wrench, ClipboardText, QrCode,
  ChartBar, ArrowRight, Check, Gauge, MapPin,
} from '@phosphor-icons/react'
import { useAuth } from '@/contexts/AuthContext'

// ── Data ──────────────────────────────────────────────────
const FEATURES = [
  {
    Icon: Package,
    title: 'Asset Registry',
    body: 'Every machine, vehicle, and tool in one searchable list. Full profile, edit history, custom fields, and printable QR labels.',
  },
  {
    Icon: Wrench,
    title: 'Maintenance Scheduling',
    body: 'Define PM schedules by time or usage. Work orders generate automatically — never let a service interval slip again.',
  },
  {
    Icon: ClipboardText,
    title: 'Work Orders',
    body: 'Open, assign, log, and close jobs from desktop or phone. Photo attachments, completion notes, and actual hours on every record.',
  },
  {
    Icon: QrCode,
    title: 'QR Scan & Field Log',
    body: "Technicians scan any asset's QR code with their phone, see its full history, and log work — no laptop required.",
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Register your assets',
    body: 'Import a CSV or add assets one by one. Attach photos, set custom fields, and print QR labels in under an hour.',
  },
  {
    n: '02',
    title: 'Define your schedules',
    body: 'Set time-based or usage-based PM intervals per asset or category. Assign defaults, lead times, and let AssetFlow take it from there.',
  },
  {
    n: '03',
    title: 'Put your team to work',
    body: 'Technicians scan, receive work orders, and log completions from their phone. You see progress in real time.',
  },
]

const PLANS = [
  {
    name: 'Starter',
    price: '$49',
    per: '/month',
    tagline: 'For small teams getting off spreadsheets.',
    features: ['5 seats', '500 assets', 'Asset registry & QR labels', 'Work orders & maintenance', 'Email alerts'],
    cta: 'Start free trial',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$149',
    per: '/month',
    tagline: 'For growing operations that need more.',
    features: ['25 seats', 'Unlimited assets', 'Everything in Starter', 'GPS last-location tracking', 'Advanced reports & CSV export', 'Priority support'],
    cta: 'Start free trial',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    per: '',
    tagline: 'For large plants with complex requirements.',
    features: ['Unlimited seats', 'Unlimited assets', 'Everything in Pro', 'SSO / SAML', 'Dedicated CSM', 'SLA & on-prem option'],
    cta: 'Talk to sales',
    highlight: false,
  },
]

// ── Product mock (mini app preview) ──────────────────────
function ProductMock() {
  return (
    <div className="w-full max-w-[580px] rounded-xl border border-af-border shadow-3 overflow-hidden bg-af-surface select-none pointer-events-none">
      {/* Browser chrome */}
      <div className="h-8 bg-af-ink-800 border-b border-white/10 flex items-center px-3 gap-2 flex-shrink-0">
        <div className="flex gap-1.5">
          {['bg-af-crit-600', 'bg-af-warn-500', 'bg-af-ok-500'].map(c => (
            <span key={c} className={`w-[9px] h-[9px] rounded-full opacity-60 ${c}`} />
          ))}
        </div>
        <div className="flex-1 mx-3 h-[18px] bg-white/10 rounded-sm flex items-center px-2">
          <span className="text-[9px] text-white/50 font-mono tracking-wide">assetflow.app/assets</span>
        </div>
      </div>

      {/* App shell */}
      <div className="flex" style={{ height: 340 }}>
        {/* Sidebar */}
        <div className="w-10 bg-af-ink-900 flex flex-col items-center py-3 gap-0.5 flex-shrink-0">
          {/* Logo dot */}
          <div className="w-6 h-6 rounded flex items-center justify-center mb-3">
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
              <path d="M3 10L3 6L8 4L13 6L13 10L8 12Z" stroke="#FAFAF9" strokeWidth="0.9" strokeLinejoin="round"/>
              <path d="M3 6L8 8L13 6" stroke="#FAFAF9" strokeWidth="0.9" strokeLinejoin="round"/>
              <path d="M8 8L8 12" stroke="#FAFAF9" strokeWidth="0.9"/>
              <circle cx="8" cy="8" r="1" fill="#FF6B35"/>
            </svg>
          </div>
          {[
            { Icon: Gauge, active: false },
            { Icon: Package, active: true },
            { Icon: Wrench, active: false },
            { Icon: ClipboardText, active: false },
            { Icon: ChartBar, active: false },
          ].map(({ Icon, active }, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${active ? 'bg-af-ink-700' : ''}`}
            >
              <Icon size={15} color={active ? '#FF6B35' : '#4A5260'} />
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 bg-af-bg flex flex-col min-w-0">
          {/* Page header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-af-surface border-b border-af-border flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold text-af-fg tracking-tight">Assets</span>
              <span className="text-[9px] font-mono bg-af-ink-100 text-af-muted px-1.5 py-0.5 rounded">47</span>
            </div>
            <div className="h-5 px-2 bg-af-ink-900 text-white text-[9px] font-medium rounded flex items-center gap-1">
              <span className="text-af-orange-500 font-bold">+</span>
              <span>Add Asset</span>
            </div>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-3 gap-2 p-3 flex-shrink-0">
            {[
              { label: 'Total Assets', value: '47', cls: 'text-af-fg' },
              { label: 'Active', value: '43', cls: 'text-af-ok-600' },
              { label: 'Due Soon', value: '3', cls: 'text-af-warn-600' },
            ].map(({ label, value, cls }) => (
              <div key={label} className="bg-af-surface rounded-md border border-af-border p-2.5">
                <div className={`text-[20px] font-semibold leading-none tracking-tight ${cls}`}>{value}</div>
                <div className="text-[9px] text-af-muted mt-1 font-mono uppercase tracking-wider">{label}</div>
              </div>
            ))}
          </div>

          {/* Asset table */}
          <div className="mx-3 bg-af-surface rounded-md border border-af-border overflow-hidden flex-1 min-h-0">
            {/* Table head */}
            <div className="grid px-3 py-1.5 border-b border-af-border bg-af-ink-050"
              style={{ gridTemplateColumns: '80px 1fr auto 72px' }}>
              {['Code', 'Name', 'Status', 'Location'].map(h => (
                <span key={h} className="text-[8px] font-mono uppercase tracking-widest text-af-subtle">{h}</span>
              ))}
            </div>
            {/* Rows */}
            {[
              { code: 'AF-0042', name: 'Hydraulic Press H4',  status: 'Active',      sCls: 'bg-af-ok-100 text-af-ok-600',   loc: 'B1 · F2' },
              { code: 'AF-0019', name: 'CNC Milling Machine', status: 'Active',      sCls: 'bg-af-ok-100 text-af-ok-600',   loc: 'B2 · F1' },
              { code: 'AF-0031', name: 'Fork Lift FL-03',     status: 'Due Soon',    sCls: 'bg-af-warn-100 text-af-warn-600', loc: 'Yard' },
              { code: 'AF-0055', name: 'Air Compressor AC-1', status: 'Maintenance', sCls: 'bg-af-crit-100 text-af-crit-600', loc: 'B1 · F3' },
              { code: 'AF-0038', name: 'Welding Station W2',  status: 'Active',      sCls: 'bg-af-ok-100 text-af-ok-600',   loc: 'B3 · F1' },
            ].map(({ code, name, status, sCls, loc }) => (
              <div
                key={code}
                className="grid items-center px-3 py-2 border-b border-af-border last:border-0"
                style={{ gridTemplateColumns: '80px 1fr auto 72px' }}
              >
                <span className="text-[9px] font-mono text-af-muted">{code}</span>
                <span className="text-[10px] text-af-fg font-medium truncate pr-2">{name}</span>
                <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded-pill whitespace-nowrap ${sCls}`}>{status}</span>
                <span className="text-[9px] font-mono text-af-muted pl-2">{loc}</span>
              </div>
            ))}
          </div>

          {/* Bottom padding */}
          <div className="h-3 flex-shrink-0" />
        </div>
      </div>
    </div>
  )
}

// ── Nav ───────────────────────────────────────────────────
function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-af-border">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2.5 mr-auto">
          <img src="/logo-mark.svg" alt="AssetFlow" className="w-7 h-7" />
          <span className="font-semibold text-[15px] tracking-[-0.01em] text-af-fg">AssetFlow</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {['Features', 'How it works', 'Pricing'].map(label => (
            <a
              key={label}
              href={`#${label.toLowerCase().replace(/ /g, '-')}`}
              className="text-[13px] text-af-muted hover:text-af-fg transition-colors duration-1"
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden sm:block text-[13px] text-af-muted hover:text-af-fg transition-colors duration-1"
          >
            Sign in
          </Link>
          <Link
            to="/onboarding"
            className="h-8 px-4 bg-af-orange-500 text-white text-[13px] font-medium rounded hover:bg-af-orange-600 transition-colors duration-1 flex items-center gap-1.5"
          >
            Get started
            <ArrowRight size={13} weight="bold" />
          </Link>
        </div>
      </div>
    </header>
  )
}

// ── Hero ──────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative bg-af-ink-900 overflow-hidden">
      {/* Blueprint grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right,  rgba(250,250,249,.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(250,250,249,.04) 1px, transparent 1px),
            linear-gradient(to right,  rgba(250,250,249,.07) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(250,250,249,.07) 1px, transparent 1px)
          `,
          backgroundSize: '8px 8px, 8px 8px, 64px 64px, 64px 64px',
        }}
      />
      {/* Orange glow accent — far top right */}
      <div
        className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,107,53,.07) 0%, transparent 70%)' }}
      />

      <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-0 lg:pt-24">
        <div className="flex flex-col lg:flex-row lg:items-center gap-12 lg:gap-16">
          {/* Left — text */}
          <div className="flex-1 min-w-0">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 mb-5">
              <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-af-orange-500">
                Asset Management
              </span>
              <span className="text-af-ink-700">·</span>
              <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-af-ink-500">
                Manufacturing SMEs
              </span>
            </div>

            <h1 className="text-white text-[38px] sm:text-[48px] font-semibold leading-[1.05] tracking-[-0.025em] mb-5">
              Keep every asset<br />accounted for.
            </h1>

            <p className="text-af-ink-400 text-[15px] leading-relaxed mb-8 max-w-[480px]">
              Track assets, schedule maintenance, and close work orders — for manufacturing teams of 10 to 500. No more spreadsheets, no more missed PMs.
            </p>

            <div className="flex flex-wrap gap-3 mb-12">
              <Link
                to="/onboarding"
                className="h-10 px-5 bg-af-orange-500 text-white text-[13px] font-medium rounded hover:bg-af-orange-600 transition-colors duration-1 flex items-center gap-2"
              >
                Start free trial
                <ArrowRight size={14} weight="bold" />
              </Link>
              <a
                href="#how-it-works"
                className="h-10 px-5 bg-white/10 text-white text-[13px] font-medium rounded hover:bg-white/15 transition-colors duration-1 flex items-center gap-2 border border-white/15"
              >
                See how it works
              </a>
            </div>

            {/* Stats strip */}
            <div className="flex flex-wrap gap-6 pb-10 border-b border-white/10">
              {[
                { value: '200+', label: 'Manufacturing teams' },
                { value: '50k+', label: 'Assets tracked' },
                { value: '99.9%', label: 'Uptime SLA' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <div className="text-[22px] font-semibold text-white tracking-tight leading-none">{value}</div>
                  <div className="text-[11px] text-af-ink-500 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — product mock */}
          <div className="flex-1 lg:max-w-[580px] flex justify-center lg:justify-end pb-12 lg:pb-0 lg:-mb-8">
            <ProductMock />
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Features ──────────────────────────────────────────────
function Features() {
  return (
    <section id="features" className="bg-af-surface py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="max-w-lg mb-14">
          <p className="font-mono text-[9px] tracking-[0.18em] uppercase text-af-orange-500 mb-3">Features</p>
          <h2 className="text-[28px] sm:text-[32px] font-semibold tracking-[-0.02em] text-af-fg leading-tight mb-3">
            Everything your floor needs.
          </h2>
          <p className="text-af-muted text-[14px] leading-relaxed">
            Built for the operations teams that keep manufacturing plants running — not general-purpose project trackers.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(({ Icon, title, body }) => (
            <div
              key={title}
              className="bg-af-bg rounded-lg border border-af-border p-5 hover:border-af-border-strong hover:shadow-1 transition-all duration-2"
            >
              <div className="w-9 h-9 bg-af-ink-900 rounded-md flex items-center justify-center mb-4">
                <Icon size={18} color="#FF6B35" />
              </div>
              <h3 className="text-[14px] font-semibold text-af-fg mb-1.5">{title}</h3>
              <p className="text-[12px] text-af-muted leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        {/* Secondary callouts */}
        <div className="mt-4 grid sm:grid-cols-3 gap-4">
          {[
            { Icon: MapPin, label: 'GPS last-location tracking' },
            { Icon: ChartBar, label: 'Live dashboards & PDF reports' },
            { Icon: Gauge, label: 'Asset health at a glance' },
          ].map(({ Icon, label }) => (
            <div key={label} className="flex items-center gap-3 bg-af-bg rounded-lg border border-af-border px-4 py-3">
              <div className="w-7 h-7 bg-af-ink-100 rounded flex items-center justify-center flex-shrink-0">
                <Icon size={14} color="#4A5260" />
              </div>
              <span className="text-[12px] text-af-muted font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── How It Works ──────────────────────────────────────────
function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-af-ink-050 border-y border-af-border py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-lg mb-14">
          <p className="font-mono text-[9px] tracking-[0.18em] uppercase text-af-orange-500 mb-3">How it works</p>
          <h2 className="text-[28px] sm:text-[32px] font-semibold tracking-[-0.02em] text-af-fg leading-tight mb-3">
            Up and running in a day.
          </h2>
          <p className="text-af-muted text-[14px] leading-relaxed">
            No six-month implementation. No consultants. Import your assets, configure your schedules, and send your team into the field.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {STEPS.map(({ n, title, body }, i) => (
            <div key={n} className="relative">
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className="hidden sm:block absolute top-5 left-[calc(50%+20px)] right-[-50%] h-px border-t border-dashed border-af-border-strong z-0" />
              )}
              <div className="relative z-10 bg-af-surface rounded-lg border border-af-border p-6 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-[11px] text-af-orange-500 tracking-wider">{n}</span>
                  <div className="flex-1 h-px bg-af-border" />
                </div>
                <h3 className="text-[15px] font-semibold text-af-fg mb-2">{title}</h3>
                <p className="text-[12px] text-af-muted leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Pricing ───────────────────────────────────────────────
function Pricing() {
  return (
    <section id="pricing" className="bg-af-surface py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-lg mb-14">
          <p className="font-mono text-[9px] tracking-[0.18em] uppercase text-af-orange-500 mb-3">Pricing</p>
          <h2 className="text-[28px] sm:text-[32px] font-semibold tracking-[-0.02em] text-af-fg leading-tight mb-3">
            Simple, seat-based pricing.
          </h2>
          <p className="text-af-muted text-[14px] leading-relaxed">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {PLANS.map(({ name, price, per, tagline, features, cta, highlight }) => (
            <div
              key={name}
              className={`relative rounded-lg border flex flex-col ${
                highlight
                  ? 'bg-af-ink-900 border-af-orange-500 shadow-2'
                  : 'bg-af-bg border-af-border'
              }`}
            >
              {highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="font-mono text-[9px] tracking-[0.14em] uppercase bg-af-orange-500 text-white px-2.5 py-1 rounded-pill">
                    Most popular
                  </span>
                </div>
              )}

              <div className="p-6 border-b border-current/10 flex-shrink-0" style={{ borderColor: highlight ? 'rgba(255,255,255,.1)' : undefined }}>
                <div className={`text-[11px] font-semibold mb-1 ${highlight ? 'text-af-orange-500' : 'text-af-muted'}`}>
                  {name}
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className={`text-[32px] font-semibold leading-none tracking-tight ${highlight ? 'text-white' : 'text-af-fg'}`}>
                    {price}
                  </span>
                  {per && (
                    <span className={`text-[12px] ${highlight ? 'text-af-ink-400' : 'text-af-muted'}`}>{per}</span>
                  )}
                </div>
                <p className={`text-[12px] leading-relaxed ${highlight ? 'text-af-ink-400' : 'text-af-muted'}`}>
                  {tagline}
                </p>
              </div>

              <ul className="p-6 flex-1 space-y-2.5">
                {features.map(f => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check
                      size={13}
                      weight="bold"
                      color={highlight ? '#FF6B35' : '#4D8B1A'}
                      className="mt-0.5 flex-shrink-0"
                    />
                    <span className={`text-[12px] leading-relaxed ${highlight ? 'text-af-ink-300' : 'text-af-muted'}`}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="px-6 pb-6">
                <Link
                  to={name === 'Enterprise' ? '/contact' : '/onboarding'}
                  className={`flex items-center justify-center gap-2 h-9 rounded text-[13px] font-medium transition-colors duration-1 ${
                    highlight
                      ? 'bg-af-orange-500 text-white hover:bg-af-orange-600'
                      : 'bg-af-ink-900 text-white hover:bg-af-ink-800'
                  }`}
                >
                  {cta}
                  <ArrowRight size={13} weight="bold" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-[12px] text-af-muted mt-8">
          Need a custom seat count or an annual quote?{' '}
          <a href="mailto:sales@assetflow.app" className="text-af-fg hover:underline">
            Talk to us
          </a>
          .
        </p>
      </div>
    </section>
  )
}

// ── CTA Banner ────────────────────────────────────────────
function CtaBanner() {
  return (
    <section className="relative bg-af-ink-900 overflow-hidden py-20 lg:py-28">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right,  rgba(250,250,249,.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(250,250,249,.03) 1px, transparent 1px),
            linear-gradient(to right,  rgba(250,250,249,.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(250,250,249,.06) 1px, transparent 1px)
          `,
          backgroundSize: '8px 8px, 8px 8px, 64px 64px, 64px 64px',
        }}
      />
      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <p className="font-mono text-[9px] tracking-[0.18em] uppercase text-af-orange-500 mb-4">
          Get started today
        </p>
        <h2 className="text-white text-[28px] sm:text-[38px] font-semibold tracking-[-0.02em] leading-tight mb-4">
          Ready to get off the spreadsheet?
        </h2>
        <p className="text-af-ink-400 text-[14px] leading-relaxed mb-8 max-w-lg mx-auto">
          Set up your organisation in minutes. 14-day free trial on all plans. No credit card required.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/onboarding"
            className="h-10 px-6 bg-af-orange-500 text-white text-[13px] font-medium rounded hover:bg-af-orange-600 transition-colors duration-1 flex items-center gap-2"
          >
            Start free trial
            <ArrowRight size={14} weight="bold" />
          </Link>
          <Link
            to="/login"
            className="h-10 px-6 bg-white/10 text-white text-[13px] font-medium rounded hover:bg-white/15 transition-colors duration-1 flex items-center border border-white/15"
          >
            Sign in
          </Link>
        </div>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-af-ink-900 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <img src="/logo-mark.svg" alt="AssetFlow" className="w-6 h-6" />
            <span className="font-semibold text-[13px] text-white tracking-tight">AssetFlow</span>
            <span className="font-mono text-[9px] text-af-ink-600 ml-1">
              © {new Date().getFullYear()}
            </span>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {[
              { label: 'Features', href: '#features' },
              { label: 'Pricing', href: '#pricing' },
              { label: 'Sign in', href: '/login' },
              { label: 'Get started', href: '/onboarding' },
            ].map(({ label, href }) => (
              href.startsWith('#') ? (
                <a key={label} href={href} className="text-[12px] text-af-ink-500 hover:text-af-ink-300 transition-colors duration-1">
                  {label}
                </a>
              ) : (
                <Link key={label} to={href} className="text-[12px] text-af-ink-500 hover:text-af-ink-300 transition-colors duration-1">
                  {label}
                </Link>
              )
            ))}
          </nav>
        </div>

        <div className="mt-6 pt-6 border-t border-white/5 flex flex-wrap gap-x-6 gap-y-1">
          <p className="text-[11px] text-af-ink-700 font-mono">
            Asset registry · Work orders · Maintenance scheduling · QR scanning · Reports
          </p>
        </div>
      </div>
    </footer>
  )
}

// ── Page ──────────────────────────────────────────────────
export function LandingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate(user.role === 'technician' ? '/tech' : '/dashboard', { replace: true })
    }
  }, [user, navigate])

  return (
    <div className="min-h-screen bg-af-bg antialiased">
      <Nav />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  )
}
