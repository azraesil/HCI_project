'use client'

import { useId, useRef, useState } from 'react'
import { AlertCircle, FileArchive, FileImage, FileText, UploadCloud, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Attachment } from '@/lib/nexus-data'

const MAX_MB = 10
const MAX_FILES = 5
const KIND_BY_EXT: Record<string, Attachment['kind']> = { png: 'image', jpg: 'image', jpeg: 'image', pdf: 'pdf', zip: 'zip' }
export const KIND_ICON = { image: FileImage, pdf: FileText, zip: FileArchive }

export const formatSize = (kb: number) => (kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(kb))} KB`)

export function AttachmentDrop({ files, onChange }: { files: Attachment[]; onChange: (f: Attachment[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const hintId = useId()

  const add = (list: FileList | null) => {
    if (!list) return
    const next = [...files]
    const errs: string[] = []
    for (const f of Array.from(list)) {
      const ext = f.name.split('.').pop()?.toLowerCase() ?? ''
      const kind = KIND_BY_EXT[ext]
      if (!kind) errs.push(`“${f.name}” isn’t supported. Use PNG, JPG, PDF or ZIP.`)
      else if (f.size > MAX_MB * 1024 * 1024) errs.push(`“${f.name}” is ${formatSize(f.size / 1024)} — the limit is ${MAX_MB} MB per file.`)
      else if (next.length >= MAX_FILES) errs.push(`Only ${MAX_FILES} files per ticket. “${f.name}” was not added.`)
      else if (next.some((x) => x.name === f.name)) errs.push(`“${f.name}” is already attached.`)
      else next.push({ name: f.name, sizeKb: f.size / 1024, kind })
    }
    setErrors(errs)
    onChange(next)
  }

  const totalKb = files.reduce((s, f) => s + f.sizeKb, 0)

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          Attachments <span className="font-normal text-muted-foreground">(optional)</span>
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {files.length}/{MAX_FILES} files{files.length > 0 && ` · ${formatSize(totalKb)}`}
        </span>
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setOver(false)
          add(e.dataTransfer.files)
        }}
        aria-describedby={hintId}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none',
          over ? 'border-primary bg-accent' : 'border-slate-300 hover:border-primary hover:bg-accent/50',
        )}
      >
        <UploadCloud className={cn('size-8', over ? 'text-primary' : 'text-slate-400')} aria-hidden="true" />
        <span className="text-sm font-medium text-foreground">
          {over ? 'Drop files to attach' : (
            <>Drag & drop files here, or <span className="text-primary underline underline-offset-2">browse your computer</span></>
          )}
        </span>
        <span id={hintId} className="text-xs text-muted-foreground">PNG, JPG, PDF or ZIP · up to {MAX_MB} MB each · max {MAX_FILES} files</span>
      </button>
      <input ref={inputRef} type="file" multiple accept=".png,.jpg,.jpeg,.pdf,.zip" className="sr-only" tabIndex={-1} onChange={(e) => { add(e.target.files); e.target.value = '' }} />

      {errors.length > 0 && (
        <ul role="alert" className="flex flex-col gap-1 rounded-md border border-red-200 bg-danger-soft px-3 py-2">
          {errors.map((e) => (
            <li key={e} className="flex items-start gap-2 text-xs text-danger-ink">
              <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              {e}
            </li>
          ))}
        </ul>
      )}

      {files.length > 0 && (
        <ul className="flex flex-col gap-2" aria-label="Attached files">
          {files.map((f) => {
            const Icon = KIND_ICON[f.kind]
            return (
              <li key={f.name} className="flex items-center gap-3 rounded-md border bg-card py-1 pr-1 pl-3">
                <Icon className="size-5 shrink-0 text-primary" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate text-sm text-foreground">{f.name}</span>
                <span className="text-xs text-muted-foreground tabular-nums">{formatSize(f.sizeKb)}</span>
                <span className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-200" aria-hidden="true">
                  <span className="block h-full rounded-full bg-success" style={{ width: `${Math.min(100, (f.sizeKb / (MAX_MB * 1024)) * 100)}%` }} />
                </span>
                <button
                  type="button"
                  onClick={() => onChange(files.filter((x) => x.name !== f.name))}
                  className="flex size-10 items-center justify-center rounded-md text-muted-foreground hover:bg-danger-soft hover:text-danger-ink focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                >
                  <X className="size-4" aria-hidden="true" />
                  <span className="sr-only">Remove {f.name}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
