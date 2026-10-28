import type { Metadata } from 'next'
import { TicketDetail } from '@/components/nexus/detail/ticket-detail'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  return { title: `#${id}` }
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ created?: string }>
}) {
  const [{ id }, sp] = await Promise.all([params, searchParams])
  return <TicketDetail id={decodeURIComponent(id)} created={sp.created === '1'} />
}
