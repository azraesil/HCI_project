'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { companyById, userById, STATUS_LABEL, type Ticket, type Status } from '@/lib/nexus-data'
import { getSla } from '@/lib/sla'
import { PriorityBadge, SlaBadge, UserAvatar } from '../badges'

const STATUS_DOT: Record<Status, string> = {
  open: 'bg-slate-400',
  in_progress: 'bg-amber-500',
  in_review: 'bg-blue-500',
  resolved: 'bg-emerald-500',
}

export function SlaWatchlist({ tickets, now, className }: { tickets: Ticket[]; now: number; className?: string }) {
  const router = useRouter()
  const rows = tickets
    .filter((t) => t.status !== 'resolved')
    .map((t) => ({ t, sla: getSla(t, now) }))
    .filter(({ t, sla }) => sla.state !== 'on_track' || t.priority === 'critical')
    .sort((a, b) => a.sla.remainingMs - b.sla.remainingMs)
    .slice(0, 8)

  return (
    <section aria-labelledby="watchlist-title" className={cn('overflow-hidden rounded-xl border border-border/80 bg-card shadow-xs', className)}>
      <div className="flex items-center justify-between border-b border-border/70 px-5 py-3.5">
        <div>
          <h2 id="watchlist-title" className="text-sm font-semibold tracking-tight text-foreground">SLA Watchlist</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Tickets overdue or with under 2 hours remaining — ordered by urgency.</p>
        </div>
        <Link href="/tickets?overdue=1" className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
          View all overdue
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="px-5 py-10 text-center text-xs text-muted-foreground">No tickets currently at risk. All active SLAs are within targets.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead className="bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/60">
              <tr>
                <th scope="col" className="py-2.5 pr-3 pl-5 font-medium">Ticket</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Company</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Priority</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Status</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Assignee</th>
                <th scope="col" className="py-2.5 pr-5 pl-3 text-right font-medium">SLA countdown</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.map(({ t, sla }) => {
                const overdue = sla.state === 'breached'
                const assignee = userById(t.assigneeId)
                const company = companyById(t.companyId)

                return (
                  <tr
                    key={t.id}
                    onClick={() => router.push(`/tickets/${t.id}`)}
                    className={cn(
                      'group cursor-pointer transition-colors',
                      overdue 
                        ? 'border-l-4 border-l-red-500 bg-red-500/[0.03] hover:bg-red-500/[0.07] dark:bg-red-950/20 dark:hover:bg-red-950/30' 
                        : 'border-l-4 border-l-transparent hover:bg-muted/40'
                    )}
                  >
                    {/* Bilet ID + Başlık */}
                    <td className="py-3 pr-3 pl-4">
                      <div className="flex items-center gap-1.5">
                        <Link 
                          href={`/tickets/${t.id}`} 
                          className="font-mono text-xs font-bold text-muted-foreground group-hover:text-primary hover:underline transition-colors" 
                          onClick={(e) => e.stopPropagation()}
                        >
                          #{t.id}
                        </Link>
                        {overdue && (
                          <span className="flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400 bg-red-100/70 dark:bg-red-950/70 px-1.5 py-0.2 rounded whitespace-nowrap">
                            <AlertCircle className="size-2.5" />
                            Overdue
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 max-w-sm truncate text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                        {t.title}
                      </p>
                    </td>

                    {/* Şirket */}
                    <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">
                      {company?.name}
                    </td>

                    {/* Öncelik */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <PriorityBadge priority={t.priority} />
                    </td>

                    {/* Sade Durum */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-foreground font-medium">
                        <span className={cn('size-2 rounded-full', STATUS_DOT[t.status])} aria-hidden="true" />
                        <span>{STATUS_LABEL[t.status]}</span>
                      </div>
                    </td>

                    {/* Atanan Geliştirici */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <UserAvatar user={assignee} size="sm" />
                        <span className={assignee ? 'text-foreground' : 'text-muted-foreground italic'}>
                          {assignee ? assignee.name : 'Unassigned'}
                        </span>
                      </div>
                    </td>

                    {/* SLA Sayacı */}
                    <td className="py-3 pr-5 pl-3 text-right whitespace-nowrap">
                      <SlaBadge sla={sla} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}