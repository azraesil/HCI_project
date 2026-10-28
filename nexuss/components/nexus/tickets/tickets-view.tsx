'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Columns3, List, Plus, UserCheck, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import {
  PRIORITY_LABEL,
  PRIORITY_ORDER,
  STATUS_LABEL,
  STATUS_ORDER,
  developers,
  type Priority,
  type Status,
} from '@/lib/nexus-data'
import { getSla } from '@/lib/sla'
import { useNexus } from '../nexus-provider'
import { PageHeader } from '../app-shell'
import { TicketTable } from './ticket-table'
import { KanbanBoard } from './kanban-board'

export interface TicketFilters {
  assignee: string
  priority: Priority | 'all'
  status: Status | 'all'
  overdue: boolean
}

type View = 'list' | 'board'

export function TicketsView({ initial }: { initial: Partial<TicketFilters> }) {
  const { visibleTickets, now, user } = useNexus()
  const isClient = user?.role === 'client'
  const isDev = user?.role === 'developer'
  const [view, setView] = useState<View>(isClient ? 'list' : 'board')
  const [filters, setFilters] = useState<TicketFilters>({
    assignee: initial.assignee || 'all',
    priority: 'all',
    status: 'all',
    overdue: false,
    ...initial,
  })

  const filtered = useMemo(
    () =>
      visibleTickets.filter((t) => {
        if (filters.assignee === 'unassigned' ? t.assigneeId !== null : filters.assignee !== 'all' && t.assigneeId !== filters.assignee) return false
        if (filters.priority !== 'all' && t.priority !== filters.priority) return false
        if (filters.status !== 'all' && t.status !== filters.status) return false
        if (filters.overdue && getSla(t, now).state !== 'breached') return false
        return true
      }),
    [visibleTickets, filters, now],
  )

  const activeCount =
    (filters.assignee !== 'all' ? 1 : 0) + (filters.priority !== 'all' ? 1 : 0) + (filters.status !== 'all' ? 1 : 0) + (filters.overdue ? 1 : 0)
  const set = <K extends keyof TicketFilters>(k: K, v: TicketFilters[K]) => setFilters((f) => ({ ...f, [k]: v }))

  const isAssignedToMe = user && filters.assignee === user.id

  return (
    <>
      <PageHeader
        title={isClient ? 'My Tickets' : 'All Tickets'}
        description={`${filtered.length} of ${visibleTickets.length} tickets shown${view === 'board' ? ' · Drag cards between columns to change status' : ''}`}
        actions={
          <div className="flex items-center gap-2.5">
            {/* Sadece Müşteri Rolüne Görünür Create Ticket Butonu */}
            {isClient && (
              <Link
                href="/tickets/new"
                className={cn(buttonVariants({ size: 'default' }), 'gap-1.5 font-semibold shadow-xs')}
              >
                <Plus className="size-4" aria-hidden="true" />
                Create Ticket
              </Link>
            )}

            <div role="radiogroup" aria-label="View mode" className="flex rounded-lg border bg-card p-1">
              {(
                [
                  ['list', 'List view', List],
                  ['board', 'Board view', Columns3],
                ] as const
              ).map(([v, label, Icon]) => (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={view === v}
                  onClick={() => setView(v)}
                  className={cn(
                    'flex min-h-10 items-center gap-2 rounded-md px-3.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer',
                    view === v ? 'bg-navy text-white' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        }
      />

      <div role="search" aria-label="Filter tickets" className="mb-5 flex flex-wrap items-end gap-3 rounded-xl border bg-card p-3">
        {/* Yazılımcı veya Admin için Tek Tıkla Kendi İşlerini Görme Butonu */}
        {user && !isClient && (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Scope</span>
            <div className="flex rounded-md border bg-background p-0.5 h-11 items-center">
              <button
                type="button"
                onClick={() => set('assignee', 'all')}
                className={cn(
                  'h-9 rounded px-3 text-xs font-medium transition-colors cursor-pointer',
                  filters.assignee === 'all' ? 'bg-navy text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => set('assignee', user.id)}
                className={cn(
                  'h-9 flex items-center gap-1.5 rounded px-3 text-xs font-medium transition-colors cursor-pointer',
                  isAssignedToMe ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <UserCheck className="size-3.5" />
                Assigned to me
              </button>
            </div>
          </div>
        )}

        {!isClient && (
          <FilterSelect label="Assigned developer" value={filters.assignee} onChange={(v) => set('assignee', v)}>
            <option value="all">All developers</option>
            <option value="unassigned">Unassigned</option>
            {developers().map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
                {d.id === user?.id ? ' (me)' : ''}
              </option>
            ))}
          </FilterSelect>
        )}
        <FilterSelect label="Priority" value={filters.priority} onChange={(v) => set('priority', v as TicketFilters['priority'])}>
          <option value="all">All priorities</option>
          {PRIORITY_ORDER.map((p) => (
            <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>
          ))}
        </FilterSelect>
        <FilterSelect label="Status" value={filters.status} onChange={(v) => set('status', v as TicketFilters['status'])}>
          <option value="all">All statuses</option>
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </FilterSelect>

        <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 select-none hover:bg-muted">
          <span className="relative inline-flex">
            <input
              type="checkbox"
              role="switch"
              checked={filters.overdue}
              onChange={(e) => set('overdue', e.target.checked)}
              className="peer sr-only"
            />
            <span className="h-6 w-10 rounded-full bg-slate-300 transition-colors peer-checked:bg-danger peer-focus-visible:ring-3 peer-focus-visible:ring-danger/30" aria-hidden="true" />
            <span className="absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" aria-hidden="true" />
          </span>
          <span className="text-sm font-medium text-foreground">SLA overdue only</span>
        </label>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => setFilters({ assignee: 'all', priority: 'all', status: 'all', overdue: false })}
            className="flex min-h-11 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-primary hover:bg-accent cursor-pointer"
          >
            <X className="size-4" aria-hidden="true" />
            Clear {activeCount} filter{activeCount > 1 ? 's' : ''}
          </button>
        )}
      </div>

      {view === 'list' ? <TicketTable tickets={filtered} now={now} /> : <KanbanBoard tickets={filtered} now={now} />}
    </>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
}) {
  const active = value !== 'all'
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'h-11 min-w-44 rounded-md border bg-background px-3 text-sm text-foreground focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 focus-visible:outline-none cursor-pointer',
          active && 'border-primary bg-accent font-medium',
        )}
      >
        {children}
      </select>
    </label>
  )
}