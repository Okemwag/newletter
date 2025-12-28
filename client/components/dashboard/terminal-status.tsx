"use client"

import { GlowCard } from "@/components/ui/glow-card"
import { TerminalText } from "@/components/ui/terminal-text"
import { CheckCircle2, Clock, AlertCircle } from "lucide-react"

const logs = [
  {
    time: "12:45:32",
    message: "Campaign 'Weekly Digest' sent successfully",
    status: "success",
  },
  {
    time: "12:44:18",
    message: "Processing 8,432 recipients...",
    status: "success",
  },
  {
    time: "12:44:01",
    message: "Campaign queued for delivery",
    status: "info",
  },
  {
    time: "12:42:55",
    message: "Warming up email server",
    status: "info",
  },
  {
    time: "12:40:12",
    message: "New subscriber: john@example.com",
    status: "success",
  },
]

const statusIcons = {
  success: CheckCircle2,
  info: Clock,
  warning: AlertCircle,
}

const statusColors = {
  success: "text-terminal",
  info: "text-cyan",
  warning: "text-amber",
}

export function TerminalStatus() {
  return (
    <GlowCard className="p-6 scanlines" scanlines>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <span className="font-mono text-terminal">{">"}</span>
          System Activity
        </h3>
        <p className="text-sm text-muted-foreground">Real-time platform events</p>
      </div>
      <div className="bg-background/50 rounded-lg border border-border p-4 font-mono text-sm space-y-2 terminal-flicker">
        {logs.map((log, i) => {
          const Icon = statusIcons[log.status as keyof typeof statusIcons]
          return (
            <div key={i} className="flex items-start gap-3">
              <span className="text-muted-foreground flex-shrink-0">{log.time}</span>
              <Icon
                className={`w-4 h-4 mt-0.5 flex-shrink-0 ${statusColors[log.status as keyof typeof statusColors]}`}
              />
              <span className="text-foreground/90">{log.message}</span>
            </div>
          )
        })}
        <div className="flex items-center gap-2 pt-2 border-t border-border/50 mt-3">
          <TerminalText className="text-terminal-dim">{">"}</TerminalText>
          <span className="text-terminal-dim cursor-blink">_</span>
        </div>
      </div>
    </GlowCard>
  )
}
