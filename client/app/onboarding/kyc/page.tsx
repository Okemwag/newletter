"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Icon } from "@iconify/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GlowCard } from "@/components/ui/glow-card"

export default function KYCStep() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        legalName: "",
        phoneNumber: "",
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.legalName) {
            newErrors.legalName = "Legal name is required"
        } else if (formData.legalName.length < 3) {
            newErrors.legalName = "Please enter your full legal name"
        }

        if (!formData.phoneNumber) {
            newErrors.phoneNumber = "Phone number is required"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsLoading(true)

        try {
            // TODO: Call API
            await new Promise((resolve) => setTimeout(resolve, 1000))
            router.push("/onboarding/activate")
        } catch (error) {
            setErrors({ form: "Failed to save information" })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="animate-fade-up">
            <div className="text-center mb-8">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 mb-4">
                    <Icon icon="lucide:shield-check" className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                    Verify your identity
                </h1>
                <p className="text-muted-foreground">
                    Light verification for fraud prevention
                </p>
            </div>

            <GlowCard className="p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {errors.form && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {errors.form}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="legalName">Legal Name (as on ID)</Label>
                        <Input
                            id="legalName"
                            placeholder="John Kamau Mwangi"
                            value={formData.legalName}
                            onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                            className={errors.legalName ? "border-red-500" : ""}
                        />
                        {errors.legalName && (
                            <p className="text-xs text-red-400">{errors.legalName}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Must match your M-Pesa registered name
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Personal Phone Number</Label>
                        <Input
                            id="phoneNumber"
                            type="tel"
                            placeholder="+254 712 345 678"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            className={errors.phoneNumber ? "border-red-500" : ""}
                        />
                        {errors.phoneNumber && (
                            <p className="text-xs text-red-400">{errors.phoneNumber}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            For account recovery and important notifications
                        </p>
                    </div>

                    {/* Info */}
                    <div className="p-4 rounded-lg border border-border/50 bg-blue-500/5">
                        <div className="flex items-start gap-3">
                            <Icon icon="lucide:lock" className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-muted-foreground">
                                <p className="font-medium text-foreground mb-1">Why we need this</p>
                                <p>We collect this information to prevent fraud and comply with financial regulations. Your data is encrypted and secure.</p>
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
                            type="submit"
                            disabled={isLoading}
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
                </form>
            </GlowCard>
        </div>
    )
}
