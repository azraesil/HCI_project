'use client'

import { useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Check,
  Circle,
  Lock,
  Loader2,
  Save,
  Send,
  Trash2,
  FileEdit,
  RotateCcw,
  ChevronDown,
  Layers,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import {
  CATEGORY_LABEL,
  COMPANIES,
  PROJECTS,
  companyById,
  type Attachment,
  type Category,
  type Priority,
} from '@/lib/nexus-data'
import { useNexus } from '../nexus-provider'
import { PageHeader } from '../app-shell'
import { FormStep } from './form-step'
import { PriorityPicker } from './priority-picker'
import { DescriptionEditor, DESCRIPTION_MIN } from './description-editor'
import { AttachmentDrop } from './attachment-drop'

const TITLE_MIN = 10
const DRAFTS_KEY = 'nexus_ticket_multi_drafts_v1'

export interface DraftItem {
  id: string
  projectId: string
  category: Category | ''
  title: string
  priority: Priority | ''
  description: string
  savedAt: number
}

export function TicketForm() {
  const { user, createTicket } = useNexus()
  const router = useRouter()
  const isClient = user?.role === 'client'

  const [companyId, setCompanyId] = useState(isClient ? (user?.companyId ?? '') : '')
  const [projectId, setProjectId] = useState('')
  const [category, setCategory] = useState<Category | ''>('')
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Priority | ''>('')
  const [description, setDescription] = useState('')
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState(false)

  // Çoklu taslak listesi
  const [drafts, setDrafts] = useState<DraftItem[]>([])
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null)
  const [showSavedToast, setShowSavedToast] = useState(false)
  const [restoredToast, setRestoredToast] = useState<string | null>(null)
  const [isDraftsOpen, setIsDraftsOpen] = useState(false)

  // Sayfa yüklendiğinde mevcut taslakları oku
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFTS_KEY)
      if (raw) {
        const parsed: DraftItem[] = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          setDrafts(parsed)
        }
      }
    } catch (e) {
      console.error('Drafts reading error', e)
    }
  }, [])

  // Müşteri şirketi güncellenirse senkronize et
  useEffect(() => {
    if (isClient && user?.companyId) {
      setCompanyId(user.companyId)
    }
  }, [isClient, user?.companyId])

  const projects = useMemo(() => PROJECTS.filter((p) => p.companyId === companyId), [companyId])
  const touch = (k: string) => setTouched((t) => ({ ...t, [k]: true }))

  const checks = [
    { id: 'project', label: 'Project selected', done: !!companyId && !!projectId },
    { id: 'category', label: 'Category chosen', done: !!category },
    { id: 'title', label: `Title (${TITLE_MIN}+ characters)`, done: title.trim().length >= TITLE_MIN },
    { id: 'priority', label: 'Priority set', done: !!priority },
    { id: 'description', label: `Description (${DESCRIPTION_MIN}+ characters)`, done: description.trim().length >= DESCRIPTION_MIN },
  ]
  const remaining = checks.filter((c) => !c.done).length
  const step1 = checks[0].done && checks[1].done
  const step2 = checks[2].done && checks[3].done
  const step3 = checks[4].done

  // Her tıklandığında üzerine yazmadan YENİ bir taslak ekler
  const handleSaveDraft = () => {
    const draftTitle = title.trim() || 'Untitled Draft'
    const newDraft: DraftItem = {
      id: `draft_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      projectId,
      category,
      title: draftTitle,
      priority,
      description,
      savedAt: Date.now(),
    }

    const updated = [newDraft, ...drafts]
    setDrafts(updated)
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(updated))
    setActiveDraftId(newDraft.id)

    setShowSavedToast(true)
    setTimeout(() => setShowSavedToast(false), 2500)
  }

  // Seçilen taslağı form alanlarına uygula / doldur
  const handleApplyDraft = (draft: DraftItem) => {
    setProjectId(draft.projectId || '')
    setCategory(draft.category || '')
    setTitle(draft.title === 'Untitled Draft' ? '' : draft.title)
    setPriority(draft.priority || '')
    setDescription(draft.description || '')
    setActiveDraftId(draft.id)
    setIsDraftsOpen(false)

    setRestoredToast(`"${draft.title.slice(0, 20)}..." applied!`)
    setTimeout(() => setRestoredToast(null), 3000)
  }

  // Belirli bir taslağı sil
  const handleDeleteDraft = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const updated = drafts.filter((d) => d.id !== id)
    setDrafts(updated)
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(updated))
    if (activeDraftId === id) {
      setActiveDraftId(null)
    }
  }

  // Tüm taslakları temizle
  const handleClearAllDrafts = () => {
    setDrafts([])
    localStorage.removeItem(DRAFTS_KEY)
    setActiveDraftId(null)
    setIsDraftsOpen(false)
  }

  // Formu sıfırla
  const handleResetForm = () => {
    setProjectId('')
    setCategory('')
    setTitle('')
    setPriority('')
    setDescription('')
    setActiveDraftId(null)
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (remaining > 0 || !category || !priority) {
      setTouched({ project: true, category: true, title: true, priority: true, description: true })
      return
    }
    setSubmitting(true)
    const t = createTicket({ companyId, projectId, category, priority, title: title.trim(), description: description.trim(), attachments })

    // Gönderilen taslağı listeden kaldır
    if (activeDraftId) {
      handleDeleteDraft(activeDraftId)
    }

    router.push(`/tickets/${t.id}?created=1`)
  }

  const fieldCls = (invalid: boolean) =>
    cn(
      'h-11 w-full rounded-md border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground',
      invalid ? 'border-danger focus-visible:ring-danger/20' : 'border-input focus-visible:border-primary focus-visible:ring-primary/20',
    )

  return (
    <>
      <PageHeader
        title="Submit a Ticket"
        description="Three short steps. Every required field is marked, and Submit unlocks once nothing is missing."
      />

      {/* ÜST DRAFT BAR: Çoklu Taslak Açılır Menüsü */}
      {drafts.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200/90 bg-blue-50/70 p-3.5 dark:border-blue-900/60 dark:bg-blue-950/40">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400">
              <Layers className="size-4.5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                You have {drafts.length} saved {drafts.length === 1 ? 'draft' : 'drafts'}
              </p>
              <p className="text-xs text-muted-foreground">
                {restoredToast ? (
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">✓ {restoredToast}</span>
                ) : (
                  'Select any draft below to auto-fill this form.'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* AŞAĞI AÇILAN DRAFTS LİSTESİ */}
            <Popover open={isDraftsOpen} onOpenChange={setIsDraftsOpen}>
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-2 border-blue-300 bg-card font-semibold text-blue-700 shadow-2xs hover:bg-blue-50 hover:text-blue-800 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950/60 cursor-pointer"
                  />
                }
              >
                <FileEdit className="size-3.5 text-blue-600 dark:text-blue-400" />
                <span>Saved Drafts ({drafts.length})</span>
                <ChevronDown className="size-3.5 text-muted-foreground" />
              </PopoverTrigger>

              <PopoverContent align="end" className="w-80 sm:w-96 p-0 shadow-lg">
                <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/40">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Ticket Drafts
                    </span>
                    <span className="text-xs font-mono bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.2 rounded font-semibold">
                      {drafts.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearAllDrafts}
                    className="text-xs font-medium text-danger hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>

                <div className="max-h-72 divide-y divide-border/60 overflow-y-auto">
                  {drafts.map((d) => {
                    const project = PROJECTS.find((p) => p.id === d.projectId)
                    const isCurrent = activeDraftId === d.id

                    return (
                      <div
                        key={d.id}
                        className={cn(
                          'p-3 hover:bg-muted/50 transition-colors flex items-center justify-between gap-3 group',
                          isCurrent && 'bg-blue-50/50 dark:bg-blue-950/30'
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            {project && (
                              <span className="font-mono text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-500/15 px-1.5 py-0.2 rounded">
                                {project.code}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {new Date(d.savedAt).toLocaleTimeString('en-GB', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {isCurrent && (
                              <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-1.5 rounded">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-foreground truncate">
                            {d.title || 'Untitled Draft'}
                          </p>
                          {d.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {d.description.slice(0, 45)}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleApplyDraft(d)}
                            title="Load draft into form"
                            className="flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-2xs hover:bg-primary/90 transition-colors cursor-pointer"
                          >
                            <RotateCcw className="size-3" />
                            Load
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteDraft(d.id, e)}
                            title="Delete this draft"
                            className="p-1 rounded-md text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </PopoverContent>
            </Popover>

            {/* Formu Sıfırla Butonu */}
            {activeDraftId && (
              <button
                type="button"
                onClick={handleResetForm}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="size-3.5" />
                Reset Form
              </button>
            )}
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} noValidate className="grid grid-cols-1 lg:grid-cols-[1fr_300px] items-start gap-6">
        <div className="flex flex-col gap-5 min-w-0">
          <FormStep n={1} title="Where is the issue?" description="Scope the ticket to the right project so it reaches the right team." complete={step1}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="company" className="text-sm font-medium text-foreground">Company</label>
                {isClient ? (
                  <div className="flex h-11 items-center gap-2 rounded-md border border-input bg-muted px-3 text-sm text-foreground">
                    <Lock className="size-4 text-muted-foreground" aria-hidden="true" />
                    <span id="company">{companyById(companyId)?.name || 'Helios Bank'}</span>
                    <span className="ml-auto text-xs text-muted-foreground">Your registered company</span>
                  </div>
                ) : (
                  <select
                    id="company"
                    value={companyId}
                    onChange={(e) => {
                      setCompanyId(e.target.value)
                      setProjectId('')
                    }}
                    className={fieldCls(false)}
                  >
                    <option value="" disabled>Select a company…</option>
                    {COMPANIES.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="project" className="text-sm font-medium text-foreground">
                  Project <span className="text-danger" aria-hidden="true">*</span>
                </label>
                <select
                  id="project"
                  required
                  value={projectId}
                  disabled={!companyId}
                  onChange={(e) => setProjectId(e.target.value)}
                  onBlur={() => touch('project')}
                  aria-invalid={touched.project && !projectId}
                  className={fieldCls(!!touched.project && !projectId)}
                >
                  <option value="" disabled>{companyId ? 'Select a project…' : 'Choose a company first'}</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                  ))}
                </select>
                <p className={cn('text-xs', touched.project && !projectId ? 'text-danger-ink' : 'text-muted-foreground')}>
                  {touched.project && !projectId ? 'Select the project this issue affects.' : `Only ${projects.length || 'your company’s'} registered projects are listed.`}
                </p>
              </div>
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label htmlFor="category" className="text-sm font-medium text-foreground">
                  Category <span className="text-danger" aria-hidden="true">*</span>
                </label>
                <select
                  id="category"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  onBlur={() => touch('category')}
                  aria-invalid={touched.category && !category}
                  className={fieldCls(!!touched.category && !category)}
                >
                  <option value="" disabled>What kind of request is this?</option>
                  {(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => (
                    <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>
                  ))}
                </select>
              </div>
            </div>
          </FormStep>

          <FormStep n={2} title="What’s happening?" description="A specific title and an accurate priority get your ticket triaged faster." complete={step2}>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="title" className="text-sm font-medium text-foreground">
                  Title <span className="text-danger" aria-hidden="true">*</span>
                </label>
                <span className="text-xs text-muted-foreground tabular-nums">{title.length}/120</span>
              </div>
              <input
                id="title"
                required
                maxLength={120}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => touch('title')}
                placeholder="e.g. Login fails with “Session expired” on iOS 18 after update 4.2"
                aria-invalid={touched.title && !checks[2].done}
                className={fieldCls(!!touched.title && !checks[2].done)}
              />
              <p className={cn('text-xs', touched.title && !checks[2].done ? 'text-danger-ink' : 'text-muted-foreground')}>
                {touched.title && !checks[2].done
                  ? `Add ${TITLE_MIN - title.trim().length} more characters — describe what fails and where.`
                  : 'Describe the symptom and where it occurs.'}
              </p>
            </div>

            <fieldset className="mt-5">
              <legend className="mb-2 text-sm font-medium text-foreground">
                Priority <span className="text-danger" aria-hidden="true">*</span>
              </legend>
              <PriorityPicker value={priority} onChange={(p) => { setPriority(p); touch('priority') }} invalid={!!touched.priority && !priority} />
            </fieldset>
          </FormStep>

          <FormStep n={3} title="Give us the details" description="Steps to reproduce, expected vs. actual behaviour, and any screenshots or logs." complete={step3}>
            <DescriptionEditor value={description} onChange={setDescription} onBlur={() => touch('description')} showError={!!touched.description} />
            <div className="mt-5">
              <AttachmentDrop files={attachments} onChange={setAttachments} />
            </div>
          </FormStep>
        </div>

        <aside className="sticky top-6 flex flex-col gap-4" aria-label="Submission checklist">
          <div className="rounded-xl border bg-card p-5 shadow-xs">
            <h2 className="text-sm font-semibold text-foreground">Before you submit</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {remaining === 0 ? 'Everything required is complete.' : `${remaining} required item${remaining > 1 ? 's' : ''} remaining`}
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800" aria-hidden="true">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${((checks.length - remaining) / checks.length) * 100}%` }} />
            </div>
            <ul className="mt-4 flex flex-col gap-2.5">
              {checks.map((c) => (
                <li key={c.id} className="flex items-center gap-2.5 text-sm">
                  {c.done ? (
                    <span className="flex size-5 items-center justify-center rounded-full bg-emerald-600 text-white">
                      <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                    </span>
                  ) : (
                    <Circle className="size-5 text-slate-300 dark:text-slate-600" aria-hidden="true" />
                  )}
                  <span className={c.done ? 'text-foreground' : 'text-muted-foreground'}>{c.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-xs">
            <Button type="submit" size="lg" className="w-full font-semibold cursor-pointer" disabled={remaining > 0 || submitting}>
              {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Send className="size-4" aria-hidden="true" />}
              {submitting ? 'Submitting…' : 'Submit Ticket'}
            </Button>

            {/* SAVE DRAFT BUTONU */}
            <Button
              type="button"
              variant="outline"
              size="lg"
              className={cn(
                'w-full cursor-pointer transition-all duration-200',
                showSavedToast
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              onClick={handleSaveDraft}
            >
              {showSavedToast ? <Check className="size-4" /> : <Save className="size-4" />}
              {showSavedToast ? 'Draft Saved to List!' : 'Save Draft'}
            </Button>

            <div className="text-center text-xs text-muted-foreground pt-1" aria-live="polite">
              {showSavedToast ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ Saved to drafts list
                </span>
              ) : remaining > 0 ? (
                'Submit unlocks when the checklist is complete.'
              ) : (
                'Your SLA clock starts on submission.'
              )}
            </div>
          </div>
        </aside>
      </form>
    </>
  )
}