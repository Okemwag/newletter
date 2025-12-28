"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Icon } from "@iconify/react"
import { Button } from "@/components/ui/button"
import { GlowCard } from "@/components/ui/glow-card"
import confetti from "canvas-confetti"

export default function SuccessStep() {
    const router = useRouter()
    const [copied, setCopied] = useState(false)

    // Mock data - would come from API
    const newsletterLink = "https://pulse.app/n/your-newsletter"

    useEffect(() => {
        // Celebration confetti
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
        })
    }, [])

    const copyLink = () => {
        navigator.clipboard.writeText(newsletterLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const shareLinks = [
        {
            name: "X (Twitter)",
            icon: "lucide:twitter",
            url: `https://twitter.com/intent/tweet?text=I just launched my newsletter on Pulse! Subscribe here:&url=${encodeURIComponent(newsletterLink)}`,
        },
        {
            name: "WhatsApp",
            icon: "lucide:message-circle",
            url: `https://wa.me/?text=${encodeURIComponent(`Check out my new newsletter! ${newsletterLink}`)}`,
        },
        {
            name: "LinkedIn",
            icon: "lucide:linkedin",
            url: `https://www.linkedin.com/shareArticle?url=${encodeURIComponent(newsletterLink)}`,
        },
    ]

    return (
        <div className="animate-fade-up">
            <div className="text-center mb-8">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 mb-4">
                    <Icon icon="lucide:party-popper" className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                    🎉 You&apos;re all set!
                </h1>
                <p className="text-muted-foreground">
                    Your newsletter is live and ready to accept subscribers
                </p>
            </div>

            <GlowCard className="p-6 sm:p-8 mb-6">
                <div className="space-y-6">
                    {/* Share Link */}
                    <div className="space-y-3">
                        <h3 className="font-medium flex items-center gap-2">
                            <Icon icon="lucide:link" className="h-4 w-4 text-cyan-400" />
                            Your Newsletter Link
                        </h3>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newsletterLink}
                                readOnly
                                className="flex-1 px-3 py-2 rounded-lg border border-border bg-muted/30 text-sm font-mono"
                            />
                            <Button variant="outline" onClick={copyLink}>
                                <Icon icon={copied ? "lucide:check" : "lucide:copy"} className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Share Buttons */}
                    <div className="space-y-3">
                        <h3 className="font-medium">Share with your audience</h3>
                        <div className="flex flex-wrap gap-2">
                            {shareLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-muted/30 hover:bg-muted transition-colors text-sm"
                                >
                                    <Icon icon={link.icon} className="h-4 w-4" />
                                    {link.name}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </GlowCard>

            {/* Important Info */}
            <GlowCard className="p-6 sm:p-8 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                    <Icon icon="lucide:info" className="h-5 w-5 text-amber-400" />
                    How Payouts Work
                </h3>
                <div className="space-y-4 text-sm text-muted-foreground">
                    <div className="flex items-start gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex-shrink-0">
                            1
                        </div>
                        <div>
                            <p className="font-medium text-foreground">7-Day Hold Period</p>
                            <p>Your first payout is available 7 days after your first earning</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex-shrink-0">
                            2
                        </div>
                        <div>
                            <p className="font-medium text-foreground">Weekly Payout Limits</p>
                            <p>Week 1-2: KES 20,000 max • Week 3-4: KES 50,000 max</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex-shrink-0">
                            3
                        </div>
                        <div>
                            <p className="font-medium text-foreground">M-Pesa Processing</p>
                            <p>Payouts are sent to your registered M-Pesa within 1-2 business days</p>
                        </div>
                    </div>
                </div>
            </GlowCard>

            <div className="mt-8 flex gap-3">
                <Button asChild variant="outline" className="flex-1">
                    <Link href="/billing">
                        <Icon icon="lucide:wallet" className="h-4 w-4 mr-2" />
                        View Earnings
                    </Link>
                </Button>
                <Button asChild className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0">
                    <Link href="/dashboard">
                        <Icon icon="lucide:layout-dashboard" className="h-4 w-4 mr-2" />
                        Go to Dashboard
                    </Link>
                </Button>
            </div>
        </div>
    )
}
