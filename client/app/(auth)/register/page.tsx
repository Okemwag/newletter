"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { GlowCard } from "@/components/ui/glow-card"
import { AuthLayout } from "@/components/layout/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TerminalText } from "@/components/ui/terminal-text"
import { Loader2, Mail, Lock, ArrowRight, Check, Globe } from "lucide-react"
import { authApi, setTokens } from "@/lib/api"

// Country list for East/West Africa
const countries = [
  { code: "KE", name: "Kenya" },
  { code: "UG", name: "Uganda" },
  { code: "TZ", name: "Tanzania" },
  { code: "RW", name: "Rwanda" },
  { code: "NG", name: "Nigeria" },
  { code: "GH", name: "Ghana" },
  { code: "ZA", name: "South Africa" },
  { code: "ET", name: "Ethiopia" },
]

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [country, setCountry] = useState("KE") // Default to Kenya
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  // Preselect country via IP (simplified - would use IP geolocation API)
  useEffect(() => {
    // In production, call an IP geolocation API like:
    // fetch('https://ipapi.co/json/').then(r => r.json()).then(d => setCountry(d.country_code))
    // For now, default to Kenya
    setCountry("KE")
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!firstName || !lastName) {
      setError("Please enter your first and last name")
      return
    }

    if (!agreeTerms) {
      setError("You must agree to the terms to continue")
      return
    }

    setIsLoading(true)

    try {
      const response = await authApi.register({ email, password, firstName, lastName, country })

      // Store tokens
      setTokens(response.data.access_token, response.data.refresh_token)

      // Redirect to onboarding flow (email verification step)
      router.push("/onboarding/verify-email")
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setError(axiosErr.response?.data?.error || "Failed to create account. Please try again.")
      setIsLoading(false)
    }
  }

  const passwordRequirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains a number", met: /\d/.test(password) },
  ]

  const allPasswordMet = passwordRequirements.every((r) => r.met)

  return (
    <AuthLayout>
      <GlowCard className="p-8">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center primary-glow">
            <span className="font-mono font-bold text-white text-xl">P</span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2">Start earning from your newsletter</h1>
          <p className="text-muted-foreground text-sm">
            <TerminalText>{">"}</TerminalText> Create your account in under 2 minutes
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm text-foreground">
                First Name
              </Label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="bg-input border-border focus:border-cyan-500 focus:ring-cyan-500/20"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm text-foreground">
                Last Name
              </Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="bg-input border-border focus:border-cyan-500 focus:ring-cyan-500/20"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm text-foreground">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-input border-border focus:border-cyan-500 focus:ring-cyan-500/20"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm text-foreground">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-input border-border focus:border-cyan-500 focus:ring-cyan-500/20"
                required
              />
            </div>
            {password && (
              <div className="mt-3 space-y-1.5">
                {passwordRequirements.map((req, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${req.met ? "bg-green-500/20 text-green-400" : "bg-muted text-muted-foreground"
                        }`}
                    >
                      {req.met && <Check className="w-3 h-3" />}
                    </div>
                    <span className={req.met ? "text-green-400" : "text-muted-foreground"}>{req.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label htmlFor="country" className="text-sm text-foreground">
              Country
            </Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <select
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-md border border-border bg-input text-sm focus:border-cyan-500 focus:ring-cyan-500/20 focus:outline-none appearance-none"
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="agreeTerms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border bg-input text-cyan-500 focus:ring-cyan-500/20"
            />
            <label htmlFor="agreeTerms" className="text-sm text-muted-foreground">
              I agree to the{" "}
              <Link href="/terms" className="text-cyan-400 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-cyan-400 hover:underline">
                Privacy Policy
              </Link>
            </label>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:opacity-90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            disabled={isLoading || !email || !allPasswordMet || !agreeTerms}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Create account
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </GlowCard>

      {/* Terminal decoration */}
      <div className="mt-6 text-center">
        <p className="font-mono text-xs text-muted-foreground/50">
          {">"} Secure signup with email verification
        </p>
      </div>
    </AuthLayout>
  )
}

