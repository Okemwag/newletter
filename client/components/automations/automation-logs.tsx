"use client"

import { GlowCard } from "@/components/ui/glow-card"
import { TerminalText } from "@/components/ui/terminal-text"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertCircle, Clock, XCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

const logs = [
  {
    id: 1,
    timestamp: "2024-11-20 14:32:18",
    automation: "Welcome Series",
    action: "Email sent to sarah.chen@example.com",
    status: "success",
  },
  {
    id: 2,
    timestamp: "2024-11-20 14:30:45",
    automation: "Welcome Series",
    action: "Waiting 24h before next step",
    status: "pending",
  },
  {
    id: 3,
    timestamp: "2024-11-20 14:28:12",
    automation: "Re-engagement",
    action: "Triggered for 342 subscribers",
    status: "info",
  },
  {
    id: 4,
    timestamp: "2024-11-20 14:25:33",
    automation: "Welcome Series",
    action: "Failed to send: invalid email",
    status: "error",
  },
  {
    id: 5,
    timestamp: "2024-11-20 14:22:01",
    automation: "Tag Automation",
    action: "Added 'Premium' tag to 23 subscribers",
    status: "success",
  },
  {
    id: 6,
    timestamp: "2024-11-20 14:18:44",
    automation: "Welcome Series",
    action: "Email opened by m.brown@company.com",
    status: "success",
  },
  {
    id: 7,
    timestamp: "2024-11-20 14:15:22",
    automation: "Abandoned Cart",
    action: "Reminder email scheduled",
    status: "pending",
  },
  {
    id: 8,
    timestamp: "2024-11-20 14:12:09",
    automation: "Welcome Series",
    action: "New subscriber entered workflow",
    status: "info",
  },
]

const statusIcons = {
  success: CheckCircle2,
  pending: Clock,
  error: XCircle,
  info: AlertCircle,
}

const statusColors = {
  success: "text-terminal",
  pending: "text-amber",
  error: "text-destructive",
  info: "text-cyan",
}

export function AutomationLogs() {
  return (
    <GlowCard className="h-full flex flex-col" scanlines>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <span className="font-mono text-terminal">{">"}</span>
            Activity Logs
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">Real-time automation events</p>
        </div>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Logs */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-3 font-mono text-xs terminal-flicker">
          {logs.map((log) => {
            const Icon = statusIcons[log.status as keyof typeof statusIcons]
            return (
              <div key={log.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                <Icon
                  className={`w-4 h-4 mt-0.5 flex-shrink-0 ${statusColors[log.status as keyof typeof statusColors]}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-muted-foreground">{log.timestamp}</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                      {log.automation}
                    </Badge>
                  </div>
                  <p className="text-foreground/90 break-words">{log.action}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <TerminalText className="text-terminal-dim text-xs">{">"}</TerminalText>
          <span className="text-terminal-dim text-xs font-mono cursor-blink">_</span>
        </div>
      </div>
    </GlowCard>
  )
}
