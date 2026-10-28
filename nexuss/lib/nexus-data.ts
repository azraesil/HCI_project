export type Role = 'admin' | 'pm' | 'developer' | 'client'
export type Status = 'open' | 'in_progress' | 'in_review' | 'resolved'
export type Priority = 'critical' | 'high' | 'medium' | 'low'
export type Category = 'bug' | 'feature' | 'system_down' | 'maintenance'

export interface User {
  id: string
  name: string
  initials: string
  role: Role
  title: string
  email: string
  companyId?: string
  avatarColor: string
}

export interface Company {
  id: string
  name: string
  tier: 'Enterprise' | 'Business' | 'Standard'
  contact: string
}

export interface Project {
  id: string
  name: string
  companyId: string
  code: string
}

export interface Attachment {
  name: string
  sizeKb: number
  kind: 'image' | 'pdf' | 'zip'
}

export interface Comment {
  id: string
  authorId: string
  body: string
  at: number
  internal: boolean
}

export interface AuditEvent {
  id: string
  at: number
  actorId: string
  action: string
  detail?: string
  type: 'created' | 'status' | 'assign' | 'comment' | 'priority' | 'sla'
}

export interface Ticket {
  id: string
  title: string
  description: string
  companyId: string
  projectId: string
  category: Category
  priority: Priority
  status: Status
  assigneeId: string | null
  reporterId: string
  createdAt: number
  slaDueAt: number
  resolvedAt?: number
  attachments: Attachment[]
  comments: Comment[]
  audit: AuditEvent[]
}

/** Fixed reference time so server and client render identical SLA values. */
export const BASE_TIME = Date.UTC(2026, 9, 9, 10, 0, 0)
const MIN = 60_000
const HOUR = 60 * MIN

export const ROLE_LABEL: Record<Role, string> = {
  admin: 'Admin',
  pm: 'Project Manager',
  developer: 'Developer',
  client: 'Client',
}

export const STATUS_LABEL: Record<Status, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  in_review: 'In Review',
  resolved: 'Resolved',
}

export const STATUS_ORDER: Status[] = ['open', 'in_progress', 'in_review', 'resolved']

export const PRIORITY_LABEL: Record<Priority, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

export const PRIORITY_ORDER: Priority[] = ['critical', 'high', 'medium', 'low']

export const PRIORITY_SLA_HOURS: Record<Priority, number> = {
  critical: 4,
  high: 8,
  medium: 24,
  low: 72,
}

export const PRIORITY_SLA_COPY: Record<Priority, { response: string; resolution: string }> = {
  critical: { response: 'First response within 15 min', resolution: 'Resolution target: 4 hours' },
  high: { response: 'First response within 1 hour', resolution: 'Resolution target: 8 hours' },
  medium: { response: 'First response within 4 hours', resolution: 'Resolution target: 1 business day' },
  low: { response: 'First response within 1 business day', resolution: 'Resolution target: 3 business days' },
}

export const CATEGORY_LABEL: Record<Category, string> = {
  bug: 'Bug',
  feature: 'Feature Request',
  system_down: 'System Down',
  maintenance: 'Maintenance',
}

export const USERS: User[] = [
  { id: 'u1', name: 'Elena Marsh', initials: 'EM', role: 'admin', title: 'Platform Administrator', email: 'elena.marsh@nexus.io', avatarColor: '#0F172A' },
  { id: 'u2', name: 'Daniel Okafor', initials: 'DO', role: 'pm', title: 'Delivery Project Manager', email: 'daniel.okafor@nexus.io', avatarColor: '#7C3AED' },
  { id: 'u3', name: 'Priya Raman', initials: 'PR', role: 'developer', title: 'Senior Backend Engineer', email: 'priya.raman@nexus.io', avatarColor: '#2563EB' },
  { id: 'u4', name: 'Marco Bellini', initials: 'MB', role: 'developer', title: 'Mobile Engineer', email: 'marco.bellini@nexus.io', avatarColor: '#0E7490' },
  { id: 'u5', name: 'Aylin Kaya', initials: 'AK', role: 'developer', title: 'Site Reliability Engineer', email: 'aylin.kaya@nexus.io', avatarColor: '#B45309' },
  { id: 'u6', name: 'Sam Chen', initials: 'SC', role: 'developer', title: 'Frontend Engineer', email: 'sam.chen@nexus.io', avatarColor: '#15803D' },
  { id: 'u7', name: 'Laura Fischer', initials: 'LF', role: 'client', title: 'IT Operations Lead, Helios Bank', email: 'laura.fischer@heliosbank.com', companyId: 'c1', avatarColor: '#BE185D' },
]

