"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { GlowCard } from "@/components/ui/glow-card"
import { AuthLayout } from "@/components/layout/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TerminalText } from "@/components/ui/terminal-text"
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    setIsSubmitted(true)
  }

  return (
    <AuthLayout>
      <GlowCard className="p-8">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-terminal flex items-center justify-center primary-glow">
            <span className="font-mono font-bold text-terminal-foreground text-xl">P</span>
          </div>
        </div>

        {isSubmitted ? (
          <>
            {/* Success state */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-terminal/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-terminal" />
              </div>
              <h1 className="text-2xl font-semibold text-foreground mb-2">Check your email</h1>
              <p className="text-muted-foreground text-sm mb-8">
                We&apos;ve sent a password reset link to <span className="text-foreground font-medium">{email}</span>
              </p>
              <Link href="/login">
                <Button variant="outline" className="w-full bg-transparent">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to sign in
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-foreground mb-2">Reset password</h1>
              <p className="text-muted-foreground text-sm">
                <TerminalText>{">"}</TerminalText> Enter your email to receive a reset link
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-foreground">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-input border-border focus:border-terminal focus:ring-terminal/20"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-terminal text-terminal-foreground hover:bg-terminal/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending link...
                  </>
                ) : (
                  "Send reset link"
                )}
              </Button>
            </form>

            {/* Footer */}
            <p className="mt-8 text-center text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link href="/login" className="text-terminal hover:text-terminal/80 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </>
        )}
      </GlowCard>

      {/* Terminal decoration */}
      <div className="mt-6 text-center">
        <p className="font-mono text-xs text-terminal-dim terminal-flicker">
          {">"} {isSubmitted ? "email.sent" : "recovery.mode"} <span className="cursor-blink">_</span>
        </p>
      </div>
    </AuthLayout>
  )
}
