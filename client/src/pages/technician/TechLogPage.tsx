import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, ChatCircle, Clock } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useWorkOrder, useCompleteWorkOrder, useAddComment } from '@/hooks/useWorkOrders'
import { StatusPill, PriorityPill } from '@/components/ui/Badge'
import { PageSpinner } from '@/components/ui/Spinner'
import { formatDate, formatRelative, initials, cn } from '@/lib/utils'

export function TechLogPage() {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [comment, setComment]       = useState('')
  const [actualHours, setActualHours] = useState('')
  const [notes, setNotes]           = useState('')
  const [showComplete, setShowComplete] = useState(false)

  const { data: wo, isLoading } = useWorkOrder(id ?? '')
  const addComment   = useAddComment(id ?? '')
  const completeWO   = useCompleteWorkOrder()

  if (isLoading || !wo) return <PageSpinner />

  const isDone = wo.status === 'completed' || wo.status === 'cancelled'

  const handleComment = async () => {
    if (!comment.trim()) return
    try {
      await addComment.mutateAsync(comment.trim())
      setComment('')
      toast.success('Comment added')
    } catch { toast.error('Failed') }
  }

  const handleComplete = async () => {
    try {
      await completeWO.mutateAsync({
        id: id!,
        notes: notes || undefined,
        actualHours: actualHours ? Number(actualHours) : undefined,
      })
      toast.success('Work order completed!')
      navigate('/tech/work-orders')
    } catch { toast.error('Failed to complete') }
  }

  return (
    <div className="p-5 space-y-5 pb-8">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl border border-af-border text-af-muted hover:bg-af-ink-050 transition-colors duration-[120ms] mt-0.5"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <PriorityPill priority={wo.priority} />
            <StatusPill status={wo.status} />
          </div>
          <h1 className="text-[18px] font-semibold leading-snug">{wo.title}</h1>
          <p className="text-[12px] text-af-muted mt-0.5">{wo.asset?.name ?? '—'}</p>
        </div>
      </div>

      {/* Due date */}
      <div className={cn(
        'flex items-center gap-2 p-3 rounded-xl border font-mono text-[12px]',
        !!wo.dueDate && new Date(wo.dueDate) < new Date() && !isDone
          ? 'border-af-crit-200 bg-af-crit-050 text-af-crit-600'
          : 'border-af-border bg-white text-af-muted',
      )}>
        <Clock size={14} />
        Due {wo.dueDate ? formatDate(wo.dueDate) : '—'}
      </div>

      {/* Description */}
      {wo.description && (
        <div className="rounded-xl border border-af-border bg-white p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-af-muted mb-2">Instructions</p>
          <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{wo.description}</p>
        </div>
      )}

      {/* Comments */}
      <div className="rounded-xl border border-af-border bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-af-border">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-af-muted">Log / Comments</p>
        </div>
        <div className="divide-y divide-af-border">
          {(wo.comments ?? []).length === 0
            ? <p className="py-6 text-center text-[13px] text-af-muted">No entries yet</p>
            : (wo.comments ?? []).map(c => (
              <div key={c.id} className="flex gap-3 px-4 py-3">
                <div className="w-7 h-7 rounded-[5px] bg-gradient-to-br from-af-orange-500 to-af-orange-600 flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0">
                  {initials(c.author)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[13px] font-medium">{c.author}</span>
                    <span className="font-mono text-[10px] text-af-muted">{formatRelative(c.createdAt)}</span>
                  </div>
                  <p className="text-[13px]">{c.body}</p>
                </div>
              </div>
            ))
          }
        </div>
        <div className="px-4 py-3 border-t border-af-border bg-af-ink-050">
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Add a log entry…"
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-af-border bg-white text-[14px] outline-none focus:border-af-focus resize-none"
          />
          <button
            onClick={handleComment}
            disabled={!comment.trim() || addComment.isPending}
            className="mt-2 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] px-3 py-1.5 rounded-lg border border-af-border bg-white hover:bg-af-ink-050 text-af-muted disabled:opacity-50 transition-colors duration-[120ms]"
          >
            <ChatCircle size={12} />Post
          </button>
        </div>
      </div>

      {/* Complete */}
      {!isDone && (
        <div>
          {!showComplete ? (
            <button
              onClick={() => setShowComplete(true)}
              className="w-full h-12 rounded-xl bg-af-orange-500 text-white text-[15px] font-semibold flex items-center justify-center gap-2 hover:bg-af-orange-600 transition-colors duration-[120ms]"
            >
              <CheckCircle size={18} />Mark as complete
            </button>
          ) : (
            <div className="rounded-xl border border-af-border bg-white p-4 space-y-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-af-muted">Complete work order</p>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Completion notes…"
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-af-border text-[14px] outline-none focus:border-af-focus resize-none"
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={actualHours}
                  onChange={e => setActualHours(e.target.value)}
                  placeholder="Hours spent"
                  className="w-32 h-10 px-3 rounded-lg border border-af-border text-[14px] outline-none focus:border-af-focus"
                />
                <span className="text-[13px] text-af-muted">hours</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowComplete(false)}
                  className="flex-1 h-11 rounded-xl border border-af-border text-[14px] font-medium hover:bg-af-ink-050 transition-colors duration-[120ms]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleComplete}
                  disabled={completeWO.isPending}
                  className="flex-1 h-11 rounded-xl bg-af-orange-500 text-white text-[14px] font-semibold hover:bg-af-orange-600 disabled:opacity-50 transition-colors duration-[120ms]"
                >
                  {completeWO.isPending ? 'Saving…' : 'Confirm'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
