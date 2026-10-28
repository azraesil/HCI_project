'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  AlertCircle, 
  Briefcase, 
  Code2, 
  Eye, 
  EyeOff, 
  Lock, 
  Shield, 
  UserRound, 
  Loader2, 
  Mail, 
  Clock, 
  Layers, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { DEMO_USER_BY_ROLE, ROLE_LABEL, USERS, userById, type Role } from '@/lib/nexus-data'
import { useNexus } from './nexus-provider'
import { NexusLogo } from './nexus-logo'

const ROLE_META: Record<Role, { Icon: typeof Shield; hint: string }> = {
  admin: { Icon: Shield, hint: 'All tenants & settings' },
  pm: { Icon: Briefcase, hint: 'Dashboards & triage' },
  developer: { Icon: Code2, hint: 'Board & assigned work' },
  client: { Icon: UserRound, hint: 'Submit & track tickets' },
}

const landingFor = (r: Role) => (r === 'client' ? '/tickets/new' : r === 'developer' ? '/my-tickets' : '/dashboard')

export function LoginScreen() {
  const { signIn } = useNexus()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({})
  const [pending, setPending] = useState<Role | 'form' | null>(null)
  const [notice, setNotice] = useState(false)

  const enter = (role: Role, source: Role | 'form') => {
    setPending(source)
    signIn(role)
    router.push(landingFor(role))
  }

  const validate = () => {
    const next: typeof errors = {}
    if (!email.trim()) next.email = 'Enter your work email address.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'This doesn’t look like a valid email. Example: name@company.com'
    if (!password) next.password = 'Enter your password.'
    else if (password.length < 8) next.password = `Password must be at least 8 characters (currently ${password.length}).`
    return next
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const next = validate()
    if (!next.email && !next.password) {
      const match = USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
      if (!match) next.form = 'We couldn’t find an account with that email. Use a demo account below or check for typos.'
      else {
        setErrors({})
        enter(match.role, 'form')
        return
      }
    }
    setErrors(next)
  }

  return (
    <main className="min-h-screen w-full flex flex-col lg:flex-row bg-background">
      {/* Sol Panel: Hero / Marka & Özellik Vurguları */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-slate-950 text-white overflow-hidden border-r border-slate-800">
        <div className="absolute -top-40 -left-40 size-96 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 size-80 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <NexusLogo />
        </div>

        <div className="relative z-10 max-w-lg space-y-8 my-auto">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Sparkles className="size-3.5" /> Next-Gen IT Service Management
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl leading-tight">
              Precision ticketing with live SLA guardrails.
            </h1>
            <p className="text-base text-slate-400 leading-relaxed">
              Multi-tenant architecture, role-based access control, and human-centered design for enterprise IT service desks.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
                <Clock className="size-4" /> Live SLA Tracking
              </div>
              <p className="text-xs text-slate-400">Real-time service commitments with proactive breach alerts.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
                <Layers className="size-4" /> Multi-Tenant
              </div>
              <p className="text-xs text-slate-400">Dedicated, isolated ticket pools for every client and project.</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-6 text-xs text-slate-500 border-t border-slate-900 pt-6">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="size-4 text-emerald-500" /> SOC 2 Type II
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="size-4 text-emerald-500" /> AES-256 Encrypted
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="size-4 text-emerald-500" /> SSO Ready
          </span>
        </div>
      </div>

      {/* Sağ Panel: Giriş Formu ve Kompakt Demo Switcher */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-16 bg-slate-50 dark:bg-slate-950/40">
        <div className="w-full max-w-md space-y-7">
          <div className="lg:hidden flex justify-center mb-6">
            <NexusLogo />
          </div>

          <div className="space-y-1.5 text-center lg:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Sign in to your workspace</h2>
            <p className="text-sm text-muted-foreground">Access your company tickets and SLA dashboards.</p>
          </div>

          {errors.form && (
            <div role="alert" className="flex gap-2.5 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/50 p-3.5 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{errors.form}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={onSubmit} noValidate>
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Work email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (notice) setNotice(false)
                    if (errors.email || errors.form) setErrors((p) => ({ ...p, email: undefined, form: undefined }))
                  }}
                  placeholder="name@company.com"
                  aria-invalid={!!errors.email}
                  className={cn(
                    'w-full h-11 pl-10 pr-3.5 rounded-xl border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 shadow-xs transition-colors',
                    errors.email 
                      ? 'border-red-500 focus:ring-red-500/20' 
                      : 'border-border focus:border-primary focus:ring-primary/20'
                  )}
                />
              </div>
              {errors.email && (
                <p className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 mt-1">
                  <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setNotice(true)}
                  className="text-xs font-medium text-primary hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (notice) setNotice(false)
                    if (errors.password) setErrors((p) => ({ ...p, password: undefined }))
                  }}
                  placeholder="Enter your password"
                  aria-invalid={!!errors.password}
                  aria-describedby="password-hint"
                  className={cn(
                    'w-full h-11 pl-10 pr-10 rounded-xl border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 shadow-xs transition-colors',
                    errors.password 
                      ? 'border-red-500 focus:ring-red-500/20' 
                      : 'border-border focus:border-primary focus:ring-primary/20'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password ? (
                <p className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 mt-1">
                  <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
                  {errors.password}
                </p>
              ) : (
                <p id="password-hint" className="text-xs text-muted-foreground">
                  Use at least 8 characters.
                </p>
              )}
              {notice && (
                <p role="status" className="text-xs text-muted-foreground">
                  Password reset is disabled in this demo. Use a Quick Demo Access account below.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={pending !== null}
              className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
            >
              {pending === 'form' ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Lock className="size-4" aria-hidden="true" />
              )}
              {pending === 'form' ? 'Signing in…' : 'Sign in securely'}
            </button>
          </form>

          {/* Quick Role Switcher */}
          <div className="space-y-3 pt-5 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quick Demo Access</span>
              <span className="text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/20">
                1-Click Demo
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {(Object.keys(ROLE_LABEL) as Role[]).map((r) => {
                const { Icon } = ROLE_META[r]
                const u = userById(DEMO_USER_BY_ROLE[r])

                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => enter(r, r)}
                    disabled={pending !== null}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border/80 bg-card hover:bg-muted/70 hover:border-primary/50 text-left transition-all shadow-2xs group disabled:opacity-60"
                  >
                    <div className="size-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs bg-slate-900 group-hover:bg-primary transition-colors">
                      {pending === r ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Icon className="size-3.5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                        {ROLE_LABEL[r]}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {u?.name}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}