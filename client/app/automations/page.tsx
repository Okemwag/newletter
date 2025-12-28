"use client"

import { useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { AutomationCard } from "@/components/automations/automation-card"
import { AutomationLogs } from "@/components/automations/automation-logs"
import { FlowBuilder } from "@/components/automations/flow-builder"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, LayoutGrid, List } from "lucide-react"

const automations = [
  {
    id: 1,
    name: "Welcome Series",
    description: "Onboard new subscribers with a 5-email sequence",
    status: "active" as const,
    trigger: "New subscriber",
    steps: 5,
    subscribers: 8432,
    lastRun: "2 min ago",
  },
  {
    id: 2,
    name: "Re-engagement Campaign",
    description: "Win back inactive subscribers after 30 days",
    status: "active" as const,
    trigger: "Tag added",
    steps: 3,
    subscribers: 1256,
    lastRun: "1 hour ago",
  },
  {
    id: 3,
    name: "Product Launch Sequence",
    description: "Build excitement for new product releases",
    status: "paused" as const,
    trigger: "Scheduled",
    steps: 4,
    subscribers: 4521,
    lastRun: "3 days ago",
  },
  {
    id: 4,
    name: "Abandoned Cart Recovery",
    description: "Remind users about items left in cart",
    status: "active" as const,
    trigger: "Tag added",
    steps: 2,
    subscribers: 892,
    lastRun: "15 min ago",
  },
  {
    id: 5,
    name: "Birthday Celebration",
    description: "Send special offers on subscriber birthdays",
    status: "draft" as const,
    trigger: "Scheduled",
    steps: 1,
    subscribers: 0,
    lastRun: null,
  },
]

export default function AutomationsPage() {
  const [activeTab, setActiveTab] = useState("list")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  return (
    <AppLayout>
      <div className="p-8 animate-fade-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-semibold text-foreground mb-2">Automations</h1>
            <p className="text-muted-foreground">Create automated email workflows</p>
          </div>
          <Button className="bg-terminal text-terminal-foreground hover:bg-terminal/90 transition-all hover:scale-[1.02] active:scale-[0.98]">
            <Plus className="w-4 h-4 mr-2" />
            New Automation
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="list" className="data-[state=active]:bg-secondary">
                Automations
              </TabsTrigger>
              <TabsTrigger value="builder" className="data-[state=active]:bg-secondary">
                Flow Builder
              </TabsTrigger>
            </TabsList>

            {activeTab === "list" && (
              <div className="flex items-center gap-4">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search automations..."
                    className="pl-10 bg-input border-border focus:border-terminal"
                  />
                </div>
                <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode("grid")}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <TabsContent value="list" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className={viewMode === "grid" ? "lg:col-span-2" : "lg:col-span-3"}>
                <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}>
                  {automations.map((automation) => (
                    <AutomationCard key={automation.id} automation={automation} />
                  ))}
                </div>
              </div>
              {viewMode === "grid" && (
                <div className="lg:col-span-1 h-[600px]">
                  <AutomationLogs />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="builder" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 min-h-[600px]">
                <FlowBuilder />
              </div>
              <div className="lg:col-span-1 h-[600px]">
                <AutomationLogs />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
