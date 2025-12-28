"use client"

import { useState } from "react"
import { Icon } from "@iconify/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AppLayout } from "@/components/layout/app-layout"
import { GlowCard } from "@/components/ui/glow-card"

// Mock data
const leaderboardData = [
    { rank: 1, name: "Sarah Johnson", referrals: 124, conversions: 89, revenue: 2670 },
    { rank: 2, name: "Michael Chen", referrals: 98, conversions: 72, revenue: 2160 },
    { rank: 3, name: "Emma Williams", referrals: 87, conversions: 64, revenue: 1920 },
    { rank: 4, name: "James Brown", referrals: 76, conversions: 58, revenue: 1740 },
    { rank: 5, name: "Olivia Davis", referrals: 65, conversions: 49, revenue: 1470 },
    { rank: 6, name: "David Wilson", referrals: 54, conversions: 41, revenue: 1230 },
    { rank: 7, name: "Sophie Taylor", referrals: 48, conversions: 36, revenue: 1080 },
    { rank: 8, name: "Daniel Martinez", referrals: 42, conversions: 32, revenue: 960 },
]

const rewardsData = [
    { milestone: 5, reward: "Free month", claimed: true },
    { milestone: 10, reward: "$20 credit", claimed: true },
    { milestone: 25, reward: "Premium badge", claimed: false },
    { milestone: 50, reward: "$100 credit", claimed: false },
    { milestone: 100, reward: "Lifetime discount", claimed: false },
]

