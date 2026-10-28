import { AlertOctagon, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PRIORITY_LABEL, PRIORITY_SLA_HOURS, type Ticket } from '@/lib/nexus-data'
import { formatClock, formatDateTime, type SlaInfo } from '@/lib/sla'
import { SlaProgress } from '../badges'

const STYLE = {
  on_track: { box: 'border-green-300 bg-success-soft', ink: 'text-success-ink', Icon: Clock, heading: 'Time remaining to resolve' },
  at_risk: { box: 'border-amber-300 bg-warning-soft', ink: 'text-warning-ink', Icon: Clock, heading: 'SLA at risk — time remaining' },
  breached: { box: 'border-red-300 bg-danger-soft', ink: 'text-danger-ink', Icon: AlertOctagon, heading: 'SLA overdue by' },
  met: { box: 'border-green-300 bg-success-soft', ink: 'text-success-ink', Icon: CheckCircle2, heading: 'Resolved within SLA' },
  missed: { box: 'border-red-300 bg-danger-soft', ink: 'text-danger-ink', Icon: XCircle, heading: 'Resolved after SLA deadline' },
} as const

export function SlaCountdown({ ticket, sla, now }: { ticket: Ticket; sla: SlaInfo; now: number }) {
  const s = STYLE[sla.state]
  const resolved = sla.state === 'met' || sla.state === 'missed'
  const elapsed = (resolved ? (ticket.resolvedAt ?? now) : now) - ticket.createdAt

  return (
    <section aria-labelledby="sla-h" className={cn('rounded-xl border-2 p-6', s.box)}>
      <div className="flex items-center justify-between gap-6">
        <div>
          <h2 id="sla-h" className={cn('flex items-center gap-2 text-sm font-semibold', s.ink)}>
            <s.Icon className="size-4" aria-hidden="true" />
            {s.heading}
          </h2>
          <p
            className={cn('mt-1 font-mono text-5xl font-semibold tracking-tight tabular-nums', s.ink, sla.state === 'breached' && 'animate-pulse')}
            aria-live="off"
          >
            {resolved ? formatClock(elapsed) : formatClock(Math.abs(sla.remainingMs))}
          </p>
          <p className={cn('mt-1 text-sm', s.ink)}>
            {resolved ? `Total resolution time · ${sla.label}` : `Due ${formatDateTime(ticket.slaDueAt)}`}
          </p>
        </div>
        <dl className="grid shrink-0 grid-cols-2 gap-x-6 gap-y-3 rounded-lg bg-card/70 px-5 py-4 text-sm ring-1 ring-black/5">
          <div>
            <dt className="text-xs text-muted-foreground">Priority</dt>
            <dd className="font-semibold text-foreground">{PRIORITY_LABEL[ticket.priority]}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">SLA window</dt>
            <dd className="font-semibold text-foreground">{PRIORITY_SLA_HOURS[ticket.priority]}h</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Elapsed</dt>
            <dd className="font-semibold text-foreground tabular-nums">{formatClock(elapsed)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Window used</dt>
            <dd className="font-semibold text-foreground tabular-nums">{Math.round(Math.min(1, elapsed / (ticket.slaDueAt - ticket.createdAt)) * 100)}%</dd>
          </div>
        </dl>
      </div>
      <SlaProgress sla={sla} className="mt-5 h-2 bg-white/70" />
    </section>
  )
}
