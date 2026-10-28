'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { CATEGORY_LABEL, companyById, userById, type Ticket } from '@/lib/nexus-data'
import { formatRelative, getSla } from '@/lib/sla'
import { OverdueTag, PriorityBadge, SlaBadge, SlaProgress, StatusBadge, UserAvatar } from '../badges'
import { EmptyState } from './empty-state'

export function TicketTable({ tickets, now }: { tickets: Ticket[]; now: number }) {
  const router = useRouter()
  if (tickets.length === 0) return <EmptyState />

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm">
        <caption className="sr-only">Tickets</caption>
        <thead className="bg-muted/60 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <tr>
            <th scope="col" className="py-2.5 pr-3 pl-5">Ticket</th>
            <th scope="col" className="px-3 py-2.5">Company</th>
            <th scope="col" className="px-3 py-2.5">Category</th>
            <th scope="col" className="px-3 py-2.5">Priority</th>
            <th scope="col" className="px-3 py-2.5">Status</th>
            <th scope="col" className="px-3 py-2.5">Assignee</th>
            <th scope="col" className="w-48 py-2.5 pr-5 pl-3">SLA</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {tickets.map((t) => {
            const sla = getSla(t, now)
            const overdue = sla.state === 'breached'
            const assignee = userById(t.assigneeId)
            return (
              <tr
                key={t.id}
                onClick={() => router.push(`/tickets/${t.id}`)}
                className={cn(
                  'cursor-pointer border-l-4 transition-colors',
                  overdue ? 'border-l-danger bg-danger-soft/40 hover:bg-danger-soft/70' : 'border-l-transparent hover:bg-muted/60',
                )}
              >
                <td className="py-3 pr-3 pl-4">
                  <div className="flex items-center gap-2">
                    <Link href={`/tickets/${t.id}`} onClick={(e) => e.stopPropagation()} className="font-mono text-xs font-semibold text-primary hover:underline">
                      #{t.id}
                    </Link>
                    {overdue && <OverdueTag />}
                    <span className="text-xs text-muted-foreground">{formatRelative(t.createdAt, now)}</span>
                  </div>
                  <p className="mt-0.5 max-w-md truncate font-medium text-foreground">{t.title}</p>
                </td>
                <td className="px-3 py-3 text-foreground">{companyById(t.companyId)?.name}</td>
                <td className="px-3 py-3 text-muted-foreground">{CATEGORY_LABEL[t.category]}</td>
                <td className="px-3 py-3"><PriorityBadge priority={t.priority} /></td>
                <td className="px-3 py-3"><StatusBadge status={t.status} /></td>
                <td className="px-3 py-3">
                  <span className="flex items-center gap-2">
                    <UserAvatar user={assignee} size="sm" />
                    <span className={assignee ? 'text-foreground' : 'italic text-muted-foreground'}>{assignee?.name ?? 'Unassigned'}</span>
                  </span>
                </td>
                <td className="py-3 pr-5 pl-3">
                  <SlaBadge sla={sla} />
                  <SlaProgress sla={sla} className="mt-1.5" />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      </div>
    </div>
  )
}
