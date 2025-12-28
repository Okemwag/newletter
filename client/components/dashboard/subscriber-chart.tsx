"use client"

import { GlowCard } from "@/components/ui/glow-card"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"

const data = [
  { month: "Jan", subscribers: 2400, newSubscribers: 240 },
  { month: "Feb", subscribers: 2800, newSubscribers: 400 },
  { month: "Mar", subscribers: 3200, newSubscribers: 400 },
  { month: "Apr", subscribers: 3900, newSubscribers: 700 },
  { month: "May", subscribers: 4600, newSubscribers: 700 },
  { month: "Jun", subscribers: 5400, newSubscribers: 800 },
  { month: "Jul", subscribers: 6100, newSubscribers: 700 },
  { month: "Aug", subscribers: 7200, newSubscribers: 1100 },
  { month: "Sep", subscribers: 8100, newSubscribers: 900 },
  { month: "Oct", subscribers: 9400, newSubscribers: 1300 },
  { month: "Nov", subscribers: 10800, newSubscribers: 1400 },
  { month: "Dec", subscribers: 12400, newSubscribers: 1600 },
]

export function SubscriberChart() {
  return (
    <GlowCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Subscriber Growth</h3>
          <p className="text-sm text-muted-foreground">Total subscribers over time</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-terminal" />
            <span className="text-muted-foreground">Total</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan" />
            <span className="text-muted-foreground">New</span>
          </div>
        </div>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradientSubscribers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.75 0.18 160)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="oklch(0.75 0.18 160)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradientNew" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.75 0.15 195)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="oklch(0.75 0.15 195)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.005 260)" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }}
              tickFormatter={(value) => (value >= 1000 ? `${value / 1000}k` : value)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "oklch(0.18 0.005 260)",
                border: "1px solid oklch(0.28 0.005 260)",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              }}
              labelStyle={{ color: "oklch(0.95 0 0)", fontWeight: 500 }}
              itemStyle={{ color: "oklch(0.85 0 0)" }}
            />
            <Area
              type="monotone"
              dataKey="subscribers"
              stroke="oklch(0.75 0.18 160)"
              strokeWidth={2}
              fill="url(#gradientSubscribers)"
              name="Total Subscribers"
            />
            <Area
              type="monotone"
              dataKey="newSubscribers"
              stroke="oklch(0.75 0.15 195)"
              strokeWidth={2}
              fill="url(#gradientNew)"
              name="New Subscribers"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlowCard>
  )
}
