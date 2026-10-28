'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { 
  developers, 
  userById, 
  companyById, 
  STATUS_LABEL, 
  PRIORITY_LABEL,
  type User,
  type Ticket
} from '@/lib/nexus-data'
import { getSla } from '@/lib/sla'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/nexus/app-shell'
import { useNexus } from '@/components/nexus/nexus-provider'

export default function TeamPage() {
  const { tickets, now } = useNexus()
  const devList = developers()
  const [selectedDevId, setSelectedDevId] = useState<string>(devList[0]?.id || '')

  const selectedDev = userById(selectedDevId)

  // Selected developer's assigned tickets
  const assignedTickets = tickets.filter((t) => t.assigneeId === selectedDevId)
  const activeTickets = assignedTickets.filter((t) => t.status !== 'resolved')
  const resolvedTickets = assignedTickets.filter((t) => t.status === 'resolved')

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Team"
        description="Monitor developer workloads, active ticket distribution, and SLA resolution velocity."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Team Directory */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
            Developers ({devList.length})
          </h2>

          <div className="space-y-2.5">
            {devList.map((dev) => {
              const devTickets = tickets.filter((t) => t.assigneeId === dev.id)
              const devActiveCount = devTickets.filter((t) => t.status !== 'resolved').length
              const isSelected = dev.id === selectedDevId

              return (
                <button
                  key={dev.id}
                  type="button"
                  onClick={() => setSelectedDevId(dev.id)}
                  className={cn(
                    'w-full text-left p-4 rounded-xl border transition-all duration-150 flex items-center justify-between',
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-xs ring-1 ring-primary/20'
                      : 'border-border bg-card hover:border-slate-300 dark:hover:border-slate-700 hover:bg-muted/40'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="size-10 rounded-full flex items-center justify-center text-white font-semibold text-xs shrink-0 shadow-xs"
                      style={{ backgroundColor: dev.avatarColor }}
                    >
                      {dev.initials}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground text-sm leading-tight truncate">{dev.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{dev.title}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
                        devActiveCount > 0 
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' 
                          : 'bg-muted text-muted-foreground border-border'
                      )}
                    >
                      {devActiveCount} {devActiveCount === 1 ? 'active ticket' : 'active tickets'}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Column: Workload & Assigned Tickets */}
        <div className="lg:col-span-8 bg-card border border-border/80 rounded-2xl p-6 shadow-xs">
          {selectedDev ? (
            <div className="space-y-6">
              {/* Profile Overview */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-border/60 gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className="size-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0"
                    style={{ backgroundColor: selectedDev.avatarColor }}
                  >
                    {selectedDev.initials}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{selectedDev.name}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">{selectedDev.title} · {selectedDev.email}</p>
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <div className="bg-muted/50 border border-border/60 rounded-xl px-4 py-2 text-center min-w-[90px]">
                    <div className="text-lg font-bold text-primary tabular-nums">{activeTickets.length}</div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active Work</div>
                  </div>
                  <div className="bg-muted/50 border border-border/60 rounded-xl px-4 py-2 text-center min-w-[90px]">
                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{resolvedTickets.length}</div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Resolved</div>
                  </div>
                </div>
              </div>

              {/* Assigned Tickets */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Assigned Tickets ({assignedTickets.length})
                </h3>

                {assignedTickets.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                    No tickets currently assigned to this developer.
                  </div>
                ) : (
                  <div className="divide-y divide-border/60 border border-border/80 rounded-xl overflow-hidden bg-card">
                    {assignedTickets.map((ticket) => {
                      const company = companyById(ticket.companyId)
                      const isOverdue = getSla(ticket, now).state === 'breached'

                      return (
                        <div
                          key={ticket.id}
                          className="p-3.5 hover:bg-muted/40 transition-colors flex items-center justify-between gap-4"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/tickets/${ticket.id}`}
                                className="text-xs font-mono font-bold text-primary hover:underline"
                              >
                                #{ticket.id}
                              </Link>
                              <span className="text-xs text-muted-foreground/40">·</span>
                              <span className="text-xs font-medium text-muted-foreground">{company?.name}</span>
                              {isOverdue && (
                                <span className="inline-flex items-center gap-1 text-xs uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 whitespace-nowrap">
                                  <AlertCircle className="size-2.5" />
                                  Overdue
                                </span>
                              )}
                            </div>
                            <Link
                              href={`/tickets/${ticket.id}`}
                              className="text-sm font-medium text-foreground hover:text-primary block truncate transition-colors"
                            >
                              {ticket.title}
                            </Link>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={cn(
                                'text-xs px-2 py-0.5 rounded-full font-semibold border whitespace-nowrap',
                                ticket.priority === 'critical'
                                  ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                                  : ticket.priority === 'high'
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                  : 'bg-muted text-muted-foreground border-border'
                              )}
                            >
                              {PRIORITY_LABEL[ticket.priority]}
                            </span>
                            <span
                              className={cn(
                                'text-xs px-2 py-0.5 rounded-md font-medium border whitespace-nowrap',
                                ticket.status === 'resolved'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                  : ticket.status === 'in_progress'
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                  : 'bg-muted text-muted-foreground border-border'
                              )}
                            >
                              {STATUS_LABEL[ticket.status]}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}