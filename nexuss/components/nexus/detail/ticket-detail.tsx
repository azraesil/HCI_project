'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, CheckCircle2, X } from 'lucide-react'
import { CATEGORY_LABEL, companyById, projectById, userById } from '@/lib/nexus-data'
import { formatDateTime, getSla } from '@/lib/sla'
import { useNexus } from '../nexus-provider'
import { PriorityBadge, StatusBadge, UserAvatar } from '../badges'
import { AttachmentList } from './attachment-list'
import { CompanyCard } from './company-card'
import { SlaCountdown } from './sla-countdown'
import { StatusControl } from './status-control'
import { AssigneeControl } from './assignee-control'
import { CommentThread } from './comment-thread'
import { AuditTimeline } from './audit-timeline'

export function TicketDetail({ id, created }: { id: string; created: boolean }) {
  const { visibleTickets, now } = useNexus()
  const [showBanner, setShowBanner] = useState(created)
  const ticket = visibleTickets.find((t) => t.id === id)

  if (!ticket) {
    return (
      <div className="mx-auto max-w-md rounded-xl border bg-card p-10 text-center">
        <h1 className="text-lg font-semibold text-foreground">Ticket #{id} not found</h1>
        <p className="mt-1 text-sm text-muted-foreground">It may belong to another tenant, or the ID is incorrect.</p>
        <Link href="/tickets" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md px-4 text-sm font-medium text-primary hover:bg-accent">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to tickets
        </Link>
      </div>
    )
  }

  const sla = getSla(ticket, now)
  const reporter = userById(ticket.reporterId)
  const project = projectById(ticket.projectId)

  return (
    <>
      {showBanner && (
        <div role="status" className="mb-5 flex items-center gap-3 rounded-xl border border-green-300 bg-success-soft px-4 py-3">
          <CheckCircle2 className="size-5 shrink-0 text-success" aria-hidden="true" />
          <p className="flex-1 text-sm text-success-ink">
            <span className="font-semibold">Ticket #{ticket.id} submitted.</span> Your SLA clock has started — you&apos;ll be notified when a developer is assigned.
          </p>
          <button type="button" onClick={() => setShowBanner(false)} className="flex size-9 items-center justify-center rounded-md text-success-ink hover:bg-green-100">
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">Dismiss</span>
          </button>
        </div>
      )}

      <nav aria-label="Breadcrumb" className="mb-3">
        <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <li><Link href="/tickets" className="hover:text-foreground hover:underline">Tickets</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-mono font-medium text-foreground">#{ticket.id}</li>
        </ol>
      </nav>

      <header className="mb-6 flex items-start justify-between gap-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">{CATEGORY_LABEL[ticket.category]}</span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground text-balance">{ticket.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {companyById(ticket.companyId)?.name} · {project?.name} ({project?.code}) · Opened {formatDateTime(ticket.createdAt)} by {reporter?.name}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] items-start gap-6">
        <div className="flex min-w-0 flex-col gap-6">
          <SlaCountdown ticket={ticket} sla={sla} now={now} />

          <section aria-labelledby="desc-h" className="rounded-xl border bg-card p-6 shadow-xs">
            <h2 id="desc-h" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Description</h2>
            <div className="mt-3 flex items-start gap-3">
              <UserAvatar user={reporter} />
              <p className="flex-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground">{ticket.description}</p>
            </div>
            <AttachmentList attachments={ticket.attachments} />
          </section>

          <CommentThread ticket={ticket} now={now} />
        </div>

        <aside className="flex flex-col gap-4" aria-label="Ticket controls">
          <StatusControl ticket={ticket} />
          <AssigneeControl ticket={ticket} />
          <CompanyCard ticket={ticket} />
        </aside>
      </div>

      <AuditTimeline ticket={ticket} now={now} />
    </>
  )
}
