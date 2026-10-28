'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { AlertTriangle, CheckCircle2, Clock, Flame, TrendingUp } from 'lucide-react'
import { useNexus } from '@/components/nexus/nexus-provider'
import { PageHeader } from '@/components/nexus/app-shell'
import { PRIORITY_ORDER, PRIORITY_LABEL, PRIORITY_SLA_HOURS, companyById } from '@/lib/nexus-data'
import { getSla } from '@/lib/sla'
import { cn } from '@/lib/utils'

export default function AnalyticsPage() {
  const { visibleTickets, now } = useNexus()

  const stats = useMemo(() => {
    const total = visibleTickets.length
    if (total === 0) return { complianceRate: 100, breached: 0, atRisk: 0, onTrack: 0 }

    let breached = 0
    let atRisk = 0
    let onTrack = 0
    let missed = 0

    visibleTickets.forEach((t) => {
      const sla = getSla(t, now)
      if (sla.state === 'breached') breached++
      else if (sla.state === 'at_risk') atRisk++
      else if (sla.state === 'on_track') onTrack++
      else if (sla.state === 'missed') missed++
    })

    const complianceRate = Math.round(((total - breached - missed) / total) * 100)

    return { complianceRate, breached, atRisk, onTrack, total }
  }, [visibleTickets, now])

  const breachedTickets = useMemo(() => {
    return visibleTickets.filter((t) => getSla(t, now).state === 'breached' && t.status !== 'resolved')
  }, [visibleTickets, now])

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <PageHeader
        title="SLA Analytics & Performance"
        description="Service-level agreements (SLA), target response thresholds, and resolution compliance telemetry."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-xs shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">SLA Compliance</span>
            <TrendingUp className="size-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-foreground tabular-nums">{stats.complianceRate}%</div>
          <p className="text-xs text-muted-foreground">Enterprise target: 98.5%</p>
        </div>

        <div className="p-5 rounded-2xl border border-border/80 border-l-4 border-l-red-500 bg-card/80 backdrop-blur-xs shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">SLA Overdue</span>
            <Flame className="size-4 text-red-500" />
          </div>
          <div className="text-3xl font-extrabold text-red-600 dark:text-red-400 tabular-nums">{stats.breached}</div>
          <p className="text-xs text-red-600/80 dark:text-red-400/80 font-medium">Overdue tickets needing immediate action</p>
        </div>

        <div className="p-5 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-xs shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">At Risk (&lt; 2h)</span>
            <AlertTriangle className="size-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 tabular-nums">{stats.atRisk}</div>
          <p className="text-xs text-muted-foreground">Less than 2 hours to SLA deadline</p>
        </div>

        <div className="p-5 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-xs shadow-xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">On Track</span>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">{stats.onTrack}</div>
          <p className="text-xs text-muted-foreground">Resolving within commitment</p>
        </div>
      </div>

      {/* Priority SLA Commitments & Active Breaches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tier Commitments */}
        <div className="p-6 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-xs shadow-xs space-y-5">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">Priority Tier Commitments</h2>
          <div className="space-y-3">
            {PRIORITY_ORDER.map((p) => {
              const count = visibleTickets.filter((t) => t.priority === p).length
              const hours = PRIORITY_SLA_HOURS[p]
              return (
                <div key={p} className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border/60 transition-colors hover:bg-muted/70">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                      {PRIORITY_LABEL[p]} Priority
                    </span>
                    <p className="text-xs text-muted-foreground">Target Resolution: {hours} hours</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-foreground tabular-nums">
                      {count} {count === 1 ? 'ticket' : 'tickets'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Active Breaches List */}
        <div className="p-6 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-xs shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">Overdue Tickets</h2>
            <span className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-0.5 rounded-full">
              {breachedTickets.length} overdue
            </span>
          </div>

          {breachedTickets.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
              No active tickets are overdue.
            </div>
          ) : (
            <div className="space-y-2.5">
              {breachedTickets.map((t) => {
                const comp = companyById(t.companyId)
                return (
                  <Link
                    key={t.id}
                    href={`/tickets/${t.id}`}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-red-500/30 bg-red-500/[0.03] hover:bg-red-500/[0.08] transition-colors"
                  >
                    <div className="space-y-0.5 min-w-0 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-red-600 dark:text-red-400">#{t.id}</span>
                        <span className="text-xs text-muted-foreground/40">·</span>
                        <span className="text-xs text-muted-foreground truncate">{comp?.name}</span>
                      </div>
                      <p className="text-sm font-medium text-foreground truncate">{t.title}</p>
                    </div>
                    <span className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-md shrink-0 uppercase tracking-wider">
                      Overdue
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}