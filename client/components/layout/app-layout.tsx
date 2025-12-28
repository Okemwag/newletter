"use client"

import type React from "react"

import { Sidebar } from "./sidebar"
import { cn } from "@/lib/utils"

interface AppLayoutProps {
  children: React.ReactNode
  className?: string
}

export function AppLayout({ children, className }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className={cn("ml-64 min-h-screen transition-all duration-300", className)}>
        <div className="scanlines min-h-screen">{children}</div>
      </main>
    </div>
  )
}
