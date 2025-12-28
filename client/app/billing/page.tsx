"use client"

import { useState } from "react"
import { Icon } from "@iconify/react"
import { Button } from "@/components/ui/button"
import { AppLayout } from "@/components/layout/app-layout"
import { GlowCard } from "@/components/ui/glow-card"
import { pricingPlans, getAnnualPrice, getAnnualTotal } from "@/lib/pricing"

const paymentHistory = [
    { id: "1", date: "Dec 1, 2024", description: "Creator Plan - Monthly", amount: 15, status: "paid" },
    { id: "2", date: "Nov 1, 2024", description: "Creator Plan - Monthly", amount: 15, status: "paid" },
    { id: "3", date: "Oct 1, 2024", description: "Creator Plan - Monthly", amount: 15, status: "paid" },
    { id: "4", date: "Sep 1, 2024", description: "Creator Plan - Monthly", amount: 15, status: "paid" },
    { id: "5", date: "Aug 15, 2024", description: "Free Trial Started", amount: 0, status: "completed" },
]

export default function BillingPage() {
    const [selectedPlan, setSelectedPlan] = useState("creator")
    const [isAnnual, setIsAnnual] = useState(false)

    const currentPlan = {
        name: "Creator",
        status: "active",
        nextBilling: "Jan 1, 2025",
        amount: 15,
    }

    return (
        <AppLayout>
            <div className="p-4 sm:p-6 lg:p-8 animate-fade-up">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-semibold">Billing & Subscription</h1>
                    <p className="text-muted-foreground text-sm">
                        Manage your plan and payment methods
                    </p>
                </div>

                {/* Current Plan */}
                <GlowCard className="p-6 mb-8 bg-gradient-to-br from-cyan-500/5 to-purple-500/5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">Current Plan: {currentPlan.name}</h3>
                                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                                    {currentPlan.status}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Next billing date: <span className="text-foreground">{currentPlan.nextBilling}</span>
                                {" · "}
                                <span className="text-foreground">${currentPlan.amount}/month</span>
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                                <Icon icon="lucide:credit-card" className="h-4 w-4 mr-2" />
                                Update Payment
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-400 hover:text-red-300">
                                Cancel Plan
                            </Button>
                        </div>
                    </div>
                </GlowCard>

                {/* Plan Toggle */}
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-4 p-1 bg-muted rounded-lg">
                        <button
                            onClick={() => setIsAnnual(false)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${!isAnnual ? "bg-background shadow-sm" : "text-muted-foreground"
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setIsAnnual(true)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${isAnnual ? "bg-background shadow-sm" : "text-muted-foreground"
                                }`}
                        >
                            Annual <span className="text-green-400 ml-1">Save 20%</span>
                        </button>
                    </div>
                </div>

                {/* Plans Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
                    {pricingPlans.map((plan) => (
                        <GlowCard
                            key={plan.id}
                            className={`p-6 relative ${plan.popular ? "border-cyan-500/50 bg-gradient-to-br from-cyan-500/5 to-purple-500/5" : ""
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <div className="text-center mb-6">
                                <h3 className="font-semibold text-lg mb-1">{plan.name}</h3>
                                <p className="text-xs text-muted-foreground mb-4">{plan.description}</p>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-4xl font-bold">
                                        ${isAnnual ? getAnnualPrice(plan.price) : plan.price}
                                    </span>
                                    <span className="text-muted-foreground">/mo</span>
                                </div>
                                {isAnnual && plan.price > 0 && (
                                    <p className="text-xs text-green-400 mt-1">
                                        ${getAnnualTotal(plan.price)} billed annually
                                    </p>
                                )}
                            </div>

                            <div className="space-y-3 mb-6">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-2 text-sm">
                                        <Icon icon="lucide:check" className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                                {plan.limitations?.map((limitation, i) => (
                                    <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                        <Icon icon="lucide:x" className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                                        <span>{limitation}</span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                className={`w-full ${plan.id === selectedPlan
                                    ? "bg-muted text-foreground hover:bg-muted"
                                    : plan.popular
                                        ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0"
                                        : ""
                                    }`}
                                variant={plan.id === selectedPlan ? "outline" : "default"}
                                disabled={plan.id === selectedPlan}
                            >
                                {plan.id === selectedPlan ? "Current Plan" : plan.price === 0 ? "Downgrade" : "Upgrade"}
                            </Button>
                        </GlowCard>
                    ))}
                </div>

                {/* Payment Methods & History */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Payment Methods */}
                    <GlowCard className="p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Icon icon="lucide:credit-card" className="h-4 w-4 text-cyan-400" />
                            Payment Methods
                        </h3>

                        <div className="space-y-3 mb-4">
                            <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-14 rounded bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center">
                                        <Icon icon="logos:visa" className="h-6" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Visa •••• 4242</p>
                                        <p className="text-xs text-muted-foreground">Expires 12/26</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                                        Default
                                    </span>
                                    <Button variant="ghost" size="sm">
                                        <Icon icon="lucide:pencil" className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <Button variant="outline" className="w-full">
                            <Icon icon="lucide:plus" className="h-4 w-4 mr-2" />
                            Add Payment Method
                        </Button>

                        <div className="mt-6 pt-6 border-t border-border">
                            <h4 className="font-medium text-sm mb-3">Alternative Payment Methods</h4>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                    <Icon icon="logos:paystack" className="h-4 mr-2" />
                                    Paystack
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Icon icon="lucide:smartphone" className="h-4 w-4 mr-2" />
                                    M-Pesa
                                </Button>
                            </div>
                        </div>
                    </GlowCard>

                    {/* Payment History */}
                    <GlowCard className="overflow-hidden">
                        <div className="p-6 border-b border-border">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Icon icon="lucide:history" className="h-4 w-4 text-purple-400" />
                                Payment History
                            </h3>
                        </div>
                        <div className="divide-y divide-border">
                            {paymentHistory.map((payment) => (
                                <div key={payment.id} className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
                                    <div>
                                        <p className="font-medium text-sm">{payment.description}</p>
                                        <p className="text-xs text-muted-foreground">{payment.date}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-sm font-medium ${payment.amount > 0 ? "text-foreground" : "text-muted-foreground"
                                            }`}>
                                            {payment.amount > 0 ? `$${payment.amount}` : "Free"}
                                        </span>
                                        <span className={`text-xs px-2 py-0.5 rounded ${payment.status === "paid"
                                            ? "bg-green-500/20 text-green-400"
                                            : "bg-muted text-muted-foreground"
                                            }`}>
                                            {payment.status}
                                        </span>
                                        <Button variant="ghost" size="sm">
                                            <Icon icon="lucide:download" className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlowCard>
                </div>
            </div>
        </AppLayout>
    )
}
