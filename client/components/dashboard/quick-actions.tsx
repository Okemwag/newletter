"use client"

import { useState, useEffect } from "react"
import { GlowCard } from "@/components/ui/glow-card"
import { Skeleton } from "@/components/ui/skeleton"
import { PenLine, Upload, Sparkles, Settings2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const actions = [
  {
    title: "New Campaign",
    description: "Create a new email campaign",
    icon: PenLine,
    href: "/campaigns/new",
    accent: "terminal" as const,
    shortcut: "C",
  },
  {
    title: "Import Subscribers",
    description: "Upload a CSV file",
    icon: Upload,
    href: "/subscribers?import=true",
    accent: "cyan" as const,
    shortcut: "I",
  },
  {
    title: "AI Writing Assistant",
    description: "Generate content with AI",
    icon: Sparkles,
    href: "/campaigns/new?ai=true",
    accent: "amber" as const,
    shortcut: "A",
  },
  {
    title: "Configure Automations",
    description: "Set up email workflows",
    icon: Settings2,
    href: "/automations",
    accent: "terminal" as const,
    shortcut: "W",
  },
]

const accentStyles = {
  terminal: "bg-terminal/10 text-terminal group-hover:bg-terminal/20 group-hover:shadow-lg group-hover:shadow-terminal/20",
  cyan: "bg-cyan/10 text-cyan group-hover:bg-cyan/20 group-hover:shadow-lg group-hover:shadow-cyan/20",
  amber: "bg-amber/10 text-amber group-hover:bg-amber/20 group-hover:shadow-lg group-hover:shadow-amber/20",
}

function QuickActionsSkeleton() {
  return (
    <GlowCard className="p-6 h-full">
      <div className="mb-6 pb-4 border-b border-border/50">
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg border border-border/50 bg-card/50 p-4">
            <div className="flex items-start gap-4">
              <Skeleton className="w-12 h-12 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlowCard>
  )
}

export function QuickActions() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [clickedAction, setClickedAction] = useState<string | null>(null)

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl/Cmd + Shift + [shortcut key]
      if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
        const action = actions.find((a) => a.shortcut.toLowerCase() === e.key.toLowerCase())
        if (action) {
          e.preventDefault()
          handleActionClick(action)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleActionClick = (action: typeof actions[0]) => {
    // Optimistic update
    setClickedAction(action.title)

    // Show toast notification
    toast.success(`Opening ${action.title}...`, {
      description: action.description,
      duration: 2000,
    })

    // Navigate after a brief delay for visual feedback
    setTimeout(() => {
      router.push(action.href)
    }, 300)
  }

  if (isLoading) {
    return <QuickActionsSkeleton />
  }

  return (
    <GlowCard className="p-6 h-full">
      <div className="mb-6 pb-4 border-b border-border/50">
        <h3 className="text-lg font-semibold text-foreground mb-1">Quick Actions</h3>
        <p className="text-sm text-muted-foreground">Get started with common tasks</p>
      </div>
      <div className="space-y-3">
        {actions.map((action) => (
          <button
            key={action.title}
            onClick={() => handleActionClick(action)}
            className="block w-full text-left group"
            disabled={clickedAction === action.title}
          >
            <div
              className={`relative overflow-hidden rounded-lg border border-border/50 bg-card/50 p-4 transition-all duration-200 hover:border-border hover:bg-card hover:shadow-md hover:-translate-y-0.5 ${
                clickedAction === action.title ? "opacity-60 scale-[0.98]" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 ${accentStyles[action.accent]}`}
                >
                  <action.icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-foreground group-hover:text-terminal transition-colors">
                      {action.title}
                    </p>
                    <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-mono bg-muted/50 border border-border/50 rounded">
                      <span className="text-[10px]">⌘⇧</span>
                      {action.shortcut}
                    </kbd>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{action.description}</p>
                </div>
              </div>
              {/* Subtle gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-terminal/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          </button>
        ))}
      </div>
    </GlowCard>
  )
}
