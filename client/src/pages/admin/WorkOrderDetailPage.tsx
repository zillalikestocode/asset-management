import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, PencilSimple, CheckCircle,
  ChatCircle, Clock, Image, Trash,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useWorkOrder, useAddComment, useCompleteWorkOrder, useAddPhoto, useDeletePhoto } from '@/hooks/useWorkOrders'
import { useAssets } from '@/hooks/useAssets'
import { Card, CardHeader } from '@/components/ui/Card'
import { StatusPill, PriorityPill, IdTag } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { PageSpinner } from '@/components/ui/Spinner'
import { WorkOrderFormModal } from './WorkOrderFormModal'
import { formatDate, formatRelative, cn, initials, apiError } from '@/lib/utils'

export function WorkOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [showEdit, setShowEdit] = useState(false)
  const [comment, setComment] = useState('')
  const [completionNotes, setCompletionNotes] = useState('')
  const [showCompleteForm, setShowCompleteForm] = useState(false)
  const [actualHours, setActualHours] = useState('')
  const [showPhotoForm, setShowPhotoForm] = useState(false)
  const [photoUrl, setPhotoUrl] = useState('')
  const [photoFilename, setPhotoFilename] = useState('')

  const { data: wo, isLoading } = useWorkOrder(id ?? '')
  const { data: assetsData }    = useAssets({ perPage: 999 })
  const addComment              = useAddComment(id ?? '')
  const completeWO              = useCompleteWorkOrder()
  const addPhoto                = useAddPhoto(id ?? '')
  const deletePhoto             = useDeletePhoto(id ?? '')

  if (isLoading || !wo) return <PageSpinner />

  const isDone = wo.status === 'completed' || wo.status === 'cancelled'
  const displayCode = `WO-${wo.id.slice(0, 6).toUpperCase()}`

  const handleComment = async () => {
    if (!comment.trim()) return
    try {
      await addComment.mutateAsync(comment.trim())
      setComment('')
      toast.success('Comment added')
    } catch (err) {
      toast.error(apiError(err))
    }
  }

  const handleComplete = async () => {
    try {
      await completeWO.mutateAsync({
        id: id!,
        notes: completionNotes || undefined,
        actualHours: actualHours ? Number(actualHours) : undefined,
      })
      setShowCompleteForm(false)
      toast.success('Work order completed')
    } catch (err) {
      toast.error(apiError(err))
    }
  }

  const handleAddPhoto = async () => {
    if (!photoUrl.trim()) return
    try {
      await addPhoto.mutateAsync({ url: photoUrl.trim(), filename: photoFilename.trim() || 'photo' })
      setPhotoUrl('')
      setPhotoFilename('')
      setShowPhotoForm(false)
      toast.success('Photo added')
    } catch (err) {
      toast.error(apiError(err))
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/work-orders')}
            className="w-8 h-8 flex items-center justify-center rounded border border-af-border text-af-muted hover:text-af-fg hover:bg-af-ink-050 transition-colors duration-[120ms]"
          >
            <ArrowLeft size={15} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <IdTag>{displayCode}</IdTag>
              <PriorityPill priority={wo.priority} />
              <StatusPill status={wo.status} />
            </div>
            <h1 className="text-2xl font-semibold tracking-[-0.015em]">{wo.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isDone && (
            <Button variant="accent" size="sm" onClick={() => setShowCompleteForm(v => !v)}>
              <CheckCircle size={13} className="mr-1" />Mark complete
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={() => setShowEdit(true)}>
            <PencilSimple size={13} className="mr-1" />Edit
          </Button>
        </div>
      </div>

      {/* Complete form inline */}
      {showCompleteForm && (
        <Card>
          <CardHeader title="Complete work order" />
          <div className="space-y-3">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.1em] text-af-muted block mb-1.5">Completion notes</label>
              <Textarea
                value={completionNotes}
                onChange={e => setCompletionNotes(e.target.value)}
                placeholder="Describe what was done…"
                rows={3}
              />
            </div>
            <div className="flex items-end gap-4">
              <div className="w-40">
                <label className="font-mono text-[10px] uppercase tracking-[0.1em] text-af-muted block mb-1.5">Actual hours</label>
                <input
                  type="number"
                  step="0.5"
                  value={actualHours}
                  onChange={e => setActualHours(e.target.value)}
                  placeholder="0"
                  className="w-full h-9 px-3 rounded border border-af-border text-[13px] outline-none focus:border-af-focus focus:shadow-focus transition-[border-color,box-shadow] duration-[120ms]"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setShowCompleteForm(false)}>Cancel</Button>
                <Button variant="accent" size="sm" onClick={handleComplete} disabled={completeWO.isPending}>
                  {completeWO.isPending ? 'Saving…' : 'Confirm complete'}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Left: main info */}
        <div className="xl:col-span-2 space-y-5">
          <Card>
            <CardHeader title="Details" />
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
              {[
                { label: 'Asset',      value: wo.asset ? `${wo.asset.assetCode} — ${wo.asset.name}` : '—' },
                { label: 'Assignee',   value: wo.assignedTo?.name ?? 'Unassigned' },
                { label: 'Created by', value: wo.createdBy?.name ?? '—' },
                { label: 'Due date',   value: wo.dueDate ? formatDate(wo.dueDate) : '—' },
                { label: 'Estimated',  value: wo.estimatedHours ? `${wo.estimatedHours}h` : '—' },
                { label: 'Actual',     value: wo.actualHours ? `${wo.actualHours}h` : '—' },
                { label: 'Created',    value: formatDate(wo.createdAt) },
                { label: 'Completed',  value: wo.completedAt ? formatDate(wo.completedAt) : '—' },
              ].map(row => (
                <div key={row.label}>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-af-muted mb-0.5">{row.label}</dt>
                  <dd className="text-[13px]">{row.value}</dd>
                </div>
              ))}
            </dl>

            {wo.description && (
              <div className="mt-4 pt-4 border-t border-af-border">
                <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-af-muted mb-1.5">Description</p>
                <p className="text-[13px] text-af-fg leading-relaxed whitespace-pre-wrap">{wo.description}</p>
              </div>
            )}

            {wo.completionNotes && (
              <div className="mt-4 pt-4 border-t border-af-border">
                <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-af-muted mb-1.5">Completion notes</p>
                <p className="text-[13px] text-af-fg leading-relaxed whitespace-pre-wrap">{wo.completionNotes}</p>
              </div>
            )}
          </Card>

          {/* Comments */}
          <Card padding={false}>
            <div className="px-4 pt-4 pb-0 border-b border-af-border">
              <CardHeader
                title="Comments"
                subtitle={`${(wo.comments ?? []).length} comments`}
              />
            </div>
            <div className="divide-y divide-af-border">
              {(wo.comments ?? []).length === 0
                ? <p className="py-8 text-center text-[13px] text-af-muted">No comments yet</p>
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
                      <p className="text-[13px] text-af-fg leading-relaxed">{c.body}</p>
                    </div>
                  </div>
                ))
              }
            </div>
            <div className="px-4 py-3 border-t border-af-border bg-af-ink-050">
              <Textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Add a comment…"
                rows={2}
              />
              <div className="flex justify-end mt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleComment}
                  disabled={!comment.trim() || addComment.isPending}
                >
                  <ChatCircle size={12} className="mr-1" />
                  {addComment.isPending ? 'Posting…' : 'Post comment'}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: photos + timeline */}
        <div className="space-y-5">
          <Card padding={false}>
            <div className="px-4 pt-4 pb-0 border-b border-af-border">
              <CardHeader
                title="Photos"
                subtitle={`${(wo.photos ?? []).length} attached`}
                actions={
                  <Button size="sm" variant="secondary" onClick={() => setShowPhotoForm(v => !v)}>
                    <Image size={12} className="mr-1" />Add photo
                  </Button>
                }
              />
            </div>

            {showPhotoForm && (
              <div className="px-4 py-3 bg-af-ink-050 border-b border-af-border space-y-2">
                <Input
                  value={photoUrl}
                  onChange={e => setPhotoUrl(e.target.value)}
                  placeholder="Photo URL…"
                />
                <Input
                  value={photoFilename}
                  onChange={e => setPhotoFilename(e.target.value)}
                  placeholder="Filename (optional)"
                />
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setShowPhotoForm(false)}>Cancel</Button>
                  <Button size="sm" variant="accent" onClick={handleAddPhoto} disabled={!photoUrl.trim() || addPhoto.isPending}>
                    {addPhoto.isPending ? 'Adding…' : 'Add'}
                  </Button>
                </div>
              </div>
            )}

            <div className="divide-y divide-af-border">
              {(wo.photos ?? []).length === 0
                ? <p className="py-8 text-center text-[13px] text-af-muted">No photos yet</p>
                : (wo.photos ?? []).map(photo => (
                  <div key={photo.id} className="flex items-center gap-2 px-4 py-3">
                    <Image size={13} className="text-af-muted flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <a href={photo.url} target="_blank" rel="noopener noreferrer"
                        className="text-[13px] truncate text-af-blue-600 hover:underline block">
                        {photo.filename}
                      </a>
                      <p className="font-mono text-[10px] text-af-muted">{formatRelative(photo.createdAt)}</p>
                    </div>
                    <button
                      onClick={() => deletePhoto.mutate(photo.id)}
                      className="text-af-muted hover:text-af-crit-600 transition-colors duration-[120ms]"
                    >
                      <Trash size={13} />
                    </button>
                  </div>
                ))
              }
            </div>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader title="Timeline" />
            <div className="space-y-3">
              {[
                { label: 'Created',   date: wo.createdAt,    active: true },
                { label: 'Due',       date: wo.dueDate,      active: !!wo.dueDate && new Date(wo.dueDate) < new Date() && !isDone },
                { label: 'Completed', date: wo.completedAt,  active: !!wo.completedAt },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={cn(
                    'w-2 h-2 rounded-full flex-shrink-0',
                    item.active ? 'bg-af-orange-500' : 'bg-af-ink-200',
                  )} />
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-af-muted">{item.label}</p>
                    {item.date
                      ? <p className="text-[12px] flex items-center gap-1"><Clock size={10} className="text-af-muted" />{formatDate(item.date)}</p>
                      : <p className="text-[12px] text-af-muted">—</p>
                    }
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <WorkOrderFormModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        assets={assetsData?.data ?? []}
        workOrder={wo}
      />
    </div>
  )
}
