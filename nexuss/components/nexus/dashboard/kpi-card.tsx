import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const tones = {
  neutral: { 
    icon: 'bg-muted text-muted-foreground', 
    accent: 'border-border/80' 
  },
  warning: { 
    icon: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', 
    accent: 'border-border/80' 
  },
  danger: { 
    icon: 'bg-red-500/10 text-red-600 dark:text-red-400', 
    accent: 'border-border/80 border-l-4 border-l-danger' 
  },
  success: { 
    icon: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', 
    accent: 'border-border/80' 
  },
}

export function KpiCard({
  label,
  value,
  sub,
  Icon,
  tone = 'neutral',
  href,
}: {
  label: string
  value: string
  sub: string
  Icon: typeof ArrowRight
  tone?: keyof typeof tones
  href?: string
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors', tones[tone].icon)}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-2 font-mono text-3xl font-bold tracking-tight text-foreground tabular-nums">{value}</p>
      <div className={cn('mt-2 flex items-center justify-between text-xs', tone === 'danger' ? 'font-medium text-danger-ink dark:text-red-400' : 'text-muted-foreground')}>
        <span className="truncate" title={sub}>{sub}</span>
        {href && (
          <ArrowRight className="size-3.5 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true" />
        )}
      </div>
    </>
  )

  const cls = cn(
    'group relative flex flex-col justify-between rounded-xl border bg-card/80 backdrop-blur-xs p-4.5 shadow-xs transition-all hover:border-foreground/20 hover:shadow-sm',
    tones[tone].accent
  )

  return href ? (
    <Link href={href} className={cn(cls, 'focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none')}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  )
}