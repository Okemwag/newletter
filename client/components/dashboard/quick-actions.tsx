"use client"

import { useState, useEffect } from "react"
import { GlowCard } from "@/components/ui/glow-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Icon } from "@iconify/react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const actions = [
  {
    title: "New Campaign",
    description: "Create a new email campaign",
    icon: "lucide:pen-line",
    href: "/campaigns/new",
    gradient: "from-cyan-500 to-blue-500",
    bgGlow: "cyan",
    shortcut: "C",
  },
  {
    title: "Import Subscribers",
    description: "Upload a CSV file",
    icon: "lucide:upload",
    href: "/subscribers?import=true",
    gradient: "from-purple-500 to-pink-500",
    bgGlow: "purple",
    shortcut: "I",
  },
  {
    title: "AI Writing Assistant",
    description: "Generate content with AI",
    icon: "lucide:sparkles",
    href: "/campaigns/new?ai=true",
    gradient: "from-amber-500 to-orange-500",
    bgGlow: "amber",
    shortcut: "A",
  },
  {
    title: "Configure Automations",
    description: "Set up email workflows",
    icon: "lucide:settings-2",
    href: "/automations",
    gradient: "from-green-500 to-emerald-500",
    bgGlow: "green",
    shortcut: "W",
  },
]

function QuickActionsSkeleton() {
  return (
    <GlowCard className="p-6 h-full">
      <div className="mb-6 pb-4 border-b border-border/50">
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-border/50 bg-card/50 p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-xl" />
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
  const [hoveredAction, setHoveredAction] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
    setClickedAction(action.title)
    toast.success(`Opening ${action.title}...`, {
      description: action.description,
      duration: 2000,
    })
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
        <div className="flex items-center gap-2 mb-1">
          <Icon icon="lucide:zap" className="h-5 w-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
        </div>
        <p className="text-sm text-muted-foreground">Get started with common tasks</p>
      </div>

      <div className="space-y-3">
        {actions.map((action) => (
          <button
            key={action.title}
            onClick={() => handleActionClick(action)}
            onMouseEnter={() => setHoveredAction(action.title)}
            onMouseLeave={() => setHoveredAction(null)}
            className="block w-full text-left group"
            disabled={clickedAction === action.title}
          >
            <div
              className={`relative overflow-hidden rounded-xl border transition-all duration-300 ${hoveredAction === action.title
                  ? "border-transparent bg-gradient-to-r p-[1px] " + action.gradient
                  : "border-border/50 bg-transparent"
                } ${clickedAction === action.title ? "opacity-60 scale-[0.98]" : ""}`}
            >
              <div className={`rounded-[11px] bg-card p-4 transition-all duration-300 ${hoveredAction === action.title ? "bg-card/95" : ""
                }`}>
                <div className="flex items-center gap-4">
                  {/* Icon with gradient background */}
                  <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${action.gradient} transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}
                    style={{
                      boxShadow: hoveredAction === action.title
                        ? `0 8px 24px -4px ${action.bgGlow === 'cyan' ? 'rgba(6,182,212,0.4)' :
                          action.bgGlow === 'purple' ? 'rgba(168,85,247,0.4)' :
                            action.bgGlow === 'amber' ? 'rgba(245,158,11,0.4)' :
                              'rgba(34,197,94,0.4)'}`
                        : 'none'
                    }}
                  >
                    <Icon icon={action.icon} className="w-5 h-5 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className={`font-semibold transition-colors duration-300 ${hoveredAction === action.title ? "text-foreground" : "text-foreground/90"
                        }`}>
                        {action.title}
                      </p>
                      <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-mono bg-muted/50 border border-border/50 rounded-lg opacity-60 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px]">⌘⇧</span>
                        {action.shortcut}
                      </kbd>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{action.description}</p>
                  </div>

                  {/* Arrow indicator */}
                  <Icon
                    icon="lucide:chevron-right"
                    className={`w-5 h-5 text-muted-foreground transition-all duration-300 ${hoveredAction === action.title ? "translate-x-1 opacity-100" : "opacity-0"
                      }`}
                  />
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Footer hint */}
      <div className="mt-6 pt-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
          <Icon icon="lucide:keyboard" className="h-3 w-3" />
          Press <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-muted rounded">⌘⇧</kbd> + letter for shortcuts
        </p>
      </div>
    </GlowCard>
  )
}
