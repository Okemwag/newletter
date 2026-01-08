"use client"

import { AppLayout } from "@/components/layout/app-layout"
import { StatsCard } from "@/components/dashboard/stats-card"
import { SubscriberChart } from "@/components/dashboard/subscriber-chart"
import { RecentCampaigns } from "@/components/dashboard/recent-campaigns"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { TerminalStatus } from "@/components/dashboard/terminal-status"
import { OnboardingBanner } from "@/components/dashboard/onboarding-banner"
import { FeatureLockOverlay } from "@/components/dashboard/feature-lock-overlay"
import { ProtectedRoute, useAuth } from "@/contexts/auth-context"
import { getDashboardAccess, CreatorStatus } from "@/lib/permissions"

// Mock data for early stages
const mockStats = {
  subscribers: "0",
  emailsSent: "0",
  openRate: "0%",
  clickRate: "0%",
}

// Demo data to show potential
const demoStats = {
  subscribers: "12,486",
  emailsSent: "48,392",
  openRate: "42.8%",
  clickRate: "12.4%",
}

function DashboardContent() {
  const { user } = useAuth()
  const creatorStatus = (user?.creatorStatus as CreatorStatus) || 'email_verified'
  const access = getDashboardAccess(creatorStatus)

  // Use demo stats for early stages to show potential, real stats later
  const stats = access.showMockData ? demoStats : demoStats // Replace with real API data when available
  const showMockLabel = access.showMockData

  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-fade-up">
      {/* Onboarding Banner */}
      {access.nextStep && (
        <OnboardingBanner status={creatorStatus} />
      )}

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-1 sm:mb-2">Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {access.showMockData
                ? "Complete your setup to see real data. These are example metrics."
                : "Welcome back! Here's what's happening with your newsletters."
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            {showMockLabel && (
              <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-1 rounded-full border border-amber-500/20">
                Demo Data
              </span>
            )}
            <div className="text-xs sm:text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full hidden sm:block">
              Last updated: Just now
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <StatsCard
          title="Total Subscribers"
          value={stats.subscribers}
          change={access.showMockData ? 12.5 : 0}
          icon="users"
          accentColor="terminal"
        />
        <StatsCard
          title="Emails Sent"
          value={stats.emailsSent}
          change={access.showMockData ? 8.2 : 0}
          icon="mail"
          accentColor="cyan"
        />
        <StatsCard
          title="Avg. Open Rate"
          value={stats.openRate}
          change={access.showMockData ? 3.1 : 0}
          icon="eye"
          accentColor="terminal"
        />
        <StatsCard
          title="Avg. Click Rate"
          value={stats.clickRate}
          change={access.showMockData ? -1.2 : 0}
          icon="mousePointer2"
          accentColor="amber"
        />
      </div>

      {/* Charts and Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="lg:col-span-2 min-w-0 relative">
          <SubscriberChart />
          {access.isReadOnly && (
            <FeatureLockOverlay
              reason="Complete your profile to see real analytics"
              ctaText="Complete Profile"
              ctaAction="/onboarding/profile"
            />
          )}
        </div>
        <div className="min-w-0 relative">
          <QuickActions />
          {!access.features.create_campaign.enabled && (
            <FeatureLockOverlay
              reason={access.features.create_campaign.reason || "Complete your profile to unlock"}
              ctaText={access.features.create_campaign.ctaText}
              ctaAction={access.features.create_campaign.ctaAction}
            />
          )}
        </div>
      </div>

      {/* Recent Campaigns and Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 min-w-0 relative">
          <RecentCampaigns />
          {access.isReadOnly && (
            <FeatureLockOverlay
              reason="Complete setup to manage campaigns"
              ctaText="Continue Setup"
              ctaAction={access.nextStep?.href || "/onboarding/profile"}
            />
          )}
        </div>
        <div className="min-w-0 relative">
          <TerminalStatus />
          {!access.features.real_time_data.enabled && (
            <FeatureLockOverlay
              reason="Set pricing to see real-time system logs"
              ctaText="Set Pricing"
              ctaAction="/onboarding/pricing"
            />
          )}
        </div>
      </div>

      {/* Payout Warning for pricing_set status */}
      {creatorStatus === 'pricing_set' && (
        <div className="mt-6 p-4 rounded-lg border border-amber-500/30 bg-amber-500/10">
          <div className="flex items-start gap-3">
            <div className="text-amber-400">⚠️</div>
            <div>
              <p className="text-sm font-medium text-amber-400">Earnings are accumulating</p>
              <p className="text-xs text-muted-foreground mt-1">
                You can accept paid subscribers, but payouts are locked until you complete payout setup.
              </p>
              <a href="/onboarding/payout" className="text-xs text-cyan-400 hover:underline mt-2 inline-block">
                Set up payouts →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <DashboardContent />
      </AppLayout>
    </ProtectedRoute>
  )
}
