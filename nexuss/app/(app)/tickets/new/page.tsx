'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useNexus } from '@/components/nexus/nexus-provider'
import { TicketForm } from '@/components/nexus/submit/ticket-form'

export default function NewTicketPage() {
  const { user } = useNexus()
  const router = useRouter()

  useEffect(() => {
    // Kullanıcı yüklendiğinde rolü 'client' değilse yetkisiz erişimi engelle
    if (user && user.role !== 'client') {
      router.replace('/tickets')
    }
  }, [user, router])

  // Yetkisiz kullanıcılar veya yüklenme anında formu hiç render etme
  if (!user || user.role !== 'client') {
    return null
  }

  return <TicketForm />
}