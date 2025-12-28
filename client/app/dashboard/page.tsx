"use client"

import { AppLayout } from "@/components/layout/app-layout"
import { StatsCard } from "@/components/dashboard/stats-card"
import { SubscriberChart } from "@/components/dashboard/subscriber-chart"
import { RecentCampaigns } from "@/components/dashboard/recent-campaigns"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { TerminalStatus } from "@/components/dashboard/terminal-status"
import { ProtectedRoute } from "@/contexts/auth-context"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="p-4 sm:p-6 lg:p-8 animate-fade-up">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-1 sm:mb-2">Dashboard</h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Welcome back! Here&apos;s what&apos;s happening with your newsletters.
                </p>
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full hidden sm:block">
                Last updated: Just now
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <StatsCard title="Total Subscribers" value="12,486" change={12.5} icon="users" accentColor="terminal" />
            <StatsCard title="Emails Sent" value="48,392" change={8.2} icon="mail" accentColor="cyan" />
            <StatsCard title="Avg. Open Rate" value="42.8%" change={3.1} icon="eye" accentColor="terminal" />
            <StatsCard title="Avg. Click Rate" value="12.4%" change={-1.2} icon="mousePointer2" accentColor="amber" />
          </div>

          {/* Charts and Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="lg:col-span-2 min-w-0">
              <SubscriberChart />
            </div>
            <div className="min-w-0">
              <QuickActions />
            </div>
          </div>

          {/* Recent Campaigns and Terminal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2 min-w-0">
              <RecentCampaigns />
            </div>
            <div className="min-w-0">
              <TerminalStatus />
            </div>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  )
}
