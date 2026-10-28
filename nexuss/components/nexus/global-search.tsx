'use client'

import { useId, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { companyById } from '@/lib/nexus-data'
import { useNexus } from './nexus-provider'
import { StatusBadge } from './badges'

export function GlobalSearch() {
  const { visibleTickets } = useNexus()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const listId = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return visibleTickets
      .filter((t) => t.id.toLowerCase().includes(q) || t.title.toLowerCase().includes(q) || companyById(t.companyId)?.name.toLowerCase().includes(q))
      .slice(0, 6)
  }, [query, visibleTickets])

  const go = (id: string) => {
    setOpen(false)
    setQuery('')
    inputRef.current?.blur()
    router.push(`/tickets/${id}`)
  }

  const showList = open && query.trim().length > 0

  return (
    <div className="relative w-full max-w-md">
      <label htmlFor={`${listId}-input`} className="sr-only">
        Search tickets by ID, title or company
      </label>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <input
        ref={inputRef}
        id={`${listId}-input`}
        type="search"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList && results[active] ? `${listId}-${results[active].id}` : undefined}
        autoComplete="off"
        value={query}
        placeholder="Search tickets, e.g. NX-104 or “payment”"
        onChange={(e) => {
          setQuery(e.target.value)
          setActive(0)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        onKeyDown={(e) => {
          if (!showList) return
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActive((a) => Math.min(a + 1, results.length - 1))
          } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActive((a) => Math.max(a - 1, 0))
          } else if (e.key === 'Enter' && results[active]) {
            if (e.nativeEvent.isComposing || e.keyCode === 229) return
            e.preventDefault()
            go(results[active].id)
          } else if (e.key === 'Escape') {
            setOpen(false)
          }
        }}
        className="h-11 w-full rounded-md border border-input bg-background pr-3 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 focus-visible:outline-none"
      />
      {showList && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Matching tickets"
          className="absolute top-full right-0 left-0 z-50 mt-1.5 overflow-hidden rounded-lg border bg-popover p-1 shadow-lg"
        >
          {results.length === 0 ? (
            <li className="px-3 py-3 text-sm text-muted-foreground" role="option" aria-selected={false} aria-disabled="true">
              No tickets match “{query}”. Try a ticket ID like NX-104.
            </li>
          ) : (
            results.map((t, i) => (
              <li
                key={t.id}
                id={`${listId}-${t.id}`}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => go(t.id)}
                onMouseEnter={() => setActive(i)}
                className={cn('flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-3 py-2', i === active && 'bg-accent')}
              >
                <span className="font-mono text-xs font-semibold text-primary">#{t.id}</span>
                <span className="flex-1 truncate text-sm text-foreground">{t.title}</span>
                <StatusBadge status={t.status} />
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
