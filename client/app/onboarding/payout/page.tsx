"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Icon } from "@iconify/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GlowCard } from "@/components/ui/glow-card"

export default function PayoutStep() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [phone, setPhone] = useState("")
    const [verificationSent, setVerificationSent] = useState(false)
    const [code, setCode] = useState("")
    const [error, setError] = useState("")

    const formatPhone = (value: string) => {
        // Remove all non-digits
        const digits = value.replace(/\D/g, "")

        // Handle different formats
        if (digits.startsWith("254")) {
            return digits.slice(0, 12)
        } else if (digits.startsWith("0")) {
            return "254" + digits.slice(1, 10)
        } else if (digits.startsWith("7") || digits.startsWith("1")) {
            return "254" + digits.slice(0, 9)
        }
        return digits.slice(0, 12)
    }

    const displayPhone = (value: string) => {
        if (!value) return ""
        const formatted = formatPhone(value)
        if (formatted.length < 4) return formatted
        return `+${formatted.slice(0, 3)} ${formatted.slice(3, 6)} ${formatted.slice(6)}`
    }

    const handleSendCode = async () => {
        const formatted = formatPhone(phone)
        if (formatted.length !== 12) {
            setError("Please enter a valid Kenya phone number")
            return
        }

        setIsLoading(true)
        setError("")

        try {
            // TODO: Call API
            await new Promise((resolve) => setTimeout(resolve, 1000))
            setVerificationSent(true)
        } catch (error) {
            setError("Failed to send verification code")
        } finally {
            setIsLoading(false)
        }
    }

    const handleVerify = async () => {
        if (code.length !== 6) {
            setError("Please enter the 6-digit code")
            return
        }

        setIsLoading(true)
        setError("")

        try {
            // TODO: Call API
            await new Promise((resolve) => setTimeout(resolve, 1000))
            router.push("/onboarding/kyc")
        } catch (error) {
            setError("Invalid code. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="animate-fade-up">
            <div className="text-center mb-8">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 mb-4">
                    <Icon icon="lucide:wallet" className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                    Set up your payout method
                </h1>
                <p className="text-muted-foreground">
                    {verificationSent
                        ? "Enter the code sent to your phone"
                        : "Add your M-Pesa number to receive payments"}
                </p>
            </div>

            <GlowCard className="p-6 sm:p-8">
                <div className="space-y-6">
                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {!verificationSent ? (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="phone">M-Pesa Phone Number</Label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                        <span className="text-lg">🇰🇪</span>
                                    </div>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="0712 345 678"
                                        value={displayPhone(phone)}
                                        onChange={(e) => setPhone(formatPhone(e.target.value))}
                                        className="pl-12 text-lg h-12"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    This is where we&apos;ll send your earnings
                                </p>
                            </div>

                            {/* M-Pesa Info */}
                            <div className="p-4 rounded-lg border border-border/50 bg-green-500/5">
                                <div className="flex items-start gap-3">
                                    <Icon icon="simple-icons:mpesa" className="h-6 w-6 text-green-500 flex-shrink-0" />
                                    <div className="text-sm">
                                        <p className="font-medium text-foreground mb-1">M-Pesa Payouts</p>
                                        <p className="text-muted-foreground">
                                            Funds are sent directly to your M-Pesa account.
                                            Processing takes 1-2 business days.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                    className="flex-1"
                                >
                                    <Icon icon="lucide:arrow-left" className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                                <Button
                                    onClick={handleSendCode}
                                    disabled={isLoading || phone.length < 9}
                                    className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0"
                                >
                                    {isLoading ? (
                                        <Icon icon="lucide:loader-2" className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <>
                                            Send Code
                                            <Icon icon="lucide:arrow-right" className="h-5 w-5 ml-2" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="text-center p-4 rounded-lg bg-muted/30 mb-4">
                                <p className="text-sm text-muted-foreground">Code sent to</p>
                                <p className="text-lg font-medium">{displayPhone(phone)}</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="code">Verification Code</Label>
                                <Input
                                    id="code"
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    placeholder="Enter 6-digit code"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    className="text-center text-2xl font-mono tracking-widest h-14"
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setVerificationSent(false)}
                                    className="flex-1"
                                >
                                    <Icon icon="lucide:arrow-left" className="h-4 w-4 mr-2" />
                                    Change Number
                                </Button>
                                <Button
                                    onClick={handleVerify}
                                    disabled={isLoading || code.length !== 6}
                                    className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0"
                                >
                                    {isLoading ? (
                                        <Icon icon="lucide:loader-2" className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <>
                                            Verify
                                            <Icon icon="lucide:check" className="h-5 w-5 ml-2" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </GlowCard>
        </div>
    )
}
