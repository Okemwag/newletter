"use client"

import { GlowCard } from "@/components/ui/glow-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Mail, Eye, MousePointer2 } from "lucide-react"
import Link from "next/link"

const campaigns = [
  {
    id: 1,
    name: "Weekly Product Digest",
    status: "sent",
    sentAt: "2 hours ago",
    recipients: 8432,
    openRate: 42.3,
    clickRate: 12.8,
  },
  {
    id: 2,
    name: "Black Friday Early Access",
    status: "sent",
    sentAt: "1 day ago",
    recipients: 12580,
    openRate: 58.7,
    clickRate: 24.1,
  },
  {
    id: 3,
    name: "Monthly Newsletter #24",
    status: "scheduled",
    sentAt: "Tomorrow, 9:00 AM",
    recipients: 12400,
    openRate: null,
    clickRate: null,
  },
  {
    id: 4,
    name: "Feature Launch Announcement",
    status: "draft",
    sentAt: null,
    recipients: null,
    openRate: null,
    clickRate: null,
  },
]

const statusStyles = {
  sent: "bg-terminal/10 text-terminal border-terminal/20",
  scheduled: "bg-amber/10 text-amber border-amber/20",
  draft: "bg-muted text-muted-foreground border-border",
}

export function RecentCampaigns() {
  return (
    <GlowCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Recent Campaigns</h3>
          <p className="text-sm text-muted-foreground">Your latest email campaigns</p>
        </div>
        <Link href="/campaigns">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            View all
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
      <div className="space-y-4">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
          >
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-foreground truncate">{campaign.name}</p>
                <Badge variant="outline" className={statusStyles[campaign.status as keyof typeof statusStyles]}>
                  {campaign.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {campaign.sentAt ? campaign.sentAt : "No schedule set"}
                {campaign.recipients && ` · ${campaign.recipients.toLocaleString()} recipients`}
              </p>
            </div>
            {campaign.status === "sent" && (
              <div className="hidden md:flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground font-medium">{campaign.openRate}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <MousePointer2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground font-medium">{campaign.clickRate}%</span>
                </div>
              </div>
            )}
            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </GlowCard>
  )
}
