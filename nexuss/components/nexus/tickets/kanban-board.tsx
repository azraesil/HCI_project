'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { STATUS_LABEL, STATUS_ORDER, companyById, userById, type Status, type Ticket } from '@/lib/nexus-data'
import { useNexus } from '../nexus-provider'
import { PriorityBadge, UserAvatar } from '../badges'

const COLUMN_CONFIG: Record<
  Status,
  {
    label: string
    dotColor: string
    borderColor: string
    headerBg: string
    badgeBg: string
  }
> = {
  open: {
    label: 'Open',
    dotColor: 'bg-slate-400',
    borderColor: 'border-slate-300 dark:border-slate-800',
    headerBg: 'bg-slate-500/10 text-slate-700 dark:text-slate-300',
    badgeBg: 'bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
  },
  in_progress: {
    label: 'In Progress',
    dotColor: 'bg-amber-500',
    borderColor: 'border-amber-400/60 dark:border-amber-500/30',
    headerBg: 'bg-amber-500/10 text-amber-800 dark:text-amber-300',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300',
  },
  in_review: {
    label: 'In Review',
    dotColor: 'bg-blue-500',
    borderColor: 'border-blue-400/60 dark:border-blue-500/30',
    headerBg: 'bg-blue-500/10 text-blue-800 dark:text-blue-300',
    badgeBg: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300',
  },
  resolved: {
    label: 'Resolved',
    dotColor: 'bg-emerald-500',
    borderColor: 'border-emerald-400/60 dark:border-emerald-500/30',
    headerBg: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300',
  },
}

export function KanbanBoard({ tickets }: { tickets: Ticket[]; now: number }) {
  const { changeStatus, user } = useNexus()
  const canMove = user?.role !== 'client'
  const [dragId, setDragId] = useState<string | null>(null)
  const [overCol, setOverCol] = useState<Status | null>(null)
  const [announce, setAnnounce] = useState('')
  const [undo, setUndo] = useState<{ id: string; from: Status; to: Status } | null>(null)
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current)
      }
    }
  }, [])

  const handleUndo = () => {
    if (!undo) return
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current)
    }
    changeStatus(undo.id, undo.from)
    setUndo(null)
  }

  return (
    <>
      <p className="sr-only" aria-live="polite">{announce}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {STATUS_ORDER.map((status) => {
          const col = tickets.filter((t) => t.status === status)
          const config = COLUMN_CONFIG[status]

          return (
            <section
              key={status}
              aria-labelledby={`col-${status}`}
              onDragOver={(e) => {
                if (!canMove || !dragId) return
                e.preventDefault()
                setOverCol(status)
              }}
              onDragLeave={() => setOverCol((c) => (c === status ? null : c))}
              onDrop={(e) => {
                e.preventDefault()
                const t = tickets.find((x) => x.id === dragId)
                if (t && t.status !== status) {
                  const previousStatus = t.status
                  changeStatus(t.id, status)
                  setAnnounce(`#${t.id} moved to ${config.label}`)

                  if (undoTimeoutRef.current) {
                    clearTimeout(undoTimeoutRef.current)
                  }
                  setUndo({ id: t.id, from: previousStatus, to: status })
                  undoTimeoutRef.current = setTimeout(() => {
                    setUndo(null)
                  }, 6000)
                }
                setDragId(null)
                setOverCol(null)
              }}
              className={cn(
                'flex flex-col rounded-2xl border-2 bg-muted/30 transition-all pb-3 shadow-xs',
                config.borderColor,
                overCol === status && 'ring-2 ring-primary ring-offset-2'
              )}
            >
              {/* Sürecin Rengini Yansıtan Sütun Başlığı */}
              <header className={cn('flex items-center gap-2.5 px-4 py-3 rounded-t-[14px] border-b', config.headerBg, config.borderColor)}>
                <span className={cn('size-2.5 rounded-full ring-2 ring-background', config.dotColor)} aria-hidden="true" />
                <h2 id={`col-${status}`} className="text-xs font-bold uppercase tracking-wider">
                  {config.label}
                </h2>
                <span className={cn('ml-auto rounded-full px-2.5 py-0.5 text-xs font-mono font-bold', config.badgeBg)}>
                  {col.length}
                </span>
              </header>

              {/* Temiz & Sadeleştirilmiş Bilet Kartları */}
              <ul className="flex flex-col gap-2.5 px-3 pt-3">
                {col.length === 0 && (
                  <li className="rounded-xl border border-dashed border-border/80 py-10 text-center text-xs text-muted-foreground">
                    No tickets in this stage
                  </li>
                )}
                {col.map((t) => {
                  const assignee = userById(t.assigneeId)
                  const company = companyById(t.companyId)

                  return (
                    <li
                      key={t.id}
                      draggable={canMove}
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = 'move'
                        setDragId(t.id)
                      }}
                      onDragEnd={() => {
                        setDragId(null)
                        setOverCol(null)
                      }}
                      className={cn(
                        'group relative flex flex-col justify-between rounded-xl border border-border/80 bg-card p-3.5 shadow-xs transition-all hover:border-foreground/20 hover:shadow-sm',
                        dragId === t.id && 'opacity-40',
                        canMove && 'cursor-grab active:cursor-grabbing'
                      )}
                    >
                      {/* Üst Satır: Bilet Kodu + Şirket + Öncelik Rozeti */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Link
                            href={`/tickets/${t.id}`}
                            className="font-mono text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors focus-visible:outline-none"
                          >
                            #{t.id}
                          </Link>
                          <span className="text-muted-foreground/30 text-xs">·</span>
                          <span className="truncate text-xs font-medium text-muted-foreground">
                            {company?.name}
                          </span>
                        </div>
                        <PriorityBadge priority={t.priority} />
                      </div>

                      {/* Orta Kısım: Bilet Başlığı */}
                      <Link
                        href={`/tickets/${t.id}`}
                        className="my-3 block text-sm font-medium leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2 focus-visible:outline-none"
                      >
                        {t.title}
                      </Link>

                      {/* Alt Satır: Sadece Atanan Kişi */}
                      <div className="flex items-center justify-end pt-2 border-t border-border/40">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground font-medium truncate max-w-[140px]">
                            {assignee ? assignee.name : 'Unassigned'}
                          </span>
                          <UserAvatar user={assignee} size="sm" />
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </div>

      {undo && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-xl bg-navy px-4 py-2.5 text-sm font-medium text-white shadow-xl border border-slate-700/60"
        >
          <span>
            #{undo.id} moved to {STATUS_LABEL[undo.to]}
          </span>
          <button
            type="button"
            onClick={handleUndo}
            className="rounded-lg bg-white/15 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy cursor-pointer"
          >
            Undo
          </button>
        </div>
      )}
    </>
  )
}