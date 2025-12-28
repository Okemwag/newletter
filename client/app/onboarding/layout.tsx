"use client"

import Link from "next/link"
import { Icon } from "@iconify/react"

const steps = [
    { id: 1, name: "Verify Email", icon: "lucide:mail-check" },
    { id: 2, name: "Profile", icon: "lucide:newspaper" },
    { id: 3, name: "Pricing", icon: "lucide:tag" },
    { id: 4, name: "Payout", icon: "lucide:wallet" },
    { id: 5, name: "Identity", icon: "lucide:shield-check" },
    { id: 6, name: "Activate", icon: "lucide:rocket" },
]

export default function OnboardingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
                    <Link href="/" className="flex items-center gap-2 group">
                        <Icon icon="lucide:arrow-left" className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-cyan-500 to-purple-500">
                            <Icon icon="lucide:mail" className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-lg font-bold tracking-tight">Pulse</span>
                    </Link>
                    <div className="text-sm text-muted-foreground hidden sm:block">
                        Creator Onboarding
                    </div>
                </div>
            </header>

            {/* Progress Steps */}
            <div className="border-b border-border/30 bg-muted/20 sticky top-16 z-40">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 py-4 overflow-x-auto">
                    <div className="flex items-center justify-between min-w-max">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <div className="flex flex-col items-center">
                                    <div
                                        className="flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 border-border bg-background text-muted-foreground"
                                    >
                                        <Icon icon={step.icon} className="h-5 w-5" />
                                    </div>
                                    <span className="mt-2 text-xs font-medium text-muted-foreground hidden sm:block">
                                        {step.name}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className="h-0.5 w-6 sm:w-12 mx-1 sm:mx-2 bg-border" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content - Scrollable */}
            <main className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 sm:py-12 pb-32">
                    {children}
                </div>
            </main>

            {/* Footer - Fixed */}
            <footer className="border-t border-border/30 bg-background/95 backdrop-blur-xl py-4">
                <div className="mx-auto max-w-2xl px-4 sm:px-6 flex items-center justify-between text-sm text-muted-foreground">
                    <Link href="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
                        <Icon icon="lucide:arrow-left" className="h-4 w-4" />
                        <span className="hidden sm:inline">Back to home</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <a href="#" className="hover:text-foreground transition-colors">Help</a>
                        <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                        <a href="#" className="hover:text-foreground transition-colors">Terms</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
