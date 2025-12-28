"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Icon } from "@iconify/react"
import { Button } from "@/components/ui/button"
import { GlowCard } from "@/components/ui/glow-card"

const PLATFORM_FEE_PERCENT = 10

export default function PricingStep() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [price, setPrice] = useState("")
    const [error, setError] = useState("")

    const priceValue = parseInt(price) || 0
    const platformFee = Math.round(priceValue * PLATFORM_FEE_PERCENT / 100)
    const creatorEarns = priceValue - platformFee

    const validatePrice = () => {
        if (!price) {
            setError("Please enter a price")
            return false
        }
        if (priceValue < 100) {
            setError("Minimum price is KES 100")
            return false
        }
        if (priceValue > 10000) {
            setError("Maximum price is KES 10,000")
            return false
        }
        return true
    }

    const handleSubmit = async () => {
        if (!validatePrice()) return

        setIsLoading(true)
        setError("")

        try {
            // TODO: Call API with price * 100 (cents)
            await new Promise((resolve) => setTimeout(resolve, 1000))
            router.push("/onboarding/payout")
        } catch (error) {
            setError("Failed to save pricing")
        } finally {
            setIsLoading(false)
        }
    }

    const suggestedPrices = [200, 500, 1000, 2000]

    return (
        <div className="animate-fade-up">
            <div className="text-center mb-8">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 mb-4">
                    <Icon icon="lucide:tag" className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                    Set your subscription price
                </h1>
                <p className="text-muted-foreground">
                    How much should subscribers pay monthly?
                </p>
            </div>

            <GlowCard className="p-6 sm:p-8">
                <div className="space-y-6">
                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Price Input */}
                    <div className="text-center">
                        <div className="inline-flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-muted-foreground">KES</span>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => {
                                    setPrice(e.target.value)
                                    setError("")
                                }}
                                placeholder="500"
                                className="w-40 text-5xl sm:text-6xl font-bold text-center bg-transparent border-b-2 border-border focus:border-cyan-500 focus:outline-none transition-colors"
                            />
                            <span className="text-xl text-muted-foreground">/mo</span>
                        </div>
                    </div>

                    {/* Suggested Prices */}
                    <div className="flex flex-wrap justify-center gap-2">
                        {suggestedPrices.map((p) => (
                            <button
                                key={p}
                                onClick={() => setPrice(p.toString())}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${parseInt(price) === p
                                        ? "bg-cyan-500 text-white"
                                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                                    }`}
                            >
                                KES {p}
                            </button>
                        ))}
                    </div>

                    {/* Breakdown */}
                    {priceValue > 0 && (
                        <div className="p-4 rounded-lg bg-muted/30 border border-border/50 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subscriber pays</span>
                                <span className="font-medium">KES {priceValue}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Platform fee ({PLATFORM_FEE_PERCENT}%)
                                </span>
                                <span className="text-amber-400">- KES {platformFee}</span>
                            </div>
                            <div className="border-t border-border pt-3 flex justify-between">
                                <span className="font-medium">You earn</span>
                                <span className="text-lg font-bold text-green-400">
                                    KES {creatorEarns}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Info */}
                    <div className="p-4 rounded-lg border border-border/50 bg-cyan-500/5">
                        <div className="flex items-start gap-3">
                            <Icon icon="lucide:info" className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-muted-foreground">
                                <p>You can change your price anytime. Existing subscribers keep their current rate.</p>
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
                            onClick={handleSubmit}
                            disabled={isLoading || !priceValue}
                            className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0"
                        >
                            {isLoading ? (
                                <Icon icon="lucide:loader-2" className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    Continue
                                    <Icon icon="lucide:arrow-right" className="h-5 w-5 ml-2" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </GlowCard>
        </div>
    )
}
