'use client'

import { useState } from 'react'
import { Bell, Shield, Check } from 'lucide-react'
import { useNexus } from '@/components/nexus/nexus-provider'
import { PageHeader } from '@/components/nexus/app-shell'
import { ROLE_LABEL } from '@/lib/nexus-data'
import { cn } from '@/lib/utils'
import { AccessibilityCard } from '@/components/nexus/settings/accessibility-card'

export default function SettingsPage() {
  const { user } = useNexus()
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [criticalSms, setCriticalSms] = useState(true)
  const [autoEscalate, setAutoEscalate] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (!user) return null

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <PageHeader
        title="Settings & System Configuration"
        description="Manage user profile settings, notification routing, escalation triggers, and security controls."
      />

      <div className="space-y-6">
        {/* User Profile Overview */}
        <div className="p-6 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-xs shadow-xs space-y-6">
          <div className="flex items-center gap-4">
            <div
              className="size-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-xs shrink-0"
              style={{ backgroundColor: user.avatarColor }}
            >
              {user.initials}
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{user.name}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {user.email} · <span className="font-medium text-foreground">{user.title}</span>
              </p>
              <span className="inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Role: {ROLE_LABEL[user.role]}
              </span>
            </div>
          </div>
        </div>

        {/* Accessibility & Display Settings (HCI Project) */}
        <AccessibilityCard />

        {/* Notification & SLA Escalation Rules */}
        <div className="p-6 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-xs shadow-xs space-y-5">
          <div className="flex items-center gap-2 text-foreground font-semibold border-b border-border/60 pb-3">
            <Bell className="size-4 text-primary" />
            <h3 className="text-sm font-semibold tracking-tight">Notification & Escalation Rules</h3>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="pr-4">
                <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  Email Alerts on Ticket Updates
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Receive instant notifications when tickets you created or are assigned to change status.
                </div>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="size-4 rounded border-border text-primary focus:ring-primary/20"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer group">
              <div className="pr-4">
                <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  Critical SLA At-Risk Alerts
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Broadcast emergency alerts for critical tickets reaching under 1 hour remaining.
                </div>
              </div>
              <input
                type="checkbox"
                checked={criticalSms}
                onChange={(e) => setCriticalSms(e.target.checked)}
                className="size-4 rounded border-border text-primary focus:ring-primary/20"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer group">
              <div className="pr-4">
                <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  Auto-Escalate Unassigned Tickets
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Automatically escalate unassigned critical tickets to the Project Lead after 2 hours.
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoEscalate}
                onChange={(e) => setAutoEscalate(e.target.checked)}
                className="size-4 rounded border-border text-primary focus:ring-primary/20"
              />
            </label>
          </div>
        </div>

        {/* Security & Authentication */}
        <div className="p-6 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-xs shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-foreground font-semibold border-b border-border/60 pb-3">
            <Shield className="size-4 text-primary" />
            <h3 className="text-sm font-semibold tracking-tight">Security & Authentication</h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Multi-Factor Authentication (MFA)</p>
              <p className="text-xs text-muted-foreground mt-0.5">Enforced two-factor authentication for enterprise workspaces.</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Enabled
            </span>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between pt-2">
          {saved ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Check className="size-4" /> Changes saved successfully
            </span>
          ) : <span />}
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs transition-colors shadow-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}