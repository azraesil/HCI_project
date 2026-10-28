import { AlertTriangle, ArrowRightLeft, CirclePlus, Flag, MessageSquare, UserCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROLE_LABEL, userById, type AuditEvent, type Ticket } from '@/lib/nexus-data'
import { formatDateTime, formatRelative } from '@/lib/sla'
import { UserAvatar } from '../badges'

const TYPE: Record<AuditEvent['type'], { Icon: typeof Flag; cls: string; label: string }> = {
  created: { Icon: CirclePlus, cls: 'bg-accent text-primary', label: 'Created' },
  status: { Icon: ArrowRightLeft, cls: 'bg-warning-soft text-warning-ink', label: 'Status' },
  assign: { Icon: UserCheck, cls: 'bg-success-soft text-success-ink', label: 'Assignment' },
  comment: { Icon: MessageSquare, cls: 'bg-slate-100 text-slate-700', label: 'Comment' },
  priority: { Icon: Flag, cls: 'bg-warning-soft text-warning-ink', label: 'Priority' },
  sla: { Icon: AlertTriangle, cls: 'bg-danger-soft text-danger-ink', label: 'SLA' },
}

export function AuditTimeline({ ticket, now }: { ticket: Ticket; now: number }) {
  const events = [...ticket.audit].sort((a, b) => a.at - b.at)
  return (
    <section aria-labelledby="audit-h" className="mt-6 rounded-xl border bg-card shadow-xs">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h2 id="audit-h" className="font-semibold text-foreground">Audit trail</h2>
          <p className="text-sm text-muted-foreground">Every change to this ticket, oldest first. Records cannot be edited.</p>
        </div>
        <span className="text-sm text-muted-foreground tabular-nums">{events.length} events</span>
      </header>
      <ol className="flex flex-col px-6 py-5">
        {events.map((e, i) => {
          const { Icon, cls, label } = TYPE[e.type]
          const actor = e.type === 'sla' ? undefined : userById(e.actorId)
          return (
            <li key={e.id} className="relative flex gap-4 pb-4 last:pb-0">
              {i < events.length - 1 && <span className="absolute top-10 left-[17px] h-[calc(100%-36px)] w-0.5 bg-border" aria-hidden="true" />}
              <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-full ring-4 ring-card', cls)}>
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <div className="flex flex-1 items-center gap-4 rounded-lg border bg-background px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">{e.action}</span>
                    {e.detail && <span className="text-muted-foreground"> — {e.detail}</span>}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    {actor ? (
                      <>
                        <UserAvatar user={actor} size="sm" />
                        <span className="font-medium text-foreground">{actor.name}</span>
                        <span>· {ROLE_LABEL[actor.role]}</span>
                      </>
                    ) : (
                      <span className="font-medium text-foreground">Nexus System</span>
                    )}
                  </p>
                </div>
                <span className={cn('rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide', cls)}>{label}</span>
                <time dateTime={new Date(e.at).toISOString()} className="w-44 shrink-0 text-right text-xs text-muted-foreground">
                  <span className="block font-medium text-foreground tabular-nums">{formatDateTime(e.at)}</span>
                  {formatRelative(e.at, now)}
                </time>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
