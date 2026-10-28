'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Download, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Attachment } from '@/lib/nexus-data'
import { KIND_ICON, formatSize } from '../submit/attachment-drop'

const KIND_LABEL = { image: 'Image', pdf: 'PDF document', zip: 'ZIP archive' }

export function AttachmentList({ attachments }: { attachments: Attachment[] }) {
  const [open, setOpen] = useState<Attachment | null>(null)
  if (attachments.length === 0) return null

  return (
    <>
      <ul className="mt-5 grid grid-cols-3 gap-3 border-t pt-4" aria-label="Attachments">
        {attachments.map((a) => {
          const Icon = KIND_ICON[a.kind]
          return (
            <li key={a.name}>
              <button
                type="button"
                onClick={() => setOpen(a)}
                className="group flex w-full flex-col overflow-hidden rounded-lg border bg-card text-left transition-colors hover:border-primary focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none"
              >
                <span className="relative flex h-24 items-center justify-center bg-muted">
                  {a.kind === 'image' ? (
                    <Image src="/attachments/screenshot.png" alt="" fill sizes="240px" className="object-cover" />
                  ) : (
                    <Icon className="size-9 text-slate-400" aria-hidden="true" />
                  )}
                  <span className="absolute inset-0 flex items-center justify-center gap-1.5 bg-navy/70 text-sm font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    <Eye className="size-4" aria-hidden="true" />
                    Preview
                  </span>
                </span>
                <span className="flex items-center gap-2 px-3 py-2">
                  <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{a.name}</span>
                  <span className="text-xs text-muted-foreground">{formatSize(a.sizeKb)}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="sm:max-w-2xl">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle>{open.name}</DialogTitle>
                <DialogDescription>{KIND_LABEL[open.kind]} · {formatSize(open.sizeKb)}</DialogDescription>
              </DialogHeader>
              {open.kind === 'image' ? (
                <div className="relative aspect-[16/10] overflow-hidden rounded-lg border">
                  <Image src="/attachments/screenshot.png" alt={`Preview of ${open.name}`} fill sizes="672px" className="object-cover" />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 rounded-lg border bg-muted py-12 text-center">
                  {(() => {
                    const Icon = KIND_ICON[open.kind]
                    return <Icon className="size-12 text-slate-400" aria-hidden="true" />
                  })()}
                  <p className="text-sm text-muted-foreground">Inline preview isn&apos;t available for {KIND_LABEL[open.kind].toLowerCase()}s.</p>
                </div>
              )}
              <div className="flex justify-end">
                <Button size="lg" variant="outline">
                  <Download className="size-4" aria-hidden="true" />
                  Download
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
