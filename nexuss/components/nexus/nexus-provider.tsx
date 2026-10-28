'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  BASE_TIME,
  DEMO_USER_BY_ROLE,
  NEXT_TICKET_NUMBER,
  PRIORITY_SLA_HOURS,
  SEED_TICKETS,
  STATUS_LABEL,
  userById,
  type Category,
  type Priority,
  type Role,
  type Status,
  type Ticket,
  type User,
  type Attachment,
} from '@/lib/nexus-data'

export const ROLE_COOKIE = 'nexus_role'

export interface NewTicketInput {
  projectId: string
  companyId: string
  title: string
  category: Category
  priority: Priority
  description: string
  attachments: Attachment[]
}

interface NexusContextValue {
  user: User | null
  now: number
  tenantId: string
  setTenantId: (id: string) => void
  tickets: Ticket[]
  visibleTickets: Ticket[]
  signIn: (role: Role) => void
  signOut: () => void
  createTicket: (input: NewTicketInput) => Ticket
  changeStatus: (id: string, status: Status) => void
  assign: (id: string, userId: string | null) => void
  addComment: (id: string, body: string, internal: boolean) => void
}

const NexusContext = createContext<NexusContextValue | null>(null)

function useSimulatedClock() {
  const [now, setNow] = useState(BASE_TIME)
  useEffect(() => {
    const mountedAt = Date.now()
    const tick = () => setNow(BASE_TIME + (Date.now() - mountedAt))
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])
  return now
}

export function NexusProvider({
  initialRole = null,
  children,
}: {
  initialRole?: Role | null
  children: React.ReactNode
}) {
  const [role, setRole] = useState<Role | null>(initialRole)
  const [tickets, setTickets] = useState<Ticket[]>(SEED_TICKETS)
  const [tenantId, setTenantId] = useState('all')
  const [nextNumber, setNextNumber] = useState(NEXT_TICKET_NUMBER)
  const now = useSimulatedClock()

  const user = role ? (userById(DEMO_USER_BY_ROLE[role]) ?? null) : null

  const signIn = useCallback((r: Role) => {
    document.cookie = `${ROLE_COOKIE}=${r}; path=/; max-age=86400; samesite=lax`
    setRole(r)
    setTenantId(r === 'client' ? 'c1' : 'all')
  }, [])

  const signOut = useCallback(() => {
    document.cookie = `${ROLE_COOKIE}=; path=/; max-age=0`
    setRole(null)
  }, [])

  const actorId = user?.id ?? 'u1'

  const updateTicket = useCallback((id: string, fn: (t: Ticket) => Ticket) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? fn(t) : t)))
  }, [])

  const changeStatus = useCallback(
    (id: string, status: Status) => {
      updateTicket(id, (t) => ({
        ...t,
        status,
        resolvedAt: status === 'resolved' ? now : undefined,
        audit: [
          ...t.audit,
          {
            id: `${id}-${now}-st`,
            at: now,
            actorId,
            action: `Status changed to ${STATUS_LABEL[status]}`,
            detail: `${STATUS_LABEL[t.status]} → ${STATUS_LABEL[status]}`,
            type: 'status',
          },
        ],
      }))
    },
    [updateTicket, now, actorId],
  )

  const assign = useCallback(
    (id: string, userId: string | null) => {
      updateTicket(id, (t) => ({
        ...t,
        assigneeId: userId,
        audit: [
          ...t.audit,
          {
            id: `${id}-${now}-as`,
            at: now,
            actorId,
            action: userId ? 'Developer assigned' : 'Assignee removed',
            detail: userId ? userById(userId)?.name : undefined,
            type: 'assign',
          },
        ],
      }))
    },
    [updateTicket, now, actorId],
  )

  const addComment = useCallback(
    (id: string, body: string, internal: boolean) => {
      updateTicket(id, (t) => ({
        ...t,
        comments: [...t.comments, { id: `${id}-${now}-c`, authorId: actorId, body, at: now, internal }],
        audit: [
          ...t.audit,
          { id: `${id}-${now}-cm`, at: now, actorId, action: internal ? 'Internal note added' : 'Comment added', type: 'comment' },
        ],
      }))
    },
    [updateTicket, now, actorId],
  )

  const createTicket = useCallback(
    (input: NewTicketInput) => {
      const ticket: Ticket = {
        id: `NX-${nextNumber}`,
        ...input,
        status: 'open',
        assigneeId: null,
        reporterId: actorId,
        createdAt: now,
        slaDueAt: now + PRIORITY_SLA_HOURS[input.priority] * 3_600_000,
        comments: [],
        audit: [
          {
            id: `NX-${nextNumber}-created`,
            at: now,
            actorId,
            action: 'Ticket created',
            detail: `Priority ${input.priority} · SLA ${PRIORITY_SLA_HOURS[input.priority]}h`,
            type: 'created',
          },
        ],
      }
      setNextNumber((n) => n + 1)
      setTickets((prev) => [ticket, ...prev])
      return ticket
    },
    [nextNumber, now, actorId],
  )

  const visibleTickets = useMemo(() => {
    if (user?.role === 'client') return tickets.filter((t) => t.companyId === user.companyId)
    if (tenantId === 'all') return tickets
    return tickets.filter((t) => t.companyId === tenantId)
  }, [tickets, tenantId, user])

  const value: NexusContextValue = {
    user,
    now,
    tenantId,
    setTenantId,
    tickets,
    visibleTickets,
    signIn,
    signOut,
    createTicket,
    changeStatus,
    assign,
    addComment,
  }

  return <NexusContext.Provider value={value}>{children}</NexusContext.Provider>
}

export function useNexus() {
  const ctx = useContext(NexusContext)
  if (!ctx) throw new Error('useNexus must be used within NexusProvider')
  return ctx
}
