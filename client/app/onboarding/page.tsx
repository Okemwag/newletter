"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

// Entry page redirects to appropriate onboarding step
// Account creation happens at /register, then redirects here
export default function OnboardingPage() {
    const router = useRouter()

    useEffect(() => {
        // TODO: Check onboarding status from API and redirect to appropriate step
        // For now, redirect to email verification (step 2)
        router.replace("/onboarding/verify-email")
    }, [router])

    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-pulse text-muted-foreground">
                Loading...
            </div>
        </div>
    )
}
