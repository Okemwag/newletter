"use client"

import { GlowCard } from "@/components/ui/glow-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Play, Pause, Copy, Trash2, Settings2, Mail, Clock, Users, Zap } from "lucide-react"

interface AutomationCardProps {
  automation: {
    id: number
    name: string
    description: string
    status: "active" | "paused" | "draft"
    trigger: string
    steps: number
    subscribers: number
    lastRun: string | null
  }
}

const statusStyles = {
  active: "bg-terminal/10 text-terminal border-terminal/20",
  paused: "bg-amber/10 text-amber border-amber/20",
  draft: "bg-muted text-muted-foreground border-border",
}

const triggerIcons: Record<string, typeof Mail> = {
  "New subscriber": Users,
  "Tag added": Zap,
  "Email opened": Mail,
  Scheduled: Clock,
}

export function AutomationCard({ automation }: AutomationCardProps) {
  const TriggerIcon = triggerIcons[automation.trigger] || Zap

  return (
    <GlowCard className="p-6 hover:bg-muted/20 transition-colors group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-terminal/10 flex items-center justify-center">
            <TriggerIcon className="w-5 h-5 text-terminal" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{automation.name}</h3>
            <p className="text-sm text-muted-foreground">{automation.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={automation.status === "active"} disabled={automation.status === "draft"} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Settings2 className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem>
                {automation.status === "active" ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={statusStyles[automation.status]}>
            {automation.status}
          </Badge>
        </div>
        <div className="text-muted-foreground">
          <span className="text-foreground font-medium">{automation.steps}</span> steps
        </div>
        <div className="text-muted-foreground">
          <span className="text-foreground font-medium">{automation.subscribers.toLocaleString()}</span> triggered
        </div>
        {automation.lastRun && (
          <div className="text-muted-foreground">
            Last run: <span className="text-foreground">{automation.lastRun}</span>
          </div>
        )}
      </div>

      {/* Visual Flow Preview */}
      <div className="mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan/10 border border-cyan/20">
            <TriggerIcon className="w-3 h-3 text-cyan" />
            <span className="text-xs font-medium text-cyan">{automation.trigger}</span>
          </div>
          <div className="w-8 h-px bg-border" />
          <div className="flex -space-x-1">
            {Array.from({ length: Math.min(automation.steps, 3) }).map((_, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full bg-secondary border-2 border-card flex items-center justify-center"
              >
                <span className="text-[10px] font-medium text-muted-foreground">{i + 1}</span>
              </div>
            ))}
            {automation.steps > 3 && (
              <div className="w-6 h-6 rounded-full bg-muted border-2 border-card flex items-center justify-center">
                <span className="text-[10px] text-muted-foreground">+{automation.steps - 3}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </GlowCard>
  )
}
