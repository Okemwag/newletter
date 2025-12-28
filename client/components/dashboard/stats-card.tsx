"use client"

import { GlowCard } from "@/components/ui/glow-card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus, Users, Mail, Eye, MousePointer2 } from "lucide-react"

const iconMap = {
  users: Users,
  mail: Mail,
  eye: Eye,
  mousePointer2: MousePointer2,
}

interface StatsCardProps {
  title: string
  value: string
  change?: number
  changeLabel?: string
  icon: keyof typeof iconMap
  accentColor?: "terminal" | "cyan" | "amber"
}

export function StatsCard({
  title,
  value,
  change,
  changeLabel = "vs last month",
  icon,
  accentColor = "terminal",
}: StatsCardProps) {
  const Icon = iconMap[icon]
  const isPositive = change && change > 0
  const isNegative = change && change < 0

  const accentClasses = {
    terminal: "text-terminal bg-terminal/10",
    cyan: "text-cyan bg-cyan/10",
    amber: "text-amber bg-amber/10",
  }

  return (
    <GlowCard className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", accentClasses[accentColor])}>
          <Icon className="w-5 h-5" />
        </div>
        {change !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
              isPositive && "text-terminal bg-terminal/10",
              isNegative && "text-destructive bg-destructive/10",
              !isPositive && !isNegative && "text-muted-foreground bg-muted",
            )}
          >
            {isPositive && <TrendingUp className="w-3 h-3" />}
            {isNegative && <TrendingDown className="w-3 h-3" />}
            {!isPositive && !isNegative && <Minus className="w-3 h-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-muted-foreground text-sm mb-1">{title}</p>
        <p className="text-3xl font-semibold text-foreground tracking-tight">{value}</p>
        {changeLabel && change !== undefined && <p className="text-xs text-muted-foreground mt-1">{changeLabel}</p>}
      </div>
    </GlowCard>
  )
}
