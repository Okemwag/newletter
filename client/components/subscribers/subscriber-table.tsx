"use client"

import { useState } from "react"
import { GlowCard } from "@/components/ui/glow-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  MoreHorizontal,
  Upload,
  Download,
  Trash2,
  Tag,
  Mail,
  Filter,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Ban,
} from "lucide-react"

const subscribers = [
  {
    id: 1,
    name: "Sarah Chen",
    email: "sarah.chen@example.com",
    status: "active",
    source: "Website",
    joinedAt: "Nov 15, 2024",
    tags: ["Premium", "Early Adopter"],
    avatar: "/placeholder.svg?key=w0cxz",
  },
  {
    id: 2,
    name: "Michael Brown",
    email: "m.brown@company.com",
    status: "active",
    source: "Import",
    joinedAt: "Nov 12, 2024",
    tags: ["Newsletter"],
    avatar: "/placeholder.svg?key=yd1u9",
  },
  {
    id: 3,
    name: "Emily Davis",
    email: "emily.d@startup.io",
    status: "active",
    source: "API",
    joinedAt: "Nov 10, 2024",
    tags: ["Premium"],
    avatar: "/placeholder.svg?key=1ld2a",
  },
  {
    id: 4,
    name: "James Wilson",
    email: "jwilson@email.com",
    status: "unsubscribed",
    source: "Website",
    joinedAt: "Oct 28, 2024",
    tags: [],
    avatar: "/placeholder.svg?key=u8kqz",
  },
  {
    id: 5,
    name: "Lisa Anderson",
    email: "lisa.a@gmail.com",
    status: "active",
    source: "Referral",
    joinedAt: "Oct 25, 2024",
    tags: ["VIP", "Premium"],
    avatar: "/placeholder.svg?key=yrbpn",
  },
  {
    id: 6,
    name: "David Kim",
    email: "david.kim@tech.co",
    status: "bounced",
    source: "Website",
    joinedAt: "Oct 20, 2024",
    tags: [],
    avatar: "/placeholder.svg?key=p2f9h",
  },
  {
    id: 7,
    name: "Anna Martinez",
    email: "anna.m@agency.com",
    status: "active",
    source: "Import",
    joinedAt: "Oct 18, 2024",
    tags: ["Newsletter", "Early Adopter"],
    avatar: "/placeholder.svg?key=n8t2k",
  },
  {
    id: 8,
    name: "Robert Taylor",
    email: "rtaylor@business.org",
    status: "active",
    source: "API",
    joinedAt: "Oct 15, 2024",
    tags: ["Premium"],
    avatar: "/placeholder.svg?key=x9w3m",
  },
]

const statusStyles = {
  active: "bg-terminal/10 text-terminal border-terminal/20",
  unsubscribed: "bg-muted text-muted-foreground border-border",
  bounced: "bg-destructive/10 text-destructive border-destructive/20",
}

export function SubscriberTable() {
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const toggleAll = () => {
    if (selectedIds.length === subscribers.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(subscribers.map((s) => s.id))
    }
  }

  const toggleOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const filteredSubscribers = subscribers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">Subscribers</h1>
          <p className="text-muted-foreground">Manage your newsletter subscribers</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-secondary/50">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button className="bg-terminal text-terminal-foreground hover:bg-terminal/90 transition-all hover:scale-[1.02] active:scale-[0.98]">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Subscriber
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <GlowCard className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-input border-border focus:border-terminal"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select defaultValue="all">
              <SelectTrigger className="w-[140px] bg-input border-border">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                <SelectItem value="bounced">Bounced</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[140px] bg-input border-border">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="import">Import</SelectItem>
                <SelectItem value="api">API</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="bg-secondary/50">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>
      </GlowCard>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <GlowCard className="p-4 bg-terminal/5 border-terminal/20">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground">
              <span className="font-medium text-terminal">{selectedIds.length}</span> subscriber
              {selectedIds.length > 1 ? "s" : ""} selected
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Tag className="w-4 h-4 mr-2" />
                Add Tags
              </Button>
              <Button variant="outline" size="sm">
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive bg-transparent">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </GlowCard>
      )}

      {/* Table */}
      <GlowCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-6 py-4 w-12">
                  <Checkbox
                    checked={selectedIds.length === subscribers.length}
                    onCheckedChange={toggleAll}
                    aria-label="Select all"
                  />
                </th>
                <th className="text-left text-sm font-medium text-muted-foreground px-6 py-4">Subscriber</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-6 py-4">Status</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-6 py-4 hidden md:table-cell">
                  Source
                </th>
                <th className="text-left text-sm font-medium text-muted-foreground px-6 py-4 hidden lg:table-cell">
                  Tags
                </th>
                <th className="text-left text-sm font-medium text-muted-foreground px-6 py-4 hidden lg:table-cell">
                  Joined
                </th>
                <th className="text-right text-sm font-medium text-muted-foreground px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscribers.map((subscriber) => (
                <tr key={subscriber.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors group">
                  <td className="px-6 py-4">
                    <Checkbox
                      checked={selectedIds.includes(subscriber.id)}
                      onCheckedChange={() => toggleOne(subscriber.id)}
                      aria-label={`Select ${subscriber.name}`}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={subscriber.avatar || "/placeholder.svg"} alt={subscriber.name} />
                        <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                          {subscriber.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{subscriber.name}</p>
                        <p className="text-sm text-muted-foreground">{subscriber.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={statusStyles[subscriber.status as keyof typeof statusStyles]}>
                      {subscriber.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="text-foreground">{subscriber.source}</span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-1.5">
                      {subscriber.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-secondary/50 text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {subscriber.tags.length > 2 && (
                        <span className="text-xs text-muted-foreground">+{subscriber.tags.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="text-muted-foreground text-sm">{subscriber.joinedAt}</span>
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
                          <Mail className="w-4 h-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Tag className="w-4 h-4 mr-2" />
                          Manage Tags
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Ban className="w-4 h-4 mr-2" />
                          Unsubscribe
                        </DropdownMenuItem>
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

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">1-8</span> of{" "}
            <span className="font-medium text-foreground">12,486</span> subscribers
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="bg-terminal/10 text-terminal border-terminal/20">
              1
            </Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              3
            </Button>
            <span className="text-muted-foreground">...</span>
            <Button variant="outline" size="sm">
              1,561
            </Button>
            <Button variant="outline" size="sm">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </GlowCard>
    </div>
  )
}
