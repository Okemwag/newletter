"use client"

import { useState } from "react"
import { Icon } from "@iconify/react"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { AppLayout } from "@/components/layout/app-layout"
import { GlowCard } from "@/components/ui/glow-card"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar
} from "recharts"

// Mock data - replace with API calls
const subscriberGrowthData = [
    { date: "Jan", subscribers: 8500, opens: 3740, clicks: 1020 },
    { date: "Feb", subscribers: 9200, opens: 4048, clicks: 1104 },
    { date: "Mar", subscribers: 9800, opens: 4312, clicks: 1176 },
    { date: "Apr", subscribers: 10400, opens: 4576, clicks: 1248 },
    { date: "May", subscribers: 11200, opens: 4928, clicks: 1344 },
    { date: "Jun", subscribers: 12486, opens: 5494, clicks: 1548 },
]

const campaignPerformanceData = [
    {
        id: "1",
        name: "Weekly Digest #47",
        sent_at: "Dec 21, 2024",
        recipients: 12486,
        opens: 5344,
        open_rate: 42.8,
        clicks: 1548,
        click_rate: 12.4,
        unsubscribes: 12
    },
    {
        id: "2",
        name: "Product Update",
        sent_at: "Dec 14, 2024",
        recipients: 12234,
        opens: 5382,
        open_rate: 44.0,
        clicks: 1834,
        click_rate: 15.0,
        unsubscribes: 8
    },
    {
        id: "3",
        name: "Weekly Digest #46",
        sent_at: "Dec 7, 2024",
        recipients: 11986,
        opens: 4914,
        open_rate: 41.0,
        clicks: 1318,
        click_rate: 11.0,
        unsubscribes: 15
    },
    {
        id: "4",
        name: "Black Friday Special",
        sent_at: "Nov 29, 2024",
        recipients: 11742,
        opens: 5871,
        open_rate: 50.0,
        clicks: 2818,
        click_rate: 24.0,
        unsubscribes: 24
    },
]

export default function AnalyticsPage() {
    const [dateRange, setDateRange] = useState("30d")

    const stats = [
        {
            label: "Total Subscribers",
            value: "12,486",
            change: "+12.4%",
            trend: "up",
            icon: "lucide:users",
            color: "cyan"
        },
        {
            label: "Emails Sent",
            value: "48,234",
            change: "+8.2%",
            trend: "up",
            icon: "lucide:mail",
            color: "purple"
        },
        {
            label: "Avg. Open Rate",
            value: "42.8%",
            change: "+2.1%",
            trend: "up",
            icon: "lucide:eye",
            color: "green"
        },
        {
            label: "Avg. Click Rate",
            value: "12.4%",
            change: "-0.8%",
            trend: "down",
            icon: "lucide:mouse-pointer-click",
            color: "pink"
        },
        {
            label: "Revenue",
            value: "$12,480",
            change: "+18.2%",
            trend: "up",
            icon: "lucide:dollar-sign",
            color: "yellow"
        },
        {
            label: "Unsubscribes",
            value: "59",
            change: "-24%",
            trend: "up",
            icon: "lucide:user-minus",
            color: "red"
        },
    ]

    return (
        <AppLayout>
            <div className="p-4 sm:p-6 lg:p-8 animate-fade-up">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-semibold">Analytics</h1>
                        <p className="text-muted-foreground text-sm">
                            Track your newsletter performance and growth
                        </p>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <Select value={dateRange} onValueChange={setDateRange}>
                            <SelectTrigger className="w-32 sm:w-40">
                                <SelectValue placeholder="Select range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7d">Last 7 days</SelectItem>
                                <SelectItem value="30d">Last 30 days</SelectItem>
                                <SelectItem value="90d">Last 90 days</SelectItem>
                                <SelectItem value="1y">Last year</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" className="sm:size-default">
                            <Icon icon="lucide:download" className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Export</span>
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 mb-6 sm:mb-8">
                    {stats.map((stat) => (
                        <GlowCard key={stat.label} className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <Icon
                                    icon={stat.icon}
                                    className={`h-5 w-5 text-${stat.color}-400`}
                                />
                                <span className={`text-xs font-medium ${stat.trend === "up" && stat.label !== "Unsubscribes"
                                    ? "text-green-400"
                                    : stat.trend === "down" && stat.label === "Unsubscribes"
                                        ? "text-green-400"
                                        : "text-red-400"
                                    }`}>
                                    {stat.change}
                                </span>
                            </div>
                            <p className="text-2xl font-bold">{stat.value}</p>
                            <p className="text-xs text-muted-foreground">{stat.label}</p>
                        </GlowCard>
                    ))}
                </div>

                {/* Charts */}
                <div className="grid gap-6 lg:grid-cols-2 mb-8">
                    {/* Subscriber Growth */}
                    <GlowCard className="p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Icon icon="lucide:trending-up" className="h-4 w-4 text-cyan-400" />
                            Subscriber Growth
                        </h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={subscriberGrowthData}>
                                    <defs>
                                        <linearGradient id="subscriberGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis dataKey="date" stroke="#666" fontSize={12} />
                                    <YAxis stroke="#666" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#1a1a1a",
                                            border: "1px solid #333",
                                            borderRadius: "8px"
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="subscribers"
                                        stroke="#06b6d4"
                                        fill="url(#subscriberGradient)"
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </GlowCard>

                    {/* Engagement Rates */}
                    <GlowCard className="p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Icon icon="lucide:activity" className="h-4 w-4 text-purple-400" />
                            Engagement Over Time
                        </h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={subscriberGrowthData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis dataKey="date" stroke="#666" fontSize={12} />
                                    <YAxis stroke="#666" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#1a1a1a",
                                            border: "1px solid #333",
                                            borderRadius: "8px"
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="opens"
                                        stroke="#06b6d4"
                                        strokeWidth={2}
                                        dot={false}
                                        name="Opens"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="clicks"
                                        stroke="#a855f7"
                                        strokeWidth={2}
                                        dot={false}
                                        name="Clicks"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </GlowCard>
                </div>

                {/* Campaign Performance Table */}
                <GlowCard className="overflow-hidden">
                    <div className="p-6 border-b border-border">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Icon icon="lucide:bar-chart-3" className="h-4 w-4 text-green-400" />
                            Campaign Performance
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-muted/30">
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Campaign
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Sent
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Recipients
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Opens
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Clicks
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Unsubs
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {campaignPerformanceData.map((campaign) => (
                                    <tr key={campaign.id} className="hover:bg-muted/20 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="font-medium">{campaign.name}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                            {campaign.sent_at}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {campaign.recipients.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm">{campaign.opens.toLocaleString()}</span>
                                                <span className="text-xs text-cyan-400">({campaign.open_rate}%)</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm">{campaign.clicks.toLocaleString()}</span>
                                                <span className="text-xs text-purple-400">({campaign.click_rate}%)</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                            {campaign.unsubscribes}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </GlowCard>
            </div>
        </AppLayout>
    )
}
