'use client'

import { useRef } from 'react'
import { Bold, Code, Italic, Link2, List, ListOrdered } from 'lucide-react'
import { cn } from '@/lib/utils'

export const DESCRIPTION_MIN = 30
const MAX = 2000

const TOOLS = [
  { label: 'Bold', Icon: Bold, wrap: ['**', '**'] },
  { label: 'Italic', Icon: Italic, wrap: ['_', '_'] },
  { label: 'Inline code', Icon: Code, wrap: ['`', '`'] },
  { label: 'Link', Icon: Link2, wrap: ['[', '](https://)'] },
  { label: 'Bulleted list', Icon: List, prefix: '- ' },
  { label: 'Numbered list', Icon: ListOrdered, prefix: '1. ' },
] as const

export function DescriptionEditor({
  value,
  onChange,
  onBlur,
  showError,
}: {
  value: string
  onChange: (v: string) => void
  onBlur: () => void
  showError: boolean
}) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const len = value.trim().length
  const invalid = showError && len < DESCRIPTION_MIN

  const apply = (tool: (typeof TOOLS)[number]) => {
    const el = ref.current
    if (!el) return
    const { selectionStart: s, selectionEnd: e } = el
    const selected = value.slice(s, e)
    let next: string
    let cursor: number
    if ('prefix' in tool) {
      const lineStart = value.lastIndexOf('\n', s - 1) + 1
      next = value.slice(0, lineStart) + tool.prefix + value.slice(lineStart)
      cursor = e + tool.prefix.length
    } else {
      const [a, b] = tool.wrap
      next = value.slice(0, s) + a + selected + b + value.slice(e)
      cursor = selected ? e + a.length + b.length : s + a.length
    }
    if (next.length > MAX) return
    onChange(next)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(cursor, cursor)
    })
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="description" className="text-sm font-medium text-foreground">
        Issue description <span className="text-danger" aria-hidden="true">*</span>
      </label>
      <div
        className={cn(
          'overflow-hidden rounded-md border bg-background focus-within:ring-3',
          invalid ? 'border-danger focus-within:ring-danger/20' : 'border-input focus-within:border-primary focus-within:ring-primary/20',
        )}
      >
        <div role="toolbar" aria-label="Text formatting" aria-controls="description" className="flex items-center gap-0.5 border-b bg-muted/60 px-1.5 py-1">
          {TOOLS.map((t, i) => (
            <span key={t.label} className="contents">
              {i === 4 && <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />}
              <button
                type="button"
                onClick={() => apply(t)}
                className="flex h-9 items-center gap-1.5 rounded px-2 text-xs font-medium text-muted-foreground hover:bg-card hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
              >
                <t.Icon className="size-4" aria-hidden="true" />
                <span>{t.label}</span>
              </button>
            </span>
          ))}
        </div>
        <textarea
          ref={ref}
          id="description"
          required
          rows={8}
          maxLength={MAX}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-invalid={invalid}
          aria-describedby="description-help"
          placeholder={'Steps to reproduce:\n1. …\n\nExpected result:\nActual result:'}
          className="block w-full resize-y border-0 bg-transparent px-3 py-2.5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>
      <div id="description-help" className="flex items-center justify-between text-xs">
        <span className={invalid ? 'text-danger-ink' : 'text-muted-foreground'}>
          {invalid
            ? `Add at least ${DESCRIPTION_MIN - len} more characters so developers can reproduce the issue.`
            : `Minimum ${DESCRIPTION_MIN} characters. Markdown formatting supported.`}
        </span>
        <span
          className={cn(
            'tabular-nums',
            value.length > MAX * 0.9 ? 'font-medium text-warning-ink' : len >= DESCRIPTION_MIN ? 'text-success-ink' : 'text-muted-foreground',
          )}
        >
          {value.length.toLocaleString()} / {MAX.toLocaleString()}
        </span>
      </div>
    </div>
  )
}
