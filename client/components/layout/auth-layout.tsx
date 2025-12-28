import type React from "react"

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 scanlines">
      <div className="absolute inset-0 bg-gradient-to-br from-terminal/5 via-transparent to-cyan/5" />
      <div className="relative w-full max-w-md animate-fade-up">{children}</div>
    </div>
  )
}
