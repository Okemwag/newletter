"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface TerminalTextProps {
  children: React.ReactNode
  className?: string
  typing?: boolean
  delay?: number
}

export function TerminalText({ children, className, typing = false, delay = 50 }: TerminalTextProps) {
  const [displayText, setDisplayText] = useState(typing ? "" : String(children))
  const fullText = String(children)

  useEffect(() => {
    if (!typing) return

    let index = 0
    const timer = setInterval(() => {
      setDisplayText(fullText.slice(0, index + 1))
      index++
      if (index >= fullText.length) {
        clearInterval(timer)
      }
    }, delay)

    return () => clearInterval(timer)
  }, [fullText, typing, delay])

  return (
    <span className={cn("font-mono text-terminal terminal-flicker", className)}>
      {displayText}
      {typing && displayText.length < fullText.length && <span className="cursor-blink">▌</span>}
    </span>
  )
}
