import type { Ticket } from './nexus-data'

export type SlaState = 'on_track' | 'at_risk' | 'breached' | 'met' | 'missed'

export const AT_RISK_THRESHOLD_MS = 2 * 60 * 60 * 1000

export interface SlaInfo {
  state: SlaState
  remainingMs: number
  /** 0–1 share of the SLA window already consumed */
  progress: number
  label: string
}

export function formatDuration(ms: number) {
  const totalMin = Math.max(0, Math.floor(Math.abs(ms) / 60_000))
  const d = Math.floor(totalMin / 1440)
  const h = Math.floor((totalMin % 1440) / 60)
  const m = totalMin % 60
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`
  return `${m}m`
}

export function getSla(ticket: Ticket, now: number): SlaInfo {
  const window = ticket.slaDueAt - ticket.createdAt
  if (ticket.status === 'resolved') {
    const at = ticket.resolvedAt ?? now
    const met = at <= ticket.slaDueAt
    return {
      state: met ? 'met' : 'missed',
      remainingMs: ticket.slaDueAt - at,
      progress: Math.min(1, (at - ticket.createdAt) / window),
      label: met ? 'SLA met' : 'SLA missed',
    }
  }
  const remainingMs = ticket.slaDueAt - now
  const progress = Math.min(1, Math.max(0, (now - ticket.createdAt) / window))
  if (remainingMs <= 0) {
    return { state: 'breached', remainingMs, progress: 1, label: `Overdue ${formatDuration(remainingMs)}` }
  }
  if (remainingMs <= AT_RISK_THRESHOLD_MS) {
    return { state: 'at_risk', remainingMs, progress, label: `${formatDuration(remainingMs)} left` }
  }
  return { state: 'on_track', remainingMs, progress, label: `${formatDuration(remainingMs)} left` }
}

export function formatClock(ms: number) {
  const total = Math.max(0, Math.floor(Math.abs(ms) / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return [h, m, s].map((v) => v.toString().padStart(2, '0')).join(':')
}

const dateTimeFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

export function formatDateTime(ms: number) {
  return `${dateTimeFmt.format(ms)} UTC`
}

export function formatRelative(ms: number, now: number) {
  const diff = now - ms
  if (diff < 60_000) return 'just now'
  return `${formatDuration(diff)} ago`
}
