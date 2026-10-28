'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'
import { STATUS_LABEL, STATUS_ORDER, type Status, type Ticket } from '@/lib/nexus-data'

export const STATUS_COLOR: Record<Status, string> = {
  open: '#64748B',
  in_progress: '#F59E0B',
  in_review: '#2563EB',
  resolved: '#15803D',
}

export function StatusDonut({ tickets, className }: { tickets: Ticket[]; className?: string }) {
  const [hover, setHover] = useState<Status | null>(null)
  const data = STATUS_ORDER.map((s) => ({
    key: s,
    name: STATUS_LABEL[s],
    value: tickets.filter((t) => t.status === s).length,
  }))
  const total = tickets.length
  const focused = hover ? data.find((d) => d.key === hover) : null

  return (
    <div className={cn('rounded-xl border border-border/80 bg-card/80 backdrop-blur-xs p-5 shadow-xs', className)}>
      <h2 className="text-sm font-semibold tracking-tight text-foreground">Ticket Status Distribution</h2>
      <p className="text-xs text-muted-foreground mt-0.5">Filter by segment or status list.</p>

      <div className="mt-4 flex items-center gap-6">
        <div className="relative size-44 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={54}
                outerRadius={78}
                paddingAngle={3}
                stroke="none"
                onMouseEnter={(_, i) => setHover(data[i].key)}
                onMouseLeave={() => setHover(null)}
                isAnimationActive={false}
              >
                {data.map((d) => (
                  <Cell
                    key={d.key}
                    fill={STATUS_COLOR[d.key]}
                    opacity={hover && hover !== d.key ? 0.3 : 1}
                    className="cursor-pointer transition-opacity duration-150 outline-none"
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Halkanın Merkezindeki Odak Metni */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-2">
            <span className="font-mono text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {focused ? focused.value : total}
            </span>
            <span className="text-xs font-medium text-muted-foreground truncate max-w-[100px] mt-0.5">
              {focused ? focused.name : 'Total'}
            </span>
          </div>
        </div>

        {/* Sağ Liste */}
        <ul className="flex flex-1 flex-col gap-1" aria-label="Status breakdown">
          {data.map((d) => (
            <li key={d.key}>
              <Link
                href={`/tickets?status=${d.key}`}
                onMouseEnter={() => setHover(d.key)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(d.key)}
                onBlur={() => setHover(null)}
                className={cn(
                  'flex min-h-9 items-center gap-2.5 rounded-lg px-2.5 text-xs font-medium transition-colors',
                  hover === d.key ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                )}
              >
                <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLOR[d.key] }} aria-hidden="true" />
                <span className="flex-1 truncate">{d.name}</span>
                <span className="font-mono font-semibold tabular-nums text-foreground">{d.value}</span>
                <span className="w-9 text-right text-xs text-muted-foreground tabular-nums">
                  {total ? Math.round((d.value / total) * 100) : 0}%
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}