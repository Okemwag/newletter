"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Icon } from "@iconify/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GlowCard } from "@/components/ui/glow-card"

export default function ProfileStep() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        newsletterName: "",
        newsletterDesc: "",
        senderName: "",
        senderEmail: "",
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.newsletterName) {
            newErrors.newsletterName = "Newsletter name is required"
        } else if (formData.newsletterName.length < 3) {
            newErrors.newsletterName = "Name must be at least 3 characters"
        }

        if (!formData.senderName) {
            newErrors.senderName = "Sender name is required"
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
            router.push("/onboarding/pricing")
        } catch (error) {
            setErrors({ form: "Failed to save profile" })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="animate-fade-up">
            <div className="text-center mb-8">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
                    <Icon icon="lucide:newspaper" className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                    Set up your newsletter
                </h1>
                <p className="text-muted-foreground">
                    Tell your readers what your newsletter is about
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
                        <Label htmlFor="newsletterName">Newsletter Name *</Label>
                        <Input
                            id="newsletterName"
                            placeholder="e.g., The Tech Weekly"
                            value={formData.newsletterName}
                            onChange={(e) => setFormData({ ...formData, newsletterName: e.target.value })}
                            className={errors.newsletterName ? "border-red-500" : ""}
                        />
                        {errors.newsletterName && (
                            <p className="text-xs text-red-400">{errors.newsletterName}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            This will be displayed to your subscribers
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="newsletterDesc">Description (Optional)</Label>
                        <textarea
                            id="newsletterDesc"
                            placeholder="Weekly insights on tech, startups, and innovation..."
                            value={formData.newsletterDesc}
                            onChange={(e) => setFormData({ ...formData, newsletterDesc: e.target.value })}
                            className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                            maxLength={1000}
                        />
                        <p className="text-xs text-muted-foreground text-right">
                            {formData.newsletterDesc.length}/1000
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="senderName">Sender Name *</Label>
                        <Input
                            id="senderName"
                            placeholder="e.g., John from The Tech Weekly"
                            value={formData.senderName}
                            onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                            className={errors.senderName ? "border-red-500" : ""}
                        />
                        {errors.senderName && (
                            <p className="text-xs text-red-400">{errors.senderName}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Appears in the &quot;From&quot; field of your emails
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="senderEmail">Sender Email (Optional)</Label>
                        <Input
                            id="senderEmail"
                            type="email"
                            placeholder="Leave blank for auto-generated"
                            value={formData.senderEmail}
                            onChange={(e) => setFormData({ ...formData, senderEmail: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                            We&apos;ll create a @pulse.app email if you leave this blank
                        </p>
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
