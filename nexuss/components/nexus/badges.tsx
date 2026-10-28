import { AlertTriangle, CheckCircle2, Circle, CircleDot, Clock, Eye, Flame, ArrowUp, Minus, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PRIORITY_LABEL, STATUS_LABEL, type Priority, type Status, type User } from '@/lib/nexus-data'
import type { SlaInfo } from '@/lib/sla'

const statusStyles: Record<Status, { cls: string; Icon: typeof Circle }> = {
  open: { cls: 'bg-slate-100 text-slate-700 ring-slate-300', Icon: Circle },
  in_progress: { cls: 'bg-warning-soft text-warning-ink ring-amber-300', Icon: CircleDot },
  in_review: { cls: 'bg-info-soft text-info-ink ring-blue-300', Icon: Eye },
  resolved: { cls: 'bg-success-soft text-success-ink ring-green-300', Icon: CheckCircle2 },
}

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const { cls, Icon } = statusStyles[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap', cls, className)}>
      <Icon className="size-3.5" aria-hidden="true" />
      {STATUS_LABEL[status]}
    </span>
  )
}

const priorityStyles: Record<Priority, { cls: string; Icon: typeof Flame }> = {
  critical: { cls: 'bg-danger-soft text-danger-ink ring-red-300', Icon: Flame },
  high: { cls: 'bg-orange-100 text-orange-800 ring-orange-300', Icon: ArrowUp },
  medium: { cls: 'bg-info-soft text-info-ink ring-blue-300', Icon: Minus },
  low: { cls: 'bg-slate-100 text-slate-700 ring-slate-300', Icon: ArrowDown },
}

export const PRIORITY_DOT: Record<Priority, string> = {
  critical: 'bg-danger',
  high: 'bg-orange-500',
  medium: 'bg-primary',
  low: 'bg-slate-400',
}

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  const { cls, Icon } = priorityStyles[priority]
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset whitespace-nowrap', cls, className)}>
      <Icon className="size-3.5" aria-hidden="true" />
      {PRIORITY_LABEL[priority]}
    </span>
  )
}

export function SlaBadge({ sla, className }: { sla: SlaInfo; className?: string }) {
  const map = {
    on_track: { cls: 'bg-success-soft text-success-ink ring-green-300', Icon: Clock },
    at_risk: { cls: 'bg-warning-soft text-warning-ink ring-amber-300', Icon: Clock },
    breached: { cls: 'bg-danger text-white ring-red-600', Icon: AlertTriangle },
    met: { cls: 'bg-success-soft text-success-ink ring-green-300', Icon: CheckCircle2 },
    missed: { cls: 'bg-danger-soft text-danger-ink ring-red-300', Icon: AlertTriangle },
  }[sla.state]
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-xs font-semibold tabular-nums ring-1 ring-inset whitespace-nowrap', map.cls, className)}>
      <map.Icon className="size-3.5" aria-hidden="true" />
      {sla.label}
    </span>
  )
}

export function OverdueTag() {
  return (
    <span className="inline-flex items-center gap-1 rounded bg-danger px-1.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white whitespace-nowrap">
      <AlertTriangle className="size-3" aria-hidden="true" />
      Overdue
    </span>
  )
}

export function SlaProgress({ sla, className }: { sla: SlaInfo; className?: string }) {
  const color =
    sla.state === 'breached' || sla.state === 'missed'
      ? 'bg-danger'
      : sla.state === 'at_risk'
        ? 'bg-warning'
        : 'bg-success'
  const pct = Math.round(sla.progress * 100)
  const stateText = {
    on_track: 'On track',
    at_risk: 'Less than 2 hours remaining',
    breached: 'SLA overdue',
    met: 'SLA met',
    missed: 'SLA missed',
  }[sla.state]
  return (
    <div
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-slate-200', className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-label={`SLA time used: ${pct}%. ${stateText}`}
    >
      <div className={cn('h-full rounded-full transition-[width] duration-500', color)} style={{ width: `${Math.max(4, pct)}%` }} />
    </div>
  )
}

export function UserAvatar({ user, size = 'md', className }: { user?: User; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = { sm: 'size-6 text-xs', md: 'size-8 text-xs', lg: 'size-10 text-sm' }
  if (!user) {
    return (
      <span
        className={cn('inline-flex shrink-0 items-center justify-center rounded-full border border-dashed border-slate-400 text-slate-500', sizes[size], className)}
        title="Unassigned"
      >
        <span className="sr-only">Unassigned</span>
        <span aria-hidden="true">?</span>
      </span>
    )
  }
  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white', sizes[size], className)}
      style={{ backgroundColor: user.avatarColor }}
      title={user.name}
      aria-hidden="true"
    >
      {user.initials}
    </span>
  )
}
