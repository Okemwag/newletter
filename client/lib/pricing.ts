// Shared pricing plans configuration
// Used by both landing page and billing page

export interface PricingPlan {
    id: string
    name: string
    price: number
    interval: "month" | "year"
    description: string
    features: string[]
    limitations?: string[]
    popular?: boolean
    cta: string
}

export const pricingPlans: PricingPlan[] = [
    {
        id: "free",
        name: "Free",
        price: 0,
        interval: "month",
        description: "Perfect for getting started",
        features: [
            "Up to 500 subscribers",
            "1,000 emails/month",
            "Basic analytics",
            "Email support",
        ],
        limitations: [
            "No custom domain",
            "Pulse branding",
            "Limited templates",
        ],
        cta: "Start free",
    },
    {
        id: "creator",
        name: "Creator",
        price: 15,
        interval: "month",
        description: "For growing newsletters",
        features: [
            "Up to 5,000 subscribers",
            "Unlimited emails",
            "Advanced analytics",
            "AI writing assistant",
            "Custom domain",
            "No Pulse branding",
            "Priority support",
        ],
        popular: true,
        cta: "Get started",
    },
    {
        id: "pro",
        name: "Pro",
        price: 49,
        interval: "month",
        description: "For serious creators",
        features: [
            "Up to 25,000 subscribers",
            "Unlimited emails",
            "Full analytics suite",
            "AI writing + optimization",
            "Custom domain",
            "Referral program access",
            "API access",
            "Dedicated support",
        ],
        cta: "Go Pro",
    },
    {
        id: "business",
        name: "Business",
        price: 149,
        interval: "month",
        description: "For teams and businesses",
        features: [
            "Unlimited subscribers",
            "Unlimited emails",
            "White-label solution",
            "Team collaboration",
            "Advanced automation",
            "SLA guarantee",
            "Custom integrations",
            "Account manager",
        ],
        cta: "Contact sales",
    },
]

// Helper to calculate annual price (20% discount)
export const getAnnualPrice = (monthlyPrice: number): number => {
    return Math.round(monthlyPrice * 0.8)
}

export const getAnnualTotal = (monthlyPrice: number): number => {
    return getAnnualPrice(monthlyPrice) * 12
}
