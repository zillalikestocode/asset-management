import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ArrowLeft, Warning } from '@phosphor-icons/react'
import { useAsset } from '@/hooks/useAssets'
import { useCreateIssue } from '@/hooks/useIssues'
import { apiError } from '@/lib/utils'
import { PageSpinner } from '@/components/ui/Spinner'

const schema = z.object({
  title:       z.string().min(3, 'Title is required'),
  severity:    z.enum(['low', 'medium', 'critical']),
  description: z.string().min(10, 'Please describe the issue (at least 10 characters)'),
})
type FormValues = z.infer<typeof schema>

export function TechReportIssuePage() {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: asset, isLoading } = useAsset(id ?? '')
  const createIssue = useCreateIssue()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { severity: 'medium' },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      await createIssue.mutateAsync({ assetId: id!, ...values })
      toast.success('Issue reported')
      navigate(-1)
    } catch (err) {
      toast.error(apiError(err))
    }
  }

  if (isLoading || !asset) return <PageSpinner />

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-af-border text-af-muted hover:bg-af-ink-050 transition-colors duration-[120ms]"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-af-muted">{asset.assetCode}</p>
          <h1 className="text-[20px] font-semibold tracking-[-0.015em]">Report issue</h1>
        </div>
      </div>

      {/* Asset info */}
      <div className="flex items-center gap-3 p-3 rounded-xl border border-af-border bg-white">
        <div className="w-10 h-10 rounded-lg bg-af-crit-100 flex items-center justify-center">
          <Warning size={18} className="text-af-crit-600" />
        </div>
        <div>
          <p className="text-[15px] font-semibold">{asset.name}</p>
          <p className="text-[12px] text-af-muted">{asset.location?.name ?? 'No location'}</p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div>
          <label className="font-mono text-[10px] uppercase tracking-[0.1em] text-af-muted block mb-2">
            Title <span className="text-af-crit-600">*</span>
          </label>
          <input
            {...register('title')}
            placeholder="e.g. Unusual noise from motor"
            className="w-full h-11 px-4 rounded-xl border border-af-border bg-white text-[15px] outline-none focus:border-af-focus"
          />
          {errors.title && <p className="text-[11px] text-af-crit-600 mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="font-mono text-[10px] uppercase tracking-[0.1em] text-af-muted block mb-2">
            Severity <span className="text-af-crit-600">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['low', 'medium', 'critical'] as const).map(sev => (
              <label key={sev} className="cursor-pointer">
                <input type="radio" value={sev} {...register('severity')} className="sr-only peer" />
                <div className={`
                  peer-checked:ring-2 peer-checked:ring-af-orange-500
                  p-3 rounded-xl border border-af-border bg-white text-center
                  transition-all duration-[120ms]
                  ${sev === 'critical' ? 'peer-checked:border-af-crit-500 peer-checked:bg-af-crit-050' : ''}
                `}>
                  <p className="text-[13px] font-semibold capitalize">{sev}</p>
                </div>
              </label>
            ))}
          </div>
          {errors.severity && <p className="text-[11px] text-af-crit-600 mt-1">{errors.severity.message}</p>}
        </div>

        <div>
          <label className="font-mono text-[10px] uppercase tracking-[0.1em] text-af-muted block mb-2">
            Description <span className="text-af-crit-600">*</span>
          </label>
          <textarea
            {...register('description')}
            rows={5}
            placeholder="Describe the issue in detail — what you observed, when it started, any unusual sounds or behavior…"
            className="w-full px-4 py-3 rounded-xl border border-af-border bg-white text-[15px] outline-none focus:border-af-focus resize-none leading-relaxed"
          />
          {errors.description && <p className="text-[11px] text-af-crit-600 mt-1">{errors.description.message}</p>}
        </div>
      </div>

      <button
        onClick={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        className="w-full h-12 rounded-xl bg-af-crit-600 text-white text-[15px] font-semibold flex items-center justify-center gap-2 hover:bg-af-crit-700 disabled:opacity-50 transition-colors duration-[120ms]"
      >
        <Warning size={16} />
        {isSubmitting ? 'Submitting…' : 'Submit report'}
      </button>
    </div>
  )
}
