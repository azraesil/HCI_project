'use client'

import { useMemo } from 'react'
import { Activity, AlarmClock, Inbox, Timer } from 'lucide-react'
import { companyById } from '@/lib/nexus-data'
import { formatDuration, getSla } from '@/lib/sla'
import { useNexus } from '../nexus-provider'
import { PageHeader } from '../app-shell'
import { KpiCard } from './kpi-card'
import { StatusDonut } from './status-donut'
import { PriorityBars } from './priority-bars'
import { SlaWatchlist } from './sla-watchlist'

export function DashboardView() {
  const { visibleTickets, now, user, tenantId } = useNexus()

  const stats = useMemo(() => {
    const active = visibleTickets.filter((t) => t.status !== 'resolved')
    const triage = active.filter((t) => t.status === 'open' && !t.assigneeId)
    const slas = active.map((t) => getSla(t, now))
    const breached = slas.filter((s) => s.state === 'breached').length
    const atRisk = slas.filter((s) => s.state === 'at_risk').length
    const resolved = visibleTickets.filter((t) => t.status === 'resolved' && t.resolvedAt)
    const avg = resolved.length
      ? resolved.reduce((sum, t) => sum + (t.resolvedAt! - t.createdAt), 0) / resolved.length
      : 0
    const met = resolved.filter((t) => t.resolvedAt! <= t.slaDueAt).length
    return { active: active.length, triage: triage.length, breached, atRisk, avg, resolved: resolved.length, met }
  }, [visibleTickets, now])

  const scope = tenantId === 'all' ? 'across all companies' : `for ${companyById(tenantId)?.name}`

  return (
    <>
      <PageHeader
        title={`Good morning, ${user?.name.split(' ')[0]}`}
        description={`Service health ${scope}. SLA timers update live.`}
      />

      <section aria-label="Key metrics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Active Tickets"
          value={stats.active.toString()}
          sub={`${visibleTickets.length - stats.active} resolved`}
          Icon={Activity}
          href="/tickets"
        />
        <KpiCard
          label="Pending Triage"
          value={stats.triage.toString()}
          sub="Open & unassigned"
          Icon={Inbox}
          tone={stats.triage > 0 ? 'warning' : 'neutral'}
          href="/tickets?status=open"
        />
        <KpiCard
          label="SLAs at Risk"
          value={(stats.breached + stats.atRisk).toString()}
          sub={`${stats.breached} overdue · ${stats.atRisk} under 2h`}
          Icon={AlarmClock}
          tone={stats.breached > 0 ? 'danger' : stats.atRisk > 0 ? 'warning' : 'neutral'}
          href="/tickets?overdue=1"
        />
        <KpiCard
          label="Average Resolution Time"
          value={stats.resolved ? formatDuration(stats.avg) : '—'}
          sub={stats.resolved ? `${Math.round((stats.met / stats.resolved) * 100)}% resolved within SLA` : 'No resolved tickets yet'}
          Icon={Timer}
          tone="success"
        />
      </section>

      <section aria-label="Charts" className="mt-5 grid grid-cols-1 lg:grid-cols-5 gap-4">
        <StatusDonut tickets={visibleTickets} className="lg:col-span-2" />
        <PriorityBars tickets={visibleTickets} className="lg:col-span-3" />
      </section>

      <SlaWatchlist tickets={visibleTickets} now={now} className="mt-5" />
    </>
  )
}