export default function ReferralsPage() {
    const [copied, setCopied] = useState(false)
    const referralCode = "PULSE-ABC123"
    const referralLink = `https://pulse.app/r/${referralCode}`

    const userStats = {
        totalReferrals: 23,
        conversions: 18,
        revenue: 540,
        rank: 12,
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <AppLayout>
            <div className="p-4 sm:p-6 lg:p-8 animate-fade-up">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-semibold">Referral Program</h1>
                    <p className="text-muted-foreground text-sm">
                        Invite friends and earn rewards for every signup
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
                    <GlowCard className="p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-2">
                            <Icon icon="lucide:share-2" className="h-5 w-5 text-cyan-400" />
                            <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full">
                                Active
                            </span>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold">{userStats.totalReferrals}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Total Referrals</p>
                    </GlowCard>

                    <GlowCard className="p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-2">
                            <Icon icon="lucide:user-check" className="h-5 w-5 text-green-400" />
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold">{userStats.conversions}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Conversions</p>
                    </GlowCard>

                    <GlowCard className="p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-2">
                            <Icon icon="lucide:dollar-sign" className="h-5 w-5 text-yellow-400" />
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold">${userStats.revenue}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Revenue Earned</p>
                    </GlowCard>

                    <GlowCard className="p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-2">
                            <Icon icon="lucide:trophy" className="h-5 w-5 text-purple-400" />
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold">#{userStats.rank}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Leaderboard Rank</p>
                    </GlowCard>
                </div>

                <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
                    {/* Share Section */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Referral Link */}
                        <GlowCard className="p-6">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <Icon icon="lucide:link" className="h-4 w-4 text-cyan-400" />
                                Your Referral Link
                            </h3>
                            <div className="flex gap-2">
                                <Input
                                    value={referralLink}
                                    readOnly
                                    className="font-mono text-sm"
                                />
                                <Button
                                    onClick={() => copyToClipboard(referralLink)}
                                    variant="outline"
                                >
                                    <Icon
                                        icon={copied ? "lucide:check" : "lucide:copy"}
                                        className="h-4 w-4"
                                    />
                                </Button>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(`https://twitter.com/intent/tweet?text=Check%20out%20Pulse%20newsletter%20platform!&url=${encodeURIComponent(referralLink)}`, '_blank')}
                                >
                                    <Icon icon="lucide:twitter" className="h-4 w-4 mr-2" />
                                    Share on X
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(`https://www.linkedin.com/shareArticle?url=${encodeURIComponent(referralLink)}`, '_blank')}
                                >
                                    <Icon icon="lucide:linkedin" className="h-4 w-4 mr-2" />
                                    LinkedIn
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(`mailto:?subject=Check out Pulse&body=${encodeURIComponent(referralLink)}`, '_blank')}
                                >
                                    <Icon icon="lucide:mail" className="h-4 w-4 mr-2" />
                                    Email
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Check out Pulse newsletter platform! ${referralLink}`)}`, '_blank')}
                                >
                                    <Icon icon="lucide:message-circle" className="h-4 w-4 mr-2" />
                                    WhatsApp
                                </Button>
                            </div>
                        </GlowCard>

                        {/* Leaderboard */}
                        <GlowCard className="overflow-hidden">
                            <div className="p-6 border-b border-border">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Icon icon="lucide:trophy" className="h-4 w-4 text-yellow-400" />
                                    Top Referrers This Month
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/30">
                                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                Rank
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                Referrals
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                Conversions
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                Revenue
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {leaderboardData.map((user) => (
                                            <tr key={user.rank} className="hover:bg-muted/20 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className={`flex items-center justify-center h-8 w-8 rounded-full font-bold text-sm ${user.rank === 1 ? "bg-yellow-500/20 text-yellow-400" :
                                                        user.rank === 2 ? "bg-gray-400/20 text-gray-400" :
                                                            user.rank === 3 ? "bg-amber-600/20 text-amber-600" :
                                                                "bg-muted text-muted-foreground"
                                                        }`}>
                                                        {user.rank}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap font-medium">
                                                    {user.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {user.referrals}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-cyan-400">
                                                    {user.conversions}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">
                                                    ${user.revenue}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </GlowCard>
                    </div>

                    {/* Rewards Sidebar */}
                    <div className="space-y-6">
                        {/* How it works */}
                        <GlowCard className="p-6 bg-gradient-to-br from-cyan-500/5 to-purple-500/5">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <Icon icon="lucide:info" className="h-4 w-4 text-cyan-400" />
                                How It Works
                            </h3>
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-sm flex-shrink-0">
                                        1
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">Share your link</p>
                                        <p className="text-xs text-muted-foreground">Send to friends, share on social media</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/20 text-purple-400 font-bold text-sm flex-shrink-0">
                                        2
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">They sign up</p>
                                        <p className="text-xs text-muted-foreground">Friends create a Pulse account</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20 text-green-400 font-bold text-sm flex-shrink-0">
                                        3
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">Earn rewards</p>
                                        <p className="text-xs text-muted-foreground">Get credits for each conversion</p>
                                    </div>
                                </div>
                            </div>
                        </GlowCard>

                        {/* Reward Milestones */}
                        <GlowCard className="p-6">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <Icon icon="lucide:gift" className="h-4 w-4 text-pink-400" />
                                Reward Milestones
                            </h3>
                            <div className="space-y-3">
                                {rewardsData.map((reward) => (
                                    <div
                                        key={reward.milestone}
                                        className={`flex items-center justify-between p-3 rounded-lg border ${reward.claimed
                                            ? "border-green-500/30 bg-green-500/5"
                                            : userStats.totalReferrals >= reward.milestone
                                                ? "border-yellow-500/30 bg-yellow-500/5"
                                                : "border-border"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${reward.claimed
                                                ? "bg-green-500/20 text-green-400"
                                                : "bg-muted text-muted-foreground"
                                                }`}>
                                                {reward.milestone}
                                            </div>
                                            <span className="text-sm">{reward.reward}</span>
                                        </div>
                                        {reward.claimed ? (
                                            <Icon icon="lucide:check-circle" className="h-5 w-5 text-green-400" />
                                        ) : userStats.totalReferrals >= reward.milestone ? (
                                            <Button size="sm" variant="outline" className="text-xs">
                                                Claim
                                            </Button>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">
                                                {reward.milestone - userStats.totalReferrals} more
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </GlowCard>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
