'use client'

import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { developers, userById, type Ticket } from '@/lib/nexus-data'
import { useNexus } from '../nexus-provider'
import { UserAvatar } from '../badges'

export function AssigneeControl({ ticket }: { ticket: Ticket }) {
  const { user, assign, tickets } = useNexus()
  const assignee = userById(ticket.assigneeId)
  const canAssign = user?.role === 'admin' || user?.role === 'pm'
  const isDev = user?.role === 'developer'
  const load = (id: string) => tickets.filter((t) => t.assigneeId === id && t.status !== 'resolved').length

  return (
    <section aria-labelledby="assignee-h" className="rounded-xl border bg-card p-5 shadow-xs">
      <h2 id="assignee-h" className="text-sm font-semibold text-foreground">Assigned developer</h2>
      <div className="mt-3 flex items-center gap-3">
        <UserAvatar user={assignee} size="lg" />
        <div className="min-w-0">
          <p className={assignee ? 'font-medium text-foreground' : 'font-medium italic text-muted-foreground'}>{assignee?.name ?? 'Unassigned'}</p>
          <p className="text-xs text-muted-foreground">{assignee ? `${assignee.title} · ${load(assignee.id)} open tickets` : 'Awaiting triage'}</p>
        </div>
      </div>

      {canAssign && (
        <label className="mt-4 flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">Reassign</span>
          <select
            value={ticket.assigneeId ?? ''}
            onChange={(e) => assign(ticket.id, e.target.value || null)}
            className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 focus-visible:outline-none"
          >
            <option value="">Unassigned</option>
            {developers().map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} — {load(d.id)} open
              </option>
            ))}
          </select>
        </label>
      )}
      {isDev && ticket.assigneeId !== user?.id && (
        <Button variant="outline" size="lg" className="mt-4 w-full" onClick={() => user && assign(ticket.id, user.id)}>
          <UserPlus className="size-4" aria-hidden="true" />
          Assign to me
        </Button>
      )}
    </section>
  )
}
