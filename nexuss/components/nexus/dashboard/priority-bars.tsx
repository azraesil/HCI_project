'use client'

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { cn } from '@/lib/utils'
import { PRIORITY_LABEL, PRIORITY_ORDER, type Ticket } from '@/lib/nexus-data'

export function PriorityBars({ tickets, className }: { tickets: Ticket[]; className?: string }) {
  const data = PRIORITY_ORDER.map((p) => {
    const group = tickets.filter((t) => t.priority === p)
    return {
      name: PRIORITY_LABEL[p],
      Active: group.filter((t) => t.status !== 'resolved').length,
      Resolved: group.filter((t) => t.status === 'resolved').length,
    }
  })

  return (
    <div className={cn('rounded-xl border border-border/80 bg-card/80 backdrop-blur-xs p-5 shadow-xs', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-foreground">Tickets by Priority</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Active workloads vs. resolved volumes across priorities.</p>
        </div>
      </div>

      <div className="mt-4 h-48" role="img" aria-label={data.map((d) => `${d.name}: ${d.Active} active, ${d.Resolved} resolved`).join('. ')}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={6} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
            <XAxis 
              dataKey="name" 
              tickLine={false} 
              axisLine={false} 
              tick={{ fontSize: 11, fontWeight: 500 }}
              className="fill-muted-foreground"
            />
            <YAxis 
              allowDecimals={false} 
              tickLine={false} 
              axisLine={false} 
              tick={{ fontSize: 11 }}
              className="fill-muted-foreground"
            />
            <Tooltip 
              cursor={{ fill: 'currentColor', opacity: 0.04 }} 
              contentStyle={{ 
                borderRadius: 8, 
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)', 
                color: 'var(--foreground)',
                fontSize: 12,
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }} 
            />
            <Legend 
              iconType="circle"
              iconSize={7}
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }} 
            />
            <Bar 
              dataKey="Active" 
              fill="#3B82F6" 
              radius={[3, 3, 0, 0]} 
              maxBarSize={22} 
              isAnimationActive={false} 
            />
            <Bar 
              dataKey="Resolved" 
              fill="#10B981" 
              radius={[3, 3, 0, 0]} 
              maxBarSize={22} 
              isAnimationActive={false} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}