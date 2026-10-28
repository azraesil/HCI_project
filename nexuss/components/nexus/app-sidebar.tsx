'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Building2, LayoutDashboard, ListChecks, Settings, SquarePen, UserCheck, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Role } from '@/lib/nexus-data'
import { useNexus } from './nexus-provider'
import { NexusLogo } from './nexus-logo'

interface NavItem {
  href: string
  label: string
  clientLabel?: string
  Icon: typeof LayoutDashboard
  roles: Role[]
}

const NAV: NavItem[] = [
  // Dashboard: Müşteri hariç herkes
  { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard, roles: ['admin', 'pm', 'developer'] },

  // All Tickets: Admin, PM, Developer görür (Müşteri için 'My Tickets' olarak adlandırılır)
  { href: '/tickets', label: 'All Tickets', clientLabel: 'My Tickets', Icon: ListChecks, roles: ['admin', 'pm', 'developer', 'client'] },

  // SADECE VE SADECE YAZILIMCI (DEVELOPER)
  { href: '/my-tickets', label: 'Assigned to Me', Icon: UserCheck, roles: ['developer'] },

  // Yeni Bilet Açma: Sadece Müşteri
  { href: '/tickets/new', label: 'Submit a Ticket', Icon: SquarePen, roles: ['client'] },

  // Şirketler & Projeler: Sadece Admin ve PM
  { href: '/companies', label: 'Companies & Projects', Icon: Building2, roles: ['admin', 'pm'] },

  // Ekip Yönetimi / Geliştiriciler: Sadece Admin ve PM
  { href: '/team', label: 'Team', Icon: Users, roles: ['admin', 'pm'] },

  // SLA Analitikleri: Sadece Admin ve PM
  { href: '/analytics', label: 'SLA Analytics', Icon: BarChart3, roles: ['admin', 'pm'] },

  // Ayarlar: Tüm roller
  { href: '/settings', label: 'Settings', Icon: Settings, roles: ['admin', 'pm', 'developer', 'client'] },
]

export function AppSidebar({
  className,
  onNavigate,
}: {
  className?: string
  onNavigate?: () => void
} = {}) {
  const pathname = usePathname()
  const { user, visibleTickets } = useNexus()
  if (!user) return null

  const items = NAV.filter((n) => n.roles.includes(user.role))

  // Yalnızca URL ile en tam ve en uzun eşleşen tek menü öğesini aktif seçer
  const activeHref = items
    .filter((n) => pathname === n.href || (pathname.startsWith(`${n.href}/`) && n.href !== '/'))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href

  // Açık bilet sayaçları
  const openCount = visibleTickets.filter((t) => t.status !== 'resolved').length
  const myAssignedCount = visibleTickets.filter(
    (t) => t.assigneeId === user.id && t.status !== 'resolved'
  ).length

  return (
    <aside className={cn('flex h-dvh w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground', className)} aria-label="Primary">
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-5">
        <NexusLogo />
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-muted">Workspace</p>
        <ul className="flex flex-col gap-1">
          {items.map((item) => {
            const active = item.href === activeHref
            const label = user.role === 'client' && item.clientLabel ? item.clientLabel : item.label

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
                    active
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  )}
                >
                  <item.Icon className="size-[18px] shrink-0" aria-hidden="true" />
                  <span className="flex-1">{label}</span>

                  {/* All Tickets için açık bilet sayısı */}
                  {item.href === '/tickets' && (
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums',
                        active ? 'bg-white/20 text-white' : 'bg-sidebar-accent text-sidebar-foreground',
                      )}
                    >
                      {openCount}
                    </span>
                  )}

                  {/* Sadece geliştiricide görünen Assigned to Me açık bilet sayısı */}
                  {item.href === '/my-tickets' && myAssignedCount > 0 && (
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums',
                        active ? 'bg-white/20 text-white' : 'bg-primary/20 text-primary-foreground font-bold',
                      )}
                    >
                      {myAssignedCount}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      <div className="m-3 rounded-lg border border-sidebar-border bg-sidebar-accent/60 p-3">
        <p className="text-xs font-semibold text-white">SLA policy</p>
        <dl className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-sidebar-muted">
          <dt>Critical</dt><dd className="text-right font-mono text-sidebar-foreground">4h</dd>
          <dt>High</dt><dd className="text-right font-mono text-sidebar-foreground">8h</dd>
          <dt>Medium</dt><dd className="text-right font-mono text-sidebar-foreground">24h</dd>
          <dt>Low</dt><dd className="text-right font-mono text-sidebar-foreground">72h</dd>
        </dl>
      </div>
    </aside>
  )
}