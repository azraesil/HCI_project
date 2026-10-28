'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Building2, FolderGit2, ArrowUpRight, Ticket as TicketIcon, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import {  COMPANIES, PROJECTS, SEED_TICKETS, PRIORITY_LABEL, STATUS_LABEL } from '@/lib/nexus-data'
import { PageHeader } from '@/components/nexus/app-shell'

export default function CompaniesPage() {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(COMPANIES[0]?.id || '')
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

  const selectedCompany = COMPANIES.find((c) => c.id === selectedCompanyId)
  const companyProjects = PROJECTS.filter((p) => p.companyId === selectedCompanyId)

  // Seçili şirketin (ve varsa seçili projenin) biletleri
  const companyTickets = SEED_TICKETS.filter((t) => t.companyId === selectedCompanyId)
  const filteredTickets = selectedProjectId
    ? companyTickets.filter((t) => t.projectId === selectedProjectId)
    : companyTickets

  const activeCompanyTickets = companyTickets.filter((t) => t.status !== 'resolved')

  const handleSelectCompany = (id: string) => {
    setSelectedCompanyId(id)
    setSelectedProjectId(null)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Companies & Projects"
        description="Manage tenant organizations, project workspaces, and SLA commitment tiers."
      />

      {/* İKİ AYRI SÜTUN DÜZENİ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SOL SÜTUN: Hafif mat gri arka planlı fihrist sütunu */}
        <aside className="lg:col-span-4 rounded-2xl border border-border/80 bg-slate-100/60 dark:bg-slate-900/40 p-4 space-y-3.5">
          <div className="flex items-center justify-between px-1 pb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Organizations ({COMPANIES.length})
            </span>
            <span className="text-xs font-mono text-muted-foreground bg-background/80 px-2 py-0.5 rounded-md border border-border/60">
              Tenants
            </span>
          </div>

          {/* Alt alta dizili bağımsız kartlar */}
          <div className="space-y-2.5">
            {COMPANIES.map((company) => {
              const projectsCount = PROJECTS.filter((p) => p.companyId === company.id).length
              const openTicketsCount = SEED_TICKETS.filter(
                (t) => t.companyId === company.id && t.status !== 'resolved'
              ).length
              const isSelected = company.id === selectedCompanyId

              return (
                <button
                  key={company.id}
                  type="button"
                  onClick={() => handleSelectCompany(company.id)}
                  className={cn(
                    'w-full text-left p-3.5 rounded-xl border transition-all duration-150 flex items-center justify-between group cursor-pointer shadow-xs',
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20'
                      : 'border-border/90 bg-card hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        'size-9 rounded-lg flex items-center justify-center shrink-0 border transition-colors',
                        isSelected
                          ? 'bg-primary-foreground/15 border-primary-foreground/20 text-primary-foreground'
                          : 'bg-card border-border/80 text-muted-foreground'
                      )}
                    >
                      <Building2 className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className={cn('font-semibold text-sm truncate leading-tight', isSelected ? 'text-primary-foreground' : 'text-foreground')}>
                        {company.name}
                      </h3>
                      <p className={cn('text-xs mt-0.5 truncate', isSelected ? 'text-primary-foreground/75' : 'text-muted-foreground')}>
                        {company.contact}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex flex-col items-end gap-1 ml-2">
                    <span
                      className={cn(
                        'text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border whitespace-nowrap',
                        isSelected
                          ? 'bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30'
                          : company.tier === 'Enterprise'
                          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                          : company.tier === 'Business'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                          : 'bg-muted text-muted-foreground border-border'
                      )}
                    >
                      {company.tier}
                    </span>
                    <span className={cn('text-xs font-medium whitespace-nowrap', isSelected ? 'text-primary-foreground/85' : 'text-muted-foreground')}>
                      {projectsCount} proj · {openTicketsCount} active
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </aside>

        {/* SAĞ SÜTUN: Aynı sol sütun gibi hafif gri zeminli ana kutu */}
        <main className="lg:col-span-8 rounded-2xl border border-border/80 bg-slate-100/60 dark:bg-slate-900/40 p-6 lg:p-7 shadow-xs space-y-6">
          {selectedCompany && (
            <>
              {/* Şirket Başlığı ve Metrikler */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-border/60 gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl font-bold tracking-tight text-foreground">{selectedCompany.name}</h2>
                    <span
                      className={cn(
                        'text-xs font-semibold px-2.5 py-0.5 rounded-full border',
                        selectedCompany.tier === 'Enterprise'
                          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                          : selectedCompany.tier === 'Business'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                          : 'bg-background text-muted-foreground border-border'
                      )}
                    >
                      {selectedCompany.tier} Tier
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Account Lead: <span className="font-medium text-foreground">{selectedCompany.contact}</span>
                  </p>
                </div>

                <div className="flex gap-2.5">
                  <div className="bg-card/90 border border-border/70 rounded-xl px-4 py-2 text-center min-w-[90px] shadow-2xs">
                    <div className="text-lg font-bold text-foreground tabular-nums">{companyProjects.length}</div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Projects</div>
                  </div>
                  <div className="bg-card/90 border border-border/70 rounded-xl px-4 py-2 text-center min-w-[90px] shadow-2xs">
                    <div className="text-lg font-bold text-primary tabular-nums">{activeCompanyTickets.length}</div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active Work</div>
                  </div>
                </div>
              </div>

              {/* PROJE ÇALIŞMA ALANLARI */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <FolderGit2 className="size-3.5 text-blue-600 dark:text-blue-400" />
                    Active Project Workspaces ({companyProjects.length})
                  </h3>
                  {selectedProjectId && (
                    <button
                      type="button"
                      onClick={() => setSelectedProjectId(null)}
                      className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                    >
                      Show all projects ({companyTickets.length})
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {companyProjects.map((project) => {
                    const projectTickets = SEED_TICKETS.filter((t) => t.projectId === project.id)
                    const projectOpen = projectTickets.filter((t) => t.status !== 'resolved').length
                    const totalCount = projectTickets.length
                    const resolvedPct = totalCount > 0 ? Math.round(((totalCount - projectOpen) / totalCount) * 100) : 100
                    const isProjectSelected = selectedProjectId === project.id

                    return (
                      <button
                        key={project.id}
                        type="button"
                        onClick={() => setSelectedProjectId(isProjectSelected ? null : project.id)}
                        className={cn(
                          'w-full text-left rounded-xl p-4 transition-all duration-150 flex flex-col justify-between gap-3.5 border group cursor-pointer shadow-xs',
                          isProjectSelected
                            ? 'border-blue-500 bg-card ring-2 ring-blue-500/20'
                            : 'border-blue-200/90 dark:border-blue-900/50 bg-card hover:border-blue-400 hover:shadow-sm'
                        )}
                      >
                        <div className="space-y-2 w-full">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-500/15 px-2.5 py-0.5 rounded border border-blue-500/30 tracking-wider">
                              {project.code}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {isProjectSelected && (
                                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap">
                                  <Check className="size-2.5" /> Filtering
                                </span>
                              )}
                              <span
                                className={cn(
                                  'text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border whitespace-nowrap',
                                  projectOpen > 0
                                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                                    : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                                )}
                              >
                                {projectOpen > 0 ? `${projectOpen} Active` : 'Healthy'}
                              </span>
                            </div>
                          </div>

                          <h4 className="text-sm font-semibold text-foreground group-hover:text-blue-600 transition-colors">
                            {project.name}
                          </h4>
                        </div>

                        {/* İlerleme Çubuğu */}
                        <div className="space-y-1.5 pt-2 border-t border-border/50 w-full">
                          <div className="flex justify-between text-xs text-muted-foreground font-mono">
                            <span>{totalCount} total tickets</span>
                            <span className="text-blue-700 dark:text-blue-300 font-medium">{resolvedPct}% resolved</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-blue-600 dark:bg-blue-500 transition-all duration-300"
                              style={{ width: `${resolvedPct}%` }}
                            />
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* BİLETLER LİSTESİ */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <TicketIcon className="size-3.5 text-muted-foreground" />
                      Tickets & SLA Status
                    </h3>
                    {selectedProjectId && (
                      <span className="text-xs font-medium text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                        Filtered
                      </span>
                    )}
                  </div>
                  <Link
                    href="/tickets"
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    View all tickets <ArrowUpRight className="size-3.5" />
                  </Link>
                </div>

                {filteredTickets.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl bg-card">
                    No tickets found for this selection.
                  </div>
                ) : (
                  <div className="divide-y divide-border/60 border border-border/80 rounded-xl overflow-hidden bg-card shadow-xs">
                    {filteredTickets.slice(0, 5).map((ticket) => {
                      const project = PROJECTS.find((p) => p.id === ticket.projectId)

                      return (
                        <div
                          key={ticket.id}
                          className="p-3.5 hover:bg-muted/40 transition-colors flex items-center justify-between gap-4"
                        >
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/tickets/${ticket.id}`}
                                className="text-xs font-mono font-bold text-primary hover:underline"
                              >
                                #{ticket.id}
                              </Link>
                              <span className="text-xs text-muted-foreground/40">·</span>
                              <span className="text-xs font-mono font-medium text-primary bg-primary/10 px-1.5 py-0.2 rounded">
                                {project?.code || 'GEN'}
                              </span>
                              <span className="text-xs text-muted-foreground/40">·</span>
                              <span className="text-xs font-medium text-muted-foreground">{ticket.category}</span>
                            </div>
                            <Link
                              href={`/tickets/${ticket.id}`}
                              className="text-sm font-medium text-foreground hover:text-primary block truncate transition-colors"
                            >
                              {ticket.title}
                            </Link>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={cn(
                                'text-xs px-2 py-0.5 rounded-full font-semibold border',
                                ticket.priority === 'critical'
                                  ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                                  : ticket.priority === 'high'
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                  : 'bg-muted text-muted-foreground border-border'
                              )}
                            >
                              {PRIORITY_LABEL[ticket.priority]}
                            </span>
                            <span
                              className={cn(
                                'text-xs px-2 py-0.5 rounded-md font-medium border',
                                ticket.status === 'resolved'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                  : ticket.status === 'in_progress'
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                  : 'bg-muted text-muted-foreground border-border'
                              )}
                            >
                              {STATUS_LABEL[ticket.status]}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}