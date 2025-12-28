import type React from "react"
import { cn } from "@/lib/utils"

interface GlowCardProps {
  children: React.ReactNode
  className?: string
  scanlines?: boolean
}

export function GlowCard({ children, className, scanlines = false }: GlowCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card/50 backdrop-blur-sm card-glow",
        scanlines && "scanlines",
        className,
      )}
    >
      {children}
    </div>
  )
}
