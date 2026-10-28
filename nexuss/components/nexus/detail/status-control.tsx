'use client'

import { useState } from 'react'
import { ArrowRight, Check, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { STATUS_LABEL, STATUS_ORDER, type Status, type Ticket } from '@/lib/nexus-data'
import { getSla } from '@/lib/sla'
import { useNexus } from '../nexus-provider'

const NEXT_LABEL: Record<Status, string> = {
  open: 'Start work',
  in_progress: 'Send to review',
  in_review: 'Mark resolved',
  resolved: '',
}

export function StatusControl({ ticket }: { ticket: Ticket }) {
  const { user, changeStatus, now } = useNexus()
  const [confirm, setConfirm] = useState<Status | null>(null)
  const canEdit = user?.role !== 'client'
  const idx = STATUS_ORDER.indexOf(ticket.status)
  const next = STATUS_ORDER[idx + 1]
  const prev = STATUS_ORDER[idx - 1]
  const sla = getSla(ticket, now)

  return (
    <section aria-labelledby="status-h" className="rounded-xl border bg-card p-5 shadow-xs">
      <h2 id="status-h" className="text-sm font-semibold text-foreground">Workflow</h2>
      <ol className="mt-4 flex flex-col">
        {STATUS_ORDER.map((s, i) => {
          const done = i < idx || ticket.status === 'resolved'
          const current = i === idx
          return (
            <li key={s} className="relative flex items-center gap-3 pb-4 last:pb-0" aria-current={current ? 'step' : undefined}>
              {i < STATUS_ORDER.length - 1 && (
                <span className={cn('absolute top-6 left-[11px] h-[calc(100%-16px)] w-0.5', done ? 'bg-primary' : 'bg-slate-200')} aria-hidden="true" />
              )}
              <span
                className={cn(
                  'z-10 flex size-6 items-center justify-center rounded-full border-2 text-xs font-semibold',
                  done ? 'border-primary bg-primary text-white' : current ? 'border-primary bg-card text-primary' : 'border-slate-300 bg-card text-slate-400',
                )}
              >
                {done ? <Check className="size-3.5" strokeWidth={3} aria-hidden="true" /> : i + 1}
              </span>
              <span className={cn('text-sm', current ? 'font-semibold text-foreground' : done ? 'text-foreground' : 'text-muted-foreground')}>
                {STATUS_LABEL[s]}
              </span>
              {current && <span className="ml-auto rounded bg-accent px-1.5 py-0.5 text-xs font-semibold text-accent-foreground">Current</span>}
            </li>
          )
        })}
      </ol>

      {canEdit ? (
        <div className="mt-5 flex flex-col gap-3 border-t pt-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Change status to</span>
            <select
              value=""
              onChange={(e) => e.target.value && setConfirm(e.target.value as Status)}
              className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 focus-visible:outline-none"
            >
              <option value="" disabled>{STATUS_LABEL[ticket.status]} (current) — choose…</option>
              {STATUS_ORDER.filter((s) => s !== ticket.status).map((s) => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
            </select>
          </label>
          {next && (
            <Button size="lg" className={cn('w-full font-semibold', next === 'resolved' && 'bg-success hover:bg-success/90')} onClick={() => setConfirm(next)}>
              {NEXT_LABEL[ticket.status]}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          )}
          {ticket.status === 'resolved' && prev && (
            <Button variant="outline" size="lg" className="w-full" onClick={() => setConfirm('in_progress')}>
              <RotateCcw className="size-4" aria-hidden="true" />
              Reopen ticket
            </Button>
          )}
        </div>
      ) : (
        <p className="mt-4 border-t pt-4 text-xs text-muted-foreground">Status is updated by the Nexus engineering team. You&apos;ll be notified of every change.</p>
      )}

      <Dialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirm === 'resolved' ? `Resolve #${ticket.id}?` : `Change #${ticket.id} to ${confirm ? STATUS_LABEL[confirm] : ''}?`}
            </DialogTitle>
            <DialogDescription>
              {confirm === 'resolved'
                ? `This stops the SLA clock and notifies the client that the issue is fixed. ${
                    sla.state === 'breached' ? 'It will be recorded as an SLA miss.' : 'It will be recorded as SLA met.'
                  }`
                : ticket.status === 'resolved'
                  ? 'This reopens the ticket. The original SLA deadline still applies, so it may be immediately overdue.'
                  : 'The client is notified and the change is recorded in the audit log.'}
            </DialogDescription>
          </DialogHeader>
          {confirm && (
            <p className="flex items-center justify-center gap-3 rounded-lg bg-muted py-3 text-sm font-medium">
              <span className="text-muted-foreground">{STATUS_LABEL[ticket.status]}</span>
              <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />
              <span className="text-foreground">{STATUS_LABEL[confirm]}</span>
            </p>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" size="lg" />}>Cancel</DialogClose>
            <Button
              size="lg"
              className={confirm === 'resolved' ? 'bg-success hover:bg-success/90' : undefined}
              onClick={() => {
                if (confirm) changeStatus(ticket.id, confirm)
                setConfirm(null)
              }}
            >
              {confirm === 'resolved' ? 'Yes, mark resolved' : 'Confirm change'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
