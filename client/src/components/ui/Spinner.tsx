import { cn } from '@/lib/utils'

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn(
      'w-4 h-4 rounded-full border-2 border-af-border border-t-af-ink-600 animate-spin',
      className,
    )} />
  )
}

export function PageSpinner() {
  return (
    <div className="flex h-full items-center justify-center py-20">
      <Spinner className="w-5 h-5" />
    </div>
  )
}
