'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useEffect } from 'react'
import { Bell, Building2, ChevronDown, LogOut, Plus, RefreshCw, AlertTriangle, UserCheck, Moon, Sun, Menu, Eye } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { COMPANIES, ROLE_LABEL, companyById, type Role } from '@/lib/nexus-data'
import { getSla } from '@/lib/sla'
import { cn } from '@/lib/utils'
import { useNexus } from './nexus-provider'
import { GlobalSearch } from './global-search'
import { UserAvatar } from './badges'

export function TopBar({
  onMenuClick,
  sidebarOpen = true,
}: {
  onMenuClick?: () => void
  sidebarOpen?: boolean
} = {}) {
  const { user, tenantId, setTenantId, signIn, signOut, visibleTickets, now } = useNexus()
  const router = useRouter()
  const [readIds, setReadIds] = useState<string[]>([])

  // Light / Dark Theme Management
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const isDark =
      document.documentElement.classList.contains('dark') ||
      localStorage.getItem('nexus-theme') === 'dark' ||
      (!localStorage.getItem('nexus-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)

    if (isDark) {
      setTheme('dark')
      document.documentElement.classList.add('dark')
    } else {
      setTheme('light')
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const changeTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme)
    localStorage.setItem('nexus-theme', newTheme)
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const notifications = useMemo(() => {
    return visibleTickets
      .filter((t) => t.status !== 'resolved')
      .map((t) => ({ t, sla: getSla(t, now) }))
      .filter(({ sla }) => sla.state === 'breached' || sla.state === 'at_risk')
      .sort((a, b) => a.sla.remainingMs - b.sla.remainingMs)
      .slice(0, 5)
  }, [visibleTickets, now])

  if (!user) return null
  const unread = notifications.filter((n) => !readIds.includes(n.t.id)).length
  const tenantName = tenantId === 'all' ? 'All companies' : companyById(tenantId)?.name

  const switchRole = (r: Role) => {
    signIn(r)
    router.push(r === 'client' ? '/tickets/new' : r === 'developer' ? '/tickets' : '/dashboard')
  }

  return (
    <header className="sticky top-0 z-30 flex min-h-16 h-auto py-2 items-center gap-2.5 sm:gap-4 border-b bg-card/95 px-4 sm:px-6 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      {onMenuClick && (
        <button
          type="button"
          onClick={onMenuClick}
          aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
          title={sidebarOpen ? 'Close navigation' : 'Open navigation'}
          className={cn(
            'flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer',
            sidebarOpen && 'lg:hidden'
          )}
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>
      )}
      <GlobalSearch />

      <div className="ml-auto flex items-center gap-2.5">
        {user.role === 'client' ? (
          <span className="flex h-11 items-center gap-2 rounded-md border bg-muted px-3 text-sm font-medium text-foreground">
            <Building2 className="size-4 text-muted-foreground" aria-hidden="true" />
            {companyById(user.companyId!)?.name}
          </span>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="outline" className="h-11 gap-2 px-3" aria-label={`Tenant: ${tenantName}. Change tenant`} />}
            >
              <Building2 className="size-4 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm font-medium">{tenantName}</span>
              <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Viewing tenant</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={tenantId} onValueChange={(v) => setTenantId(v as string)}>
                  <DropdownMenuRadioItem value="all" className="min-h-10">All companies</DropdownMenuRadioItem>
                  {COMPANIES.map((c) => (
                    <DropdownMenuRadioItem key={c.id} value={c.id} className="min-h-10">
                      <span className="flex flex-col">
                        <span>{c.name}</span>
                        <span className="text-xs text-muted-foreground">{c.tier}</span>
                      </span>
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Light / Dark Mode Toggle */}
        <div 
          role="group" 
          aria-label="Theme switcher" 
          className="flex h-10 items-center rounded-lg border border-border bg-muted/60 p-1"
        >
          <button
            type="button"
            onClick={() => changeTheme('light')}
            title="Light mode"
            aria-label="Light mode"
            aria-pressed={theme === 'light'}
            className={cn(
              'flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-all cursor-pointer',
              theme === 'light'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Sun className={cn('size-4', theme === 'light' ? 'text-amber-500' : 'text-muted-foreground')} />
            <span className="hidden sm:inline">Light</span>
          </button>

          <button
            type="button"
            onClick={() => changeTheme('dark')}
            title="Dark mode"
            aria-label="Dark mode"
            aria-pressed={theme === 'dark'}
            className={cn(
              'flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-all cursor-pointer',
              theme === 'dark'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Moon className={cn('size-4', theme === 'dark' ? 'text-blue-400' : 'text-muted-foreground')} />
            <span className="hidden sm:inline">Dark</span>
          </button>
        </div>

        {/* SLA Notification Popover */}
        <Popover>
          <PopoverTrigger
            render={
              <Button variant="ghost" size="icon-lg" className="relative cursor-pointer" aria-label={`Notifications, ${unread} unread`} />
            }
          >
            <Bell className="size-5" aria-hidden="true" />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 flex min-w-5 items-center justify-center rounded-full bg-danger px-1 text-xs font-bold text-white ring-2 ring-card" aria-hidden="true">
                {unread}
              </span>
            )}
          </PopoverTrigger>
          <PopoverContent align="end" className="w-96 p-0">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <p className="text-sm font-semibold">SLA alerts</p>
              <button
                type="button"
                className="min-h-9 rounded px-2 text-xs font-medium text-primary hover:underline disabled:text-muted-foreground disabled:no-underline cursor-pointer"
                onClick={() => setReadIds(notifications.map((n) => n.t.id))}
                disabled={unread === 0}
              >
                Mark all as read
              </button>
            </div>
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">All tickets are within SLA. Nothing needs your attention.</p>
            ) : (
              <ul className="max-h-96 divide-y overflow-y-auto">
                {notifications.map(({ t, sla }) => {
                  const isRead = readIds.includes(t.id)
                  return (
                    <li key={t.id}>
                      <Link
                        href={`/tickets/${t.id}`}
                        onClick={() => setReadIds((r) => [...r, t.id])}
                        className={cn('flex gap-3 px-4 py-3 hover:bg-muted', !isRead && 'bg-accent/50')}
                      >
                        <AlertTriangle
                          className={cn('mt-0.5 size-4 shrink-0', sla.state === 'breached' ? 'text-danger' : 'text-warning')}
                          aria-hidden="true"
                        />
                        <span className="flex-1 text-sm">
                          <span className="font-medium text-foreground">
                            {sla.state === 'breached' ? 'SLA breached' : 'SLA at risk'} · #{t.id}
                          </span>
                          <span className="block truncate text-muted-foreground">{t.title}</span>
                          <span className={cn('font-mono text-xs font-semibold', sla.state === 'breached' ? 'text-danger-ink' : 'text-warning-ink')}>
                            {sla.label}
                          </span>
                        </span>
                        {!isRead && <span className="mt-1.5 size-2 rounded-full bg-primary" aria-label="Unread" />}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </PopoverContent>
        </Popover>

        {/* SADECE MÜŞTERİ (client) ROLÜNDE GÖRÜNEN CREATE TICKET BUTONU */}
        {user.role === 'client' && (
          <Link href="/tickets/new" className={cn(buttonVariants({ size: 'lg' }), 'font-semibold cursor-pointer')}>
            <Plus className="size-4" aria-hidden="true" />
            Create Ticket
          </Link>
        )}

        {/* Profile & Role Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" className="min-h-11 h-auto py-1.5 gap-2.5 pr-2 pl-1.5 cursor-pointer" aria-label={`Account menu for ${user.name}`} />}
          >
            <UserAvatar user={user} />
            <span className="hidden text-left leading-tight xl:block">
              <span className="block text-sm font-semibold text-foreground">{user.name}</span>
              <span className="block text-xs text-muted-foreground">{ROLE_LABEL[user.role]}</span>
            </span>
            <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <span className="block text-sm font-semibold text-foreground">{user.name}</span>
                <span className="block font-normal">{user.email}</span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="min-h-10 cursor-pointer"
                onClick={() => router.push('/settings#accessibility')}
              >
                <Eye className="size-4" aria-hidden="true" />
                Accessibility settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Switch demo role</DropdownMenuLabel>
              {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
                <DropdownMenuItem key={r} className="min-h-10 cursor-pointer" onClick={() => switchRole(r)} disabled={r === user.role}>
                  {r === user.role ? <UserCheck aria-hidden="true" /> : <RefreshCw aria-hidden="true" />}
                  {ROLE_LABEL[r]}
                  {r === user.role && <span className="ml-auto text-xs text-muted-foreground">Current</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              className="min-h-10 cursor-pointer"
              onClick={() => {
                signOut()
                router.push('/')
              }}
            >
              <LogOut aria-hidden="true" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}