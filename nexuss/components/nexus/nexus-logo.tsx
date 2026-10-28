import { cn } from '@/lib/utils'

export function NexusLogo({ tone = 'light', className }: { tone?: 'light' | 'dark'; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className="flex size-8 items-center justify-center rounded-md bg-primary" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="size-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 19V5l14 14V5" />
        </svg>
      </span>
      <span className={cn('text-lg font-semibold tracking-tight', tone === 'light' ? 'text-white' : 'text-navy')}>
        Nexus
      </span>
    </span>
  )
}