export const DEMO_USER_BY_ROLE: Record<Role, string> = {
  admin: 'u1',
  pm: 'u2',
  developer: 'u3',
  client: 'u7',
}

export const COMPANIES: Company[] = [
  { id: 'c1', name: 'Helios Bank', tier: 'Enterprise', contact: 'Laura Fischer' },
  { id: 'c2', name: 'Orbit Logistics', tier: 'Business', contact: 'Tomás Rivera' },
  { id: 'c3', name: 'Verdant Health', tier: 'Enterprise', contact: 'Hannah Moore' },
  { id: 'c4', name: 'Kestrel Retail', tier: 'Standard', contact: 'Jonas Berg' },
]

export const PROJECTS: Project[] = [
  { id: 'p1', name: 'Mobile Banking App', companyId: 'c1', code: 'HB-MOB' },
  { id: 'p2', name: 'Core Payments API', companyId: 'c1', code: 'HB-PAY' },
  { id: 'p3', name: 'Fleet Tracker', companyId: 'c2', code: 'OL-FLT' },
  { id: 'p4', name: 'Warehouse WMS', companyId: 'c2', code: 'OL-WMS' },
  { id: 'p5', name: 'Patient Portal', companyId: 'c3', code: 'VH-PPT' },
  { id: 'p6', name: 'POS Integration', companyId: 'c4', code: 'KR-POS' },
]

export const developers = () => USERS.filter((u) => u.role === 'developer')
export const userById = (id: string | null | undefined) => USERS.find((u) => u.id === id)
export const companyById = (id: string) => COMPANIES.find((c) => c.id === id)
export const projectById = (id: string) => PROJECTS.find((p) => p.id === id)

interface Seed {
  n: number
  title: string
  description: string
  projectId: string
  category: Category
  priority: Priority
  status: Status
  assigneeId: string | null
  reporterId: string
  /** minutes before BASE_TIME the ticket was created */
  ageMin: number
  attachments?: Attachment[]
  comments?: Omit<Comment, 'id'>[]
}

