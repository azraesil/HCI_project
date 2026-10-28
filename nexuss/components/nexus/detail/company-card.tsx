import { Building2 } from 'lucide-react'
import { CATEGORY_LABEL, companyById, projectById, userById, type Ticket } from '@/lib/nexus-data'
import { formatDateTime } from '@/lib/sla'

export function CompanyCard({ ticket }: { ticket: Ticket }) {
  const company = companyById(ticket.companyId)
  const project = projectById(ticket.projectId)
  const rows = [
    ['Project', project ? `${project.name} (${project.code})` : '—'],
    ['Category', CATEGORY_LABEL[ticket.category]],
    ['Reporter', userById(ticket.reporterId)?.name ?? '—'],
    ['Client contact', company?.contact ?? '—'],
    ['Opened', formatDateTime(ticket.createdAt)],
  ]
  return (
    <section aria-labelledby="company-h" className="rounded-xl border bg-card p-5 shadow-xs">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-lg bg-navy text-white">
          <Building2 className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 id="company-h" className="font-semibold text-foreground">{company?.name}</h2>
          <p className="text-xs text-muted-foreground">{company?.tier} support plan</p>
        </div>
      </div>
      <dl className="mt-4 flex flex-col gap-2.5 border-t pt-4 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="text-right font-medium text-foreground">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
