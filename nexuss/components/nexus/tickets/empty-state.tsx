import { SearchX } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card px-6 py-16 text-center">
      <SearchX className="size-8 text-muted-foreground" aria-hidden="true" />
      <p className="mt-3 font-semibold text-foreground">No tickets match these filters</p>
      <p className="mt-1 text-sm text-muted-foreground">Try clearing a filter or switching tenant in the top bar.</p>
    </div>
  )
}
