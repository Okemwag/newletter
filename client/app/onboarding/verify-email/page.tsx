"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Icon } from "@iconify/react"
import { Button } from "@/components/ui/button"
import { GlowCard } from "@/components/ui/glow-card"

export default function VerifyEmailStep() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [code, setCode] = useState(["", "", "", "", "", ""])
    const [error, setError] = useState("")
    const [resendCooldown, setResendCooldown] = useState(0)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    useEffect(() => {
        // Focus first input on mount
        inputRefs.current[0]?.focus()
    }, [])

    useEffect(() => {
        // Countdown for resend button
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [resendCooldown])

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return // Only digits

        const newCode = [...code]
        newCode[index] = value.slice(-1) // Only last character
        setCode(newCode)
        setError("")

        // Auto-advance to next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData("text").slice(0, 6)
        if (!/^\d+$/.test(pastedData)) return

        const newCode = [...code]
        pastedData.split("").forEach((char, i) => {
            if (i < 6) newCode[i] = char
        })
        setCode(newCode)
        inputRefs.current[Math.min(pastedData.length, 5)]?.focus()
    }

    const handleSubmit = async () => {
        const fullCode = code.join("")
        if (fullCode.length !== 6) {
            setError("Please enter the full 6-digit code")
            return
        }

        setIsLoading(true)
        setError("")

        try {
            // TODO: Call API
            // await api.post('/onboarding/verify-email', { code: fullCode })

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000))

            router.push("/onboarding/profile")
        } catch (error) {
            setError("Invalid code. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleResend = async () => {
        if (resendCooldown > 0) return

        try {
            // TODO: Call API
            // await api.post('/onboarding/resend-verification')

            setResendCooldown(60)
        } catch (error) {
            setError("Failed to resend code")
        }
    }

    return (
        <div className="animate-fade-up">
            <div className="text-center mb-8">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 mb-4">
                    <Icon icon="lucide:mail-check" className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                    Verify your email
                </h1>
                <p className="text-muted-foreground">
                    We sent a 6-digit code to your email address
                </p>
            </div>

            <GlowCard className="p-6 sm:p-8">
                <div className="space-y-6">
                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* OTP Input */}
                    <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-xl border-2 bg-background transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${error
                                        ? "border-red-500"
                                        : digit
                                            ? "border-cyan-500 bg-cyan-500/5"
                                            : "border-border hover:border-muted-foreground"
                                    }`}
                            />
                        ))}
                    </div>

                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading || code.join("").length !== 6}
                        className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0 h-12 text-base font-medium"
                    >
                        {isLoading ? (
                            <Icon icon="lucide:loader-2" className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                Verify Email
                                <Icon icon="lucide:arrow-right" className="h-5 w-5 ml-2" />
                            </>
                        )}
                    </Button>

                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                            Didn&apos;t receive the code?{" "}
                            <button
                                onClick={handleResend}
                                disabled={resendCooldown > 0}
                                className={`font-medium ${resendCooldown > 0
                                        ? "text-muted-foreground cursor-not-allowed"
                                        : "text-cyan-400 hover:underline"
                                    }`}
                            >
                                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                            </button>
                        </p>
                    </div>
                </div>
            </GlowCard>

            <div className="mt-6 p-4 rounded-lg border border-border/50 bg-muted/20">
                <div className="flex items-start gap-3">
                    <Icon icon="lucide:info" className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                        <p className="font-medium text-foreground mb-1">Check your spam folder</p>
                        <p>If you don&apos;t see the email, it might be in your spam or promotions folder.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