const seeds: Seed[] = [
  {
    n: 104, title: 'Payment authorization timeouts on card checkout', projectId: 'p2', category: 'system_down', priority: 'critical', status: 'in_progress', assigneeId: 'u3', reporterId: 'u7', ageMin: 5 * 60 + 40,
    description: 'Since 04:20 UTC roughly 18% of card authorization requests to /v2/authorize return 504 after 30s. Affects all card networks. Retrying succeeds in most cases but customers are being double-charged on retry in some flows.\n\nSteps to reproduce:\n1. Open checkout on the mobile app\n2. Pay with any Visa test card\n3. Observe spinner for ~30s followed by "Payment failed"',
    attachments: [{ name: 'gateway-latency-p99.png', sizeKb: 412, kind: 'image' }, { name: 'auth-service-logs.zip', sizeKb: 8240, kind: 'zip' }],
    comments: [
      { authorId: 'u3', body: 'Connection pool to the issuer proxy is saturated. Raising pool size as a stopgap while I trace the leak.', at: BASE_TIME - 3 * HOUR, internal: true },
      { authorId: 'u2', body: 'Client informed. Please post an update every 30 minutes until resolved.', at: BASE_TIME - 2 * HOUR, internal: true },
    ],
  },
  {
    n: 108, title: 'Login loop after biometric enrolment on iOS 18', projectId: 'p1', category: 'bug', priority: 'critical', status: 'open', assigneeId: null, reporterId: 'u7', ageMin: 3 * 60 + 5,
    description: 'Users who enable Face ID during onboarding are returned to the login screen after successful authentication. Reported by 240+ customers via the support line this morning.',
    attachments: [{ name: 'screen-recording-loop.png', sizeKb: 980, kind: 'image' }],
  },
  {
    n: 112, title: 'GPS positions delayed by 10+ minutes on dashboard', projectId: 'p3', category: 'bug', priority: 'high', status: 'in_progress', assigneeId: 'u5', reporterId: 'u2', ageMin: 6 * 60 + 30,
    description: 'Vehicle markers on the live map lag behind real positions by 10–14 minutes. The ingestion queue shows a growing backlog since the last deploy.',
  },
  {
    n: 97, title: 'Appointment reminders sent twice to patients', projectId: 'p5', category: 'bug', priority: 'high', status: 'in_review', assigneeId: 'u6', reporterId: 'u2', ageMin: 7 * 60 + 15,
    description: 'Duplicate SMS and email reminders are dispatched for appointments booked through the portal. Root cause appears to be a retry without idempotency key in the notification worker.',
    attachments: [{ name: 'duplicate-sms-report.pdf', sizeKb: 156, kind: 'pdf' }],
  },
  {
    n: 115, title: 'Barcode scanner disconnects after idle period', projectId: 'p6', category: 'bug', priority: 'high', status: 'open', assigneeId: null, reporterId: 'u1', ageMin: 6 * 60 + 50,
    description: 'Bluetooth scanners paired with POS terminals disconnect after 5 minutes idle and require a terminal restart to reconnect.',
  },
  {
    n: 101, title: 'Export statements as CSV from account history', projectId: 'p1', category: 'feature', priority: 'medium', status: 'in_progress', assigneeId: 'u4', reporterId: 'u7', ageMin: 14 * 60,
    description: 'Business customers need to export up to 12 months of transaction history as CSV for their accounting tools.',
  },
  {
    n: 99, title: 'Rotate TLS certificates for warehouse edge nodes', projectId: 'p4', category: 'maintenance', priority: 'medium', status: 'open', assigneeId: 'u5', reporterId: 'u2', ageMin: 10 * 60,
    description: 'Certificates on 14 edge nodes expire on Oct 15. Schedule rotation during the Sunday maintenance window.',
  },
  {
    n: 93, title: 'Slow load of lab results page (> 6s)', projectId: 'p5', category: 'bug', priority: 'medium', status: 'in_progress', assigneeId: 'u6', reporterId: 'u2', ageMin: 22 * 60 + 30,
    description: 'Lab results page waits on three sequential API calls. Parallelising and caching should bring it under 2s.',
  },
  {
    n: 90, title: 'Add Turkish locale to customer receipts', projectId: 'p6', category: 'feature', priority: 'low', status: 'open', assigneeId: null, reporterId: 'u1', ageMin: 30 * 60,
    description: 'Kestrel is opening stores in Istanbul and needs receipts rendered in Turkish, including correct number and currency formatting.',
  },
  {
    n: 88, title: 'Webhook signature mismatch for refund events', projectId: 'p2', category: 'bug', priority: 'high', status: 'resolved', assigneeId: 'u3', reporterId: 'u7', ageMin: 26 * 60,
    description: 'Refund webhooks fail signature verification because the payload is re-serialised before signing.',
  },
  {
    n: 86, title: 'Dark mode contrast issues on transfer screen', projectId: 'p1', category: 'bug', priority: 'low', status: 'in_review', assigneeId: 'u4', reporterId: 'u7', ageMin: 40 * 60,
    description: 'Secondary text on the transfer confirmation screen fails WCAG AA contrast in dark mode.',
  },
  {
    n: 84, title: 'Route optimisation ignores vehicle weight limits', projectId: 'p3', category: 'bug', priority: 'medium', status: 'resolved', assigneeId: 'u5', reporterId: 'u2', ageMin: 48 * 60,
    description: 'Routes for heavy trucks are planned through bridges with weight restrictions.',
  },
  {
    n: 110, title: 'Patient portal unavailable in EU region', projectId: 'p5', category: 'system_down', priority: 'critical', status: 'in_review', assigneeId: 'u5', reporterId: 'u1', ageMin: 3 * 60 + 30,
    description: 'Health checks failing for eu-west-1 load balancer. Failover to eu-central-1 is in progress.',
  },
  {
    n: 106, title: 'Inventory sync drops SKUs with special characters', projectId: 'p4', category: 'bug', priority: 'high', status: 'in_progress', assigneeId: 'u3', reporterId: 'u2', ageMin: 7 * 60 + 20,
    description: 'SKUs containing "/" or "&" are silently skipped by the nightly inventory sync.',
  },
  {
    n: 80, title: 'Quarterly database index maintenance', projectId: 'p2', category: 'maintenance', priority: 'low', status: 'resolved', assigneeId: 'u3', reporterId: 'u1', ageMin: 70 * 60,
    description: 'Rebuild fragmented indexes on the ledger database during the maintenance window.',
  },
  {
    n: 114, title: 'Gift card balance shows stale amount', projectId: 'p6', category: 'bug', priority: 'medium', status: 'open', assigneeId: null, reporterId: 'u1', ageMin: 2 * 60,
    description: 'After redemption, the gift card balance on the receipt reflects the pre-purchase amount.',
  },
]

