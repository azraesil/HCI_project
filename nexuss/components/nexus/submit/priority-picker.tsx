'use client'

import { cn } from '@/lib/utils'
import { PRIORITY_LABEL, PRIORITY_SLA_COPY, type Priority } from '@/lib/nexus-data'
import { PRIORITY_DOT } from '../badges'

const ORDER: Priority[] = ['low', 'medium', 'high', 'critical']

const SELECTED: Record<Priority, string> = {
  low: 'border-slate-500 ring-slate-500/20',
  medium: 'border-primary ring-primary/20',
  high: 'border-warning ring-warning/25',
  critical: 'border-danger ring-danger/20',
}

const HINT: Record<Priority, string> = {
  low: 'Cosmetic or minor issue, workaround exists',
  medium: 'Some users affected, workaround exists',
  high: 'Key feature broken, no workaround',
  critical: 'Production down or data at risk',
}

export function PriorityPicker({ value, onChange, invalid }: { value: Priority | ''; onChange: (p: Priority) => void; invalid: boolean }) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {ORDER.map((p) => {
          const checked = value === p
          return (
            <label
              key={p}
              className={cn(
                'relative flex cursor-pointer flex-col rounded-lg border-2 bg-card p-3.5 transition-colors has-[:focus-visible]:ring-3',
                checked ? cn('ring-3', SELECTED[p]) : invalid ? 'border-red-300' : 'border-border hover:border-slate-400',
              )}
            >
              <input type="radio" name="priority" value={p} checked={checked} onChange={() => onChange(p)} className="sr-only" />
              <span className="flex items-center gap-2">
                <span className={cn('size-2.5 rounded-full', PRIORITY_DOT[p])} aria-hidden="true" />
                <span className="text-sm font-semibold text-foreground">{PRIORITY_LABEL[p]}</span>
                <span
                  className={cn(
                    'ml-auto flex size-4 items-center justify-center rounded-full border-2',
                    checked ? 'border-foreground' : 'border-slate-300',
                  )}
                  aria-hidden="true"
                >
                  {checked && <span className="size-2 rounded-full bg-foreground" />}
                </span>
              </span>
              <span className="mt-1.5 text-xs text-muted-foreground">{HINT[p]}</span>
              <span className="mt-3 border-t pt-2.5 text-xs leading-relaxed text-foreground">
                <span className="block font-medium">{PRIORITY_SLA_COPY[p].response}</span>
                <span className="block text-muted-foreground">{PRIORITY_SLA_COPY[p].resolution}</span>
              </span>
            </label>
          )
        })}
      </div>
      {invalid && <p className="mt-2 text-xs text-danger-ink">Choose a priority so we can apply the correct SLA.</p>}
    </>
  )
}
