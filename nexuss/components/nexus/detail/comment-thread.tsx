'use client'

import { useState } from 'react'
import { ChevronDown, Lock, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ROLE_LABEL, userById, type Ticket } from '@/lib/nexus-data'
import { formatRelative } from '@/lib/sla'
import { useNexus } from '../nexus-provider'
import { UserAvatar } from '../badges'

export function CommentThread({ ticket, now }: { ticket: Ticket; now: number }) {
  const { user, addComment } = useNexus()
  const isClient = user?.role === 'client'
  const [body, setBody] = useState('')
  const [internal, setInternal] = useState(false)
  const [expanded, setExpanded] = useState(true)
  const comments = ticket.comments.filter((c) => !isClient || !c.internal)
  const internalCount = comments.filter((c) => c.internal).length

  const submit = () => {
    if (!body.trim()) return
    addComment(ticket.id, body.trim(), !isClient && internal)
    setBody('')
  }

  return (
    <section aria-labelledby="comments-h" className="rounded-xl border bg-card shadow-xs">
      <h2 id="comments-h">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls="comments-body"
          className={cn('flex min-h-14 w-full items-center gap-3 px-6 text-left hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none', expanded && 'border-b')}
        >
          <span className="text-sm font-semibold text-foreground">{isClient ? 'Conversation' : 'Internal Notes & Developer Comments'}</span>
          <span className="text-sm text-muted-foreground">
            {comments.length} {comments.length === 1 ? 'message' : 'messages'}
            {internalCount > 0 && ` · ${internalCount} internal`}
          </span>
          <span className="ml-auto flex items-center gap-1 text-sm font-medium text-primary">
            {expanded ? 'Collapse' : 'Expand'}
            <ChevronDown className={cn('size-4 transition-transform', expanded && 'rotate-180')} aria-hidden="true" />
          </span>
        </button>
      </h2>
      <div id="comments-body" hidden={!expanded}>
      <ol className="flex flex-col gap-5 px-6 py-5">
        {comments.length === 0 && <li className="text-sm text-muted-foreground">No replies yet.</li>}
        {comments.map((c) => {
          const author = userById(c.authorId)
          return (
            <li key={c.id} className="flex gap-3">
              <UserAvatar user={author} />
              <div className={cn('min-w-0 flex-1 rounded-lg px-4 py-3', c.internal ? 'border border-dashed border-amber-300 bg-warning-soft/60' : 'bg-muted/60')}>
                <p className="flex flex-wrap items-center gap-x-2 text-sm">
                  <span className="font-semibold text-foreground">{author?.name}</span>
                  <span className="text-xs text-muted-foreground">{author && ROLE_LABEL[author.role]}</span>
                  {c.internal && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-warning-ink">
                      <Lock className="size-3" aria-hidden="true" />
                      Internal note
                    </span>
                  )}
                  <span className="ml-auto text-xs text-muted-foreground">{formatRelative(c.at, now)}</span>
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground">{c.body}</p>
              </div>
            </li>
          )
        })}
      </ol>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        className="border-t px-6 py-4"
      >
        <label htmlFor="reply" className="sr-only">Write a reply</label>
        <textarea
          id="reply"
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !e.nativeEvent.isComposing && e.keyCode !== 229) {
              e.preventDefault()
              submit()
            }
          }}
          placeholder={internal ? 'Add a note only your team can see…' : 'Write a reply to everyone on this ticket…'}
          className={cn(
            'w-full resize-y rounded-md border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:outline-none',
            internal ? 'border-amber-300 focus-visible:ring-warning/25' : 'border-input focus-visible:border-primary focus-visible:ring-primary/20',
          )}
        />
        <div className="mt-2 flex items-center gap-3">
          {!isClient && (
            <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} className="size-4 accent-amber-600" />
              Internal note (hidden from client)
            </label>
          )}
          <span className="ml-auto text-xs text-muted-foreground">Ctrl + Enter to send</span>
          <Button type="submit" size="lg" disabled={!body.trim()}>
            <Send className="size-4" aria-hidden="true" />
            {internal && !isClient ? 'Add note' : 'Send reply'}
          </Button>
        </div>
      </form>
      </div>
    </section>
  )
}