function buildTicket(s: Seed): Ticket {
  const project = projectById(s.projectId)!
  const createdAt = BASE_TIME - s.ageMin * MIN
  const slaDueAt = createdAt + PRIORITY_SLA_HOURS[s.priority] * HOUR
  const audit: AuditEvent[] = [
    { id: `${s.n}-a1`, at: createdAt, actorId: s.reporterId, action: 'Ticket created', detail: `Priority ${PRIORITY_LABEL[s.priority]} · SLA ${PRIORITY_SLA_HOURS[s.priority]}h`, type: 'created' },
  ]
  if (s.assigneeId) {
    audit.push({ id: `${s.n}-a2`, at: createdAt + 12 * MIN, actorId: 'u2', action: 'Developer assigned', detail: userById(s.assigneeId)?.name, type: 'assign' })
  }
  const statusPath = STATUS_ORDER.slice(1, STATUS_ORDER.indexOf(s.status) + 1)
  statusPath.forEach((st, i) => {
    audit.push({
      id: `${s.n}-s${i}`,
      at: createdAt + (25 + i * 40) * MIN,
      actorId: s.assigneeId ?? 'u2',
      action: `Status changed to ${STATUS_LABEL[st]}`,
      detail: `${STATUS_LABEL[STATUS_ORDER[i]]} → ${STATUS_LABEL[st]}`,
      type: 'status',
    })
  })
  const comments = (s.comments ?? []).map((c, i) => ({ ...c, id: `${s.n}-c${i}` }))
  comments.forEach((c) => {
    audit.push({ id: `${c.id}-audit`, at: c.at, actorId: c.authorId, action: c.internal ? 'Internal note added' : 'Comment added', type: 'comment' })
  })
  audit.sort((a, b) => a.at - b.at)
  return {
    id: `NX-${s.n}`,
    title: s.title,
    description: s.description,
    companyId: project.companyId,
    projectId: s.projectId,
    category: s.category,
    priority: s.priority,
    status: s.status,
    assigneeId: s.assigneeId,
    reporterId: s.reporterId,
    createdAt,
    slaDueAt,
    resolvedAt: s.status === 'resolved' ? createdAt + (25 + statusPath.length * 40) * MIN : undefined,
    attachments: s.attachments ?? [],
    comments,
    audit,
  }
}

export const SEED_TICKETS: Ticket[] = seeds.map(buildTicket).sort((a, b) => b.createdAt - a.createdAt)

export const NEXT_TICKET_NUMBER = Math.max(...seeds.map((s) => s.n)) + 1
