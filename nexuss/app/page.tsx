import type { Metadata } from 'next'
import { LoginScreen } from '@/components/nexus/login-screen'

export const metadata: Metadata = { title: 'Sign in' }

export default function Page() {
  return <LoginScreen />
}
