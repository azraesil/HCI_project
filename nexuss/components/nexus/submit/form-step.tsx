import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export function FormStep({
  n,
  title,
  description,
  complete,
  children,
}: {
  n: number
  title: string
  description: string
  complete: boolean
  children: React.ReactNode
}) {
  return (
    <section aria-labelledby={`step-${n}`} className="rounded-xl border bg-card shadow-xs">
      <header className="flex items-start gap-3 border-b px-6 py-4">
        <span
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors',
            complete ? 'bg-success text-white' : 'bg-navy text-white',
          )}
        >
          {complete ? <Check className="size-4" strokeWidth={3} aria-hidden="true" /> : n}
        </span>
        <div>
          <h2 id={`step-${n}`} className="font-semibold text-foreground">
            <span className="sr-only">Step {n}{complete ? ', complete' : ''}: </span>
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </header>
      <div className="px-6 py-5">{children}</div>
    </section>
  )
}
