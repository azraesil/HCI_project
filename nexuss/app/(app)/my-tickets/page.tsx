'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Columns3, List, ShieldAlert, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNexus } from '@/components/nexus/nexus-provider'
import { PageHeader } from '@/components/nexus/app-shell'
import { TicketTable } from '@/components/nexus/tickets/ticket-table'
import { KanbanBoard } from '@/components/nexus/tickets/kanban-board'
import { getSla } from '@/lib/sla'

type View = 'list' | 'board'

export default function MyTicketsPage() {
  const { visibleTickets, now, user } = useNexus()
  const [view, setView] = useState<View>('list')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'resolved'>('all')

  // Yalnızca giriş yapan kullanıcıya atanmış biletler
  const myTickets = useMemo(() => {
    if (!user) return []
    return visibleTickets.filter((t) => t.assigneeId === user.id)
  }, [visibleTickets, user])

  // Filtrelenmiş biletler
  const filtered = useMemo(() => {
    return myTickets.filter((t) => {
      if (statusFilter === 'active' && t.status === 'resolved') return false
      if (statusFilter === 'resolved' && t.status !== 'resolved') return false
      return true
    })
  }, [myTickets, statusFilter])

  // İstatistik sayaçları
  const activeCount = myTickets.filter((t) => t.status !== 'resolved').length
  const overdueCount = myTickets.filter((t) => t.status !== 'resolved' && getSla(t, now).state === 'breached').length
  const resolvedCount = myTickets.filter((t) => t.status === 'resolved').length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assigned to Me"
        description={`You have ${activeCount} active ${activeCount === 1 ? 'ticket' : 'tickets'} assigned to you.`}
        actions={
          <div role="radiogroup" aria-label="View mode" className="flex rounded-lg border bg-card p-1">
            <button
              type="button"
              onClick={() => setView('list')}
              className={cn(
                'flex min-h-10 items-center gap-2 rounded-md px-3.5 text-sm font-medium transition-colors',
                view === 'list' ? 'bg-navy text-white' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <List className="size-4" />
              List view
            </button>
            <button
              type="button"
              onClick={() => setView('board')}
              className={cn(
                'flex min-h-10 items-center gap-2 rounded-md px-3.5 text-sm font-medium transition-colors',
                view === 'board' ? 'bg-navy text-white' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Columns3 className="size-4" />
              Board view
            </button>
          </div>
        }
      />

      {/* Hızlı Özet Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'active' ? 'all' : 'active')}
          className={cn(
            'flex items-center gap-4 p-4 rounded-xl border text-left transition-all',
            statusFilter === 'active' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-card hover:border-slate-300'
          )}
        >
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
            <Clock className="size-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{activeCount}</div>
            <div className="text-xs text-muted-foreground font-medium">Active</div>
          </div>
        </button>

        <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
          <div className="p-2.5 rounded-lg bg-red-50 text-red-600">
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
            <div className="text-xs text-muted-foreground font-medium">SLA overdue</div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'resolved' ? 'all' : 'resolved')}
          className={cn(
            'flex items-center gap-4 p-4 rounded-xl border text-left transition-all',
            statusFilter === 'resolved' ? 'border-emerald-600 bg-emerald-50/20 shadow-sm' : 'border-border bg-card hover:border-slate-300'
          )}
        >
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="size-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600">{resolvedCount}</div>
            <div className="text-xs text-muted-foreground font-medium">Resolved</div>
          </div>
        </button>
      </div>

      {/* Bilet Listesi / Kanban */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center bg-card">
          <p className="text-base font-medium text-foreground">No tickets assigned to you.</p>
          <p className="text-sm text-muted-foreground mt-1">
            {statusFilter !== 'all' ? 'No tickets match the selected filter.' : 'New tickets will appear here once they are assigned to you.'}
          </p>
        </div>
      ) : view === 'list' ? (
        <TicketTable tickets={filtered} now={now} />
      ) : (
        <KanbanBoard tickets={filtered} now={now} />
      )}
    </div>
  )
}