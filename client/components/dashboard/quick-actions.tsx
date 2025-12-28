"use client"

import { GlowCard } from "@/components/ui/glow-card"
import { Button } from "@/components/ui/button"
import { PenLine, Upload, Sparkles, Settings2 } from "lucide-react"
import Link from "next/link"

const actions = [
  {
    title: "New Campaign",
    description: "Create a new email campaign",
    icon: PenLine,
    href: "/campaigns/new",
    accent: "terminal" as const,
  },
  {
    title: "Import Subscribers",
    description: "Upload a CSV file",
    icon: Upload,
    href: "/subscribers?import=true",
    accent: "cyan" as const,
  },
  {
    title: "AI Writing Assistant",
    description: "Generate content with AI",
    icon: Sparkles,
    href: "/campaigns/new?ai=true",
    accent: "amber" as const,
  },
  {
    title: "Configure Automations",
    description: "Set up email workflows",
    icon: Settings2,
    href: "/automations",
    accent: "terminal" as const,
  },
]

const accentStyles = {
  terminal: "bg-terminal/10 text-terminal group-hover:bg-terminal group-hover:text-terminal-foreground",
  cyan: "bg-cyan/10 text-cyan group-hover:bg-cyan group-hover:text-cyan-foreground",
  amber: "bg-amber/10 text-amber group-hover:bg-amber group-hover:text-amber-foreground",
}

export function QuickActions() {
  return (
    <GlowCard className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
        <p className="text-sm text-muted-foreground">Get started with common tasks</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions.map((action) => (
          <Link key={action.title} href={action.href}>
            <Button variant="ghost" className="w-full h-auto p-4 justify-start gap-4 hover:bg-muted/50 group">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${accentStyles[action.accent]}`}
              >
                <action.icon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground">{action.title}</p>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </div>
            </Button>
          </Link>
        ))}
      </div>
    </GlowCard>
  )
}
