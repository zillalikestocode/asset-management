import { cn } from '@/lib/utils'
import { CaretLeft, CaretRight } from '@phosphor-icons/react'

interface PaginationProps {
  page: number
  total: number
  perPage: number
  onChange: (page: number) => void
}

export function Pagination({ page, total, perPage, onChange }: PaginationProps) {
  const totalPages = Math.ceil(total / perPage)
  if (totalPages <= 1) return null

  const from = (page - 1) * perPage + 1
  const to   = Math.min(page * perPage, total)

  return (
    <div className="flex items-center justify-between px-3 py-2.5 border-t border-af-border">
      <span className="font-mono text-[11px] text-af-muted">
        {from}–{to} of {total}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className={cn(
            'w-7 h-7 flex items-center justify-center rounded border border-af-border text-af-muted',
            'hover:bg-af-ink-050 hover:text-af-fg transition-colors duration-[120ms]',
            'disabled:opacity-40 disabled:cursor-not-allowed',
          )}
        >
          <CaretLeft size={13} />
        </button>

        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={cn(
              'w-7 h-7 flex items-center justify-center rounded font-mono text-[11px] transition-colors duration-[120ms]',
              p === page
                ? 'bg-af-ink-900 text-white border border-af-ink-900'
                : 'border border-af-border text-af-muted hover:bg-af-ink-050 hover:text-af-fg',
            )}
          >
            {p}
          </button>
        ))}

        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className={cn(
            'w-7 h-7 flex items-center justify-center rounded border border-af-border text-af-muted',
            'hover:bg-af-ink-050 hover:text-af-fg transition-colors duration-[120ms]',
            'disabled:opacity-40 disabled:cursor-not-allowed',
          )}
        >
          <CaretRight size={13} />
        </button>
      </div>
    </div>
  )
}
