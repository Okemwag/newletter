"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Icon } from "@iconify/react"
import { Button } from "@/components/ui/button"
import { GlowCard } from "@/components/ui/glow-card"

export default function ActivateStep() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    // Mock status - would come from API
    const checklist = [
        { id: "email", label: "Email verified", completed: true },
        { id: "profile", label: "Newsletter profile set", completed: true },
        { id: "pricing", label: "Subscription pricing configured", completed: true },
        { id: "payout", label: "M-Pesa payout verified", completed: true },
        { id: "kyc", label: "Identity verified", completed: true },
    ]

    const allCompleted = checklist.every((item) => item.completed)

    const handleActivate = async () => {
        setIsLoading(true)

        try {
            // TODO: Call API
            await new Promise((resolve) => setTimeout(resolve, 1500))
            router.push("/onboarding/success")
        } catch (error) {
            // Handle error
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="animate-fade-up">
            <div className="text-center mb-8">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 mb-4">
                    <Icon icon="lucide:rocket" className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                    Ready to go live!
                </h1>
                <p className="text-muted-foreground">
                    Review your setup and start accepting payments
                </p>
            </div>

            <GlowCard className="p-6 sm:p-8">
                <div className="space-y-6">
                    {/* Checklist */}
                    <div className="space-y-3">
                        {checklist.map((item) => (
                            <div
                                key={item.id}
                                className={`flex items-center gap-3 p-3 rounded-lg border ${item.completed
                                        ? "border-green-500/30 bg-green-500/5"
                                        : "border-border bg-muted/20"
                                    }`}
                            >
                                <div className={`flex h-6 w-6 items-center justify-center rounded-full ${item.completed
                                        ? "bg-green-500 text-white"
                                        : "bg-muted text-muted-foreground"
                                    }`}>
                                    {item.completed ? (
                                        <Icon icon="lucide:check" className="h-4 w-4" />
                                    ) : (
                                        <Icon icon="lucide:circle" className="h-4 w-4" />
                                    )}
                                </div>
                                <span className={item.completed ? "text-foreground" : "text-muted-foreground"}>
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20">
                        <h3 className="font-medium mb-2 flex items-center gap-2">
                            <Icon icon="lucide:sparkles" className="h-4 w-4 text-cyan-400" />
                            What happens next
                        </h3>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Your newsletter page will be live</li>
                            <li>• You can share your subscribe link</li>
                            <li>• Start receiving payments immediately</li>
                            <li>• First payout available after 7 days</li>
                        </ul>
                    </div>

                    <Button
                        onClick={handleActivate}
                        disabled={isLoading || !allCompleted}
                        className="w-full h-14 text-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <Icon icon="lucide:loader-2" className="h-5 w-5 animate-spin" />
                                Activating...
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Icon icon="lucide:rocket" className="h-5 w-5" />
                                Start Accepting Payments
                            </div>
                        )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                        By activating, you agree to our Creator Terms and Payout Policy
                    </p>
                </div>
            </GlowCard>
        </div>
    )
}
