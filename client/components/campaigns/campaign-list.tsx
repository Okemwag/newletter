"use client"

import { GlowCard } from "@/components/ui/glow-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Plus, MoreHorizontal, Mail, Eye, MousePointer2, Copy, Trash2, Edit } from "lucide-react"
import Link from "next/link"

const campaigns = [
  {
    id: 1,
    name: "Weekly Product Digest #47",
    status: "sent",
    sentAt: "Nov 20, 2024 at 9:00 AM",
    recipients: 8432,
    openRate: 42.3,
    clickRate: 12.8,
  },
  {
    id: 2,
    name: "Black Friday Early Access",
    status: "sent",
    sentAt: "Nov 18, 2024 at 10:00 AM",
    recipients: 12580,
    openRate: 58.7,
    clickRate: 24.1,
  },
  {
    id: 3,
    name: "Monthly Newsletter #24",
    status: "scheduled",
    sentAt: "Nov 25, 2024 at 9:00 AM",
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
  {
    id: 5,
    name: "Welcome Series - Email 1",
    status: "sent",
    sentAt: "Nov 15, 2024 at 2:00 PM",
    recipients: 1842,
    openRate: 72.4,
    clickRate: 31.2,
  },
  {
    id: 6,
    name: "Re-engagement Campaign",
    status: "sent",
    sentAt: "Nov 10, 2024 at 11:00 AM",
    recipients: 3420,
    openRate: 28.9,
    clickRate: 8.4,
  },
]

const statusStyles = {
  sent: "bg-terminal/10 text-terminal border-terminal/20",
  scheduled: "bg-amber/10 text-amber border-amber/20",
  draft: "bg-muted text-muted-foreground border-border",
}

export function CampaignList() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">Campaigns</h1>
          <p className="text-muted-foreground">Create, manage, and track your email campaigns</p>
        </div>
        <Link href="/campaigns/new">
          <Button className="bg-terminal text-terminal-foreground hover:bg-terminal/90 transition-all hover:scale-[1.02] active:scale-[0.98]">
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </Link>
      </div>

      {/* Search and Filter */}
      <GlowCard className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search campaigns..." className="pl-10 bg-input border-border focus:border-terminal" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="bg-secondary/50">
              All
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              Sent
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              Scheduled
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              Drafts
            </Button>
          </div>
        </div>
      </GlowCard>

      {/* Campaign Table */}
      <GlowCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-sm font-medium text-muted-foreground px-6 py-4">Campaign</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-6 py-4">Status</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-6 py-4 hidden md:table-cell">
                  Recipients
                </th>
                <th className="text-left text-sm font-medium text-muted-foreground px-6 py-4 hidden lg:table-cell">
                  Open Rate
                </th>
                <th className="text-left text-sm font-medium text-muted-foreground px-6 py-4 hidden lg:table-cell">
                  Click Rate
                </th>
                <th className="text-right text-sm font-medium text-muted-foreground px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{campaign.name}</p>
                        <p className="text-sm text-muted-foreground">{campaign.sentAt || "No date set"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={statusStyles[campaign.status as keyof typeof statusStyles]}>
                      {campaign.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="text-foreground">{campaign.recipients?.toLocaleString() || "—"}</span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    {campaign.openRate ? (
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground font-medium">{campaign.openRate}%</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    {campaign.clickRate ? (
                      <div className="flex items-center gap-2">
                        <MousePointer2 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground font-medium">{campaign.clickRate}%</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlowCard>
    </div>
  )
}
