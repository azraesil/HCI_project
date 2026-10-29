'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNexus } from './nexus-provider'
import { AppSidebar } from './app-sidebar'
import { TopBar } from './top-bar'

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useNexus()
  const router = useRouter()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true)

  useEffect(() => {
    if (!user) router.replace('/')
  }, [user, router])

  useEffect(() => {
    if (!mobileNavOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileNavOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mobileNavOpen])

  useEffect(() => {
    if (mobileNavOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [mobileNavOpen])

  if (!user) return null

  return (
    <div className="flex min-h-dvh bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <div
        className={cn(
          'hidden lg:flex shrink-0 sticky top-0 h-dvh transition-all duration-300 ease-in-out overflow-hidden',
          desktopSidebarOpen ? 'w-64 opacity-100' : 'w-0 opacity-0 pointer-events-none'
        )}
      >
        <AppSidebar
          onClose={() => setDesktopSidebarOpen(false)}
          className="w-64"
        />
      </div>

      {/* Mobile Drawer with smooth slide & fade animation */}
      <div
        className={cn(
          'fixed inset-0 z-50 lg:hidden transition-all duration-300',
          mobileNavOpen ? 'pointer-events-auto visible' : 'pointer-events-none invisible'
        )}
        aria-hidden={!mobileNavOpen}
      >
        <div
          className={cn(
            'fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ease-in-out',
            mobileNavOpen ? 'opacity-100' : 'opacity-0'
          )}
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation drawer"
          className={cn(
            'relative flex h-full w-72 max-w-[85vw] flex-col bg-sidebar text-sidebar-foreground shadow-2xl transition-transform duration-300 ease-in-out',
            mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <AppSidebar
            onNavigate={() => setMobileNavOpen(false)}
            onClose={() => setMobileNavOpen(false)}
            className="w-full h-full"
          />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          sidebarOpen={desktopSidebarOpen}
          onMenuClick={() => {
            if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
              setDesktopSidebarOpen((prev) => !prev)
            } else {
              setMobileNavOpen((prev) => !prev)
            }
          }}
        />
        <main id="main" className="flex-1 px-4 sm:px-6 py-5 lg:py-7">
          {children}
        </main>
      </div>
    </div>
  )
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground text-pretty">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
