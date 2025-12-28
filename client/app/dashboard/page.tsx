import { AppLayout } from "@/components/layout/app-layout"
import { StatsCard } from "@/components/dashboard/stats-card"
import { SubscriberChart } from "@/components/dashboard/subscriber-chart"
import { RecentCampaigns } from "@/components/dashboard/recent-campaigns"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { TerminalStatus } from "@/components/dashboard/terminal-status"

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="p-8 animate-fade-up">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening with your newsletters.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard title="Total Subscribers" value="12,486" change={12.5} icon="users" accentColor="terminal" />
          <StatsCard title="Emails Sent" value="48,392" change={8.2} icon="mail" accentColor="cyan" />
          <StatsCard title="Avg. Open Rate" value="42.8%" change={3.1} icon="eye" accentColor="terminal" />
          <StatsCard title="Avg. Click Rate" value="12.4%" change={-1.2} icon="mousePointer2" accentColor="amber" />
        </div>

        {/* Charts and Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <SubscriberChart />
          </div>
          <div>
            <QuickActions />
          </div>
        </div>

        {/* Recent Campaigns and Terminal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentCampaigns />
          </div>
          <div>
            <TerminalStatus />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
