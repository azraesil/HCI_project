'use client'

import { useState, useEffect, useRef } from 'react'
import { Eye, Check, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DEFAULT_PREFS,
  loadPrefs,
  savePrefs,
  applyPrefs,
  type Prefs,
  type TextSize,
} from '@/lib/a11y-prefs'
import { PriorityBadge } from '../badges'

const TEXT_SIZES: { value: TextSize; label: string; hint: string }[] = [
  { value: 'default', label: 'Default', hint: '100% standard font scale' },
  { value: 'large', label: 'Large', hint: '112.5% enlarged font scale' },
  { value: 'xlarge', label: 'Extra large', hint: '125% maximum font scale' },
]

export function AccessibilityCard() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS)
  const [appliedMessage, setAppliedMessage] = useState(false)
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize preferences on client mount
  useEffect(() => {
    const initial = loadPrefs()
    setPrefs(initial)
    applyPrefs(initial)

    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current)
      }
    }
  }, [])

  const updatePrefs = (partial: Partial<Prefs>) => {
    const next: Prefs = { ...prefs, ...partial }
    setPrefs(next)
    savePrefs(next)
    applyPrefs(next)

    setAppliedMessage(true)
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current)
    }
    messageTimeoutRef.current = setTimeout(() => {
      setAppliedMessage(false)
    }, 3000)
  }

  const handleReset = () => {
    setPrefs(DEFAULT_PREFS)
    savePrefs(DEFAULT_PREFS)
    applyPrefs(DEFAULT_PREFS)

    setAppliedMessage(true)
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current)
    }
    messageTimeoutRef.current = setTimeout(() => {
      setAppliedMessage(false)
    }, 3000)
  }

  return (
    <div
      id="accessibility"
      className="p-6 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-xs shadow-xs space-y-6"
    >
      {/* Card Header */}
      <div className="flex items-center gap-2 text-foreground font-semibold border-b border-border/60 pb-3">
        <Eye className="size-4 text-primary" aria-hidden="true" />
        <h3 className="text-sm font-semibold tracking-tight">Accessibility & Display</h3>
      </div>

      <div className="space-y-6">
        {/* 1) Text Size Selection */}
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-foreground">Text size</legend>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {TEXT_SIZES.map((opt) => {
              const checked = prefs.textSize === opt.value
              return (
                <label
                  key={opt.value}
                  className={cn(
                    'relative flex min-h-[44px] cursor-pointer flex-col justify-center rounded-xl border-2 bg-card p-3.5 transition-colors has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-primary/30',
                    checked
                      ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                      : 'border-border hover:border-slate-400 dark:hover:border-slate-600'
                  )}
                >
                  <input
                    type="radio"
                    name="textSize"
                    value={opt.value}
                    checked={checked}
                    onChange={() => updatePrefs({ textSize: opt.value })}
                    className="sr-only"
                  />
                  <span className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">{opt.label}</span>
                    <span
                      className={cn(
                        'flex size-4 items-center justify-center rounded-full border-2',
                        checked ? 'border-primary' : 'border-slate-300 dark:border-slate-600'
                      )}
                      aria-hidden="true"
                    >
                      {checked && <span className="size-2 rounded-full bg-primary" />}
                    </span>
                  </span>
                  <span className="mt-1 text-xs text-muted-foreground">{opt.hint}</span>
                </label>
              )
            })}
          </div>
        </fieldset>

        {/* 2) High Contrast Switch */}
        <label className="flex items-center justify-between cursor-pointer group min-h-[44px]">
          <div className="pr-4">
            <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
              High contrast
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Stronger borders and text colors for easier reading.
            </div>
          </div>
          <div className="relative inline-flex items-center shrink-0">
            <input
              type="checkbox"
              role="switch"
              aria-checked={prefs.highContrast}
              checked={prefs.highContrast}
              onChange={(e) => updatePrefs({ highContrast: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus-visible:outline-none peer-focus-visible:ring-3 peer-focus-visible:ring-primary/30 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
          </div>
        </label>

        {/* 3) Reduce Motion Switch */}
        <label className="flex items-center justify-between cursor-pointer group min-h-[44px]">
          <div className="pr-4">
            <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
              Reduce motion
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Turns off animations and transitions. Loading spinners stay visible.
            </div>
          </div>
          <div className="relative inline-flex items-center shrink-0">
            <input
              type="checkbox"
              role="switch"
              aria-checked={prefs.reduceMotion}
              checked={prefs.reduceMotion}
              onChange={(e) => updatePrefs({ reduceMotion: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus-visible:outline-none peer-focus-visible:ring-3 peer-focus-visible:ring-primary/30 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
          </div>
        </label>

        {/* 4) Live Preview Box */}
        <div className="rounded-xl border border-border/80 bg-muted/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Preview
            </span>
            <span className="text-xs text-muted-foreground">
              {prefs.textSize === 'default'
                ? 'Default (100%)'
                : prefs.textSize === 'large'
                  ? 'Large (112.5%)'
                  : 'Extra large (125%)'}
              {prefs.highContrast && ' · High contrast'}
              {prefs.reduceMotion && ' · Reduced motion'}
            </span>
          </div>

          <div className="p-3.5 rounded-lg border border-border bg-card shadow-2xs space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs font-bold text-primary">#NEX-104</span>
              <PriorityBadge priority="high" />
            </div>
            <p className="text-sm font-medium text-foreground leading-snug">
              Payment webhook fails with 504 Gateway Timeout during peak hours
            </p>
            <p className="text-xs text-muted-foreground">
              Assigned to Sarah Chen · SLA remaining: 2h 45m
            </p>
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60 text-xs">
              <span className="text-muted-foreground">Motion animation status:</span>
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <span
                  className={cn(
                    'size-2 rounded-full bg-primary',
                    !prefs.reduceMotion && 'animate-pulse'
                  )}
                  aria-hidden="true"
                />
                {prefs.reduceMotion ? 'Animations Off (Instant)' : 'Animations On (Smooth)'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer: Live announcement + Reset to defaults button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60">
          <div aria-live="polite" className="text-xs font-semibold min-h-[24px] flex items-center">
            {appliedMessage && (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <Check className="size-4" aria-hidden="true" />
                Preferences applied.
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="flex min-h-[44px] items-center gap-1.5 px-4 py-2 rounded-xl border border-border/80 bg-card hover:bg-muted text-xs font-semibold text-foreground transition-colors cursor-pointer"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            Reset to defaults
          </button>
        </div>
      </div>
    </div>
  )
}
