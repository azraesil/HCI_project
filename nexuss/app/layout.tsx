import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { cookies } from 'next/headers'
import { NexusProvider } from '@/components/nexus/nexus-provider'
import type { Role } from '@/lib/nexus-data'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' })

export const metadata: Metadata = {
  title: {
    default: 'Nexus — Enterprise IT Service Management',
    template: '%s · Nexus',
  },
  description:
    'Nexus is a multi-tenant IT service management platform with SLA-driven ticket tracking for admins, project managers, developers and clients.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#0F172A',
}

const ROLES: Role[] = ['admin', 'pm', 'developer', 'client']

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieRole = (await cookies()).get('nexus_role')?.value as Role | undefined
  const initialRole = cookieRole && ROLES.includes(cookieRole) ? cookieRole : null

  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrains.variable} bg-background`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var raw=localStorage.getItem('nexus-a11y');if(raw){var p=JSON.parse(raw);var doc=document.documentElement;if(p.textSize&&['default','large','xlarge'].indexOf(p.textSize)!==-1){doc.setAttribute('data-text-size',p.textSize);}if(p.highContrast){doc.setAttribute('data-contrast','high');}if(p.reduceMotion){doc.setAttribute('data-motion','reduce');}}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased">
        <NexusProvider initialRole={initialRole}>{children}</NexusProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
