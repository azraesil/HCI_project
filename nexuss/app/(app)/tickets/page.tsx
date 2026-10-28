import type { Metadata } from 'next'
import { TicketsView, type TicketFilters } from '@/components/nexus/tickets/tickets-view'
import { PRIORITY_ORDER, STATUS_ORDER, type Priority, type Status } from '@/lib/nexus-data'

export const metadata: Metadata = { title: 'Tickets' }

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams
  const initial: Partial<TicketFilters> = {}
  if (sp.status && STATUS_ORDER.includes(sp.status as Status)) initial.status = sp.status as Status
  if (sp.priority && PRIORITY_ORDER.includes(sp.priority as Priority)) initial.priority = sp.priority as Priority
  if (sp.overdue === '1') initial.overdue = true
  if (sp.assignee) initial.assignee = sp.assignee

  return <TicketsView key={JSON.stringify(initial)} initial={initial} />
}