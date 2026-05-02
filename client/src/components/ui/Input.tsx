import { forwardRef } from 'react'
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const base =
  'w-full h-9 px-3 rounded border border-af-border bg-white text-[13px] text-af-fg placeholder:text-af-subtle outline-none focus:border-af-focus focus:shadow-focus transition-[border-color,box-shadow] duration-[120ms] disabled:opacity-50 disabled:cursor-not-allowed'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(base, className)} {...props} />
  ),
)
Input.displayName = 'Input'

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select ref={ref} className={cn(base, 'pr-8 appearance-none cursor-pointer', className)} {...props}>
      {children}
    </select>
  ),
)
Select.displayName = 'Select'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full px-3 py-2 rounded border border-af-border bg-white text-[13px] text-af-fg placeholder:text-af-subtle outline-none focus:border-af-focus focus:shadow-focus transition-[border-color,box-shadow] duration-[120ms] resize-none disabled:opacity-50',
        className,
      )}
      rows={3}
      {...props}
    />
  ),
)
Textarea.displayName = 'Textarea'

// ── Field wrapper ─────────────────────────────────────────
interface FieldProps {
  label: string
  error?: string
  required?: boolean
  hint?: string
  children: React.ReactNode
  className?: string
}

export function Field({ label, error, required, hint, children, className }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label className="font-mono text-[10px] tracking-[0.1em] uppercase text-af-muted">
        {label}{required && <span className="text-af-crit-600 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-af-muted">{hint}</p>}
      {error && <p className="text-[11px] text-af-crit-600">{error}</p>}
    </div>
  )
}
