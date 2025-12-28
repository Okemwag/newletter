"use client"

import { GlowCard } from "@/components/ui/glow-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, Clock, Users, GitBranch, Tag, Plus, Trash2, GripVertical, ChevronDown, Sparkles } from "lucide-react"

interface FlowNode {
  id: string
  type: "trigger" | "action" | "condition" | "delay"
  title: string
  description: string
  icon: typeof Mail
}

const sampleFlow: FlowNode[] = [
  {
    id: "1",
    type: "trigger",
    title: "New Subscriber",
    description: "When someone subscribes to newsletter",
    icon: Users,
  },
  {
    id: "2",
    type: "action",
    title: "Send Welcome Email",
    description: "Welcome to our community!",
    icon: Mail,
  },
  {
    id: "3",
    type: "delay",
    title: "Wait 2 Days",
    description: "48 hours delay",
    icon: Clock,
  },
  {
    id: "4",
    type: "condition",
    title: "Check Email Opened",
    description: "Did they open the welcome email?",
    icon: GitBranch,
  },
  {
    id: "5",
    type: "action",
    title: "Add Tag",
    description: "Tag as 'Engaged'",
    icon: Tag,
  },
]

const nodeStyles = {
  trigger: {
    bg: "bg-cyan/10 border-cyan/30",
    icon: "text-cyan bg-cyan/20",
    badge: "bg-cyan/10 text-cyan",
  },
  action: {
    bg: "bg-terminal/10 border-terminal/30",
    icon: "text-terminal bg-terminal/20",
    badge: "bg-terminal/10 text-terminal",
  },
  condition: {
    bg: "bg-amber/10 border-amber/30",
    icon: "text-amber bg-amber/20",
    badge: "bg-amber/10 text-amber",
  },
  delay: {
    bg: "bg-muted border-border",
    icon: "text-muted-foreground bg-muted",
    badge: "bg-muted text-muted-foreground",
  },
}

export function FlowBuilder() {
  return (
    <GlowCard className="p-6 h-full overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-foreground">Welcome Series</h3>
          <p className="text-sm text-muted-foreground">Edit your automation workflow</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Sparkles className="w-4 h-4 mr-2" />
            AI Suggest
          </Button>
          <Button size="sm" className="bg-terminal text-terminal-foreground hover:bg-terminal/90">
            Save Changes
          </Button>
        </div>
      </div>

      {/* Flow Canvas */}
      <div className="relative">
        <div className="flex flex-col items-center gap-0">
          {sampleFlow.map((node, index) => {
            const styles = nodeStyles[node.type]
            return (
              <div key={node.id} className="relative w-full max-w-md">
                {/* Connector Line */}
                {index > 0 && (
                  <div className="absolute left-1/2 -top-4 -translate-x-1/2 flex flex-col items-center">
                    <div className="w-px h-4 bg-border" />
                    <ChevronDown className="w-4 h-4 text-muted-foreground -mt-1" />
                  </div>
                )}

                {/* Node */}
                <div
                  className={`relative p-4 rounded-xl border-2 ${styles.bg} group transition-all hover:scale-[1.02]`}
                >
                  {/* Drag handle */}
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                  </div>

                  <div className="flex items-start gap-4 pl-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${styles.icon}`}
                    >
                      <node.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground">{node.title}</span>
                        <Badge className={`text-[10px] ${styles.badge}`}>{node.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{node.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Condition branches (for condition nodes) */}
                  {node.type === "condition" && (
                    <div className="mt-4 pt-4 border-t border-border/50 flex justify-center gap-8">
                      <div className="flex flex-col items-center">
                        <Badge className="bg-terminal/10 text-terminal text-xs mb-2">Yes</Badge>
                        <div className="w-px h-4 bg-terminal/30" />
                      </div>
                      <div className="flex flex-col items-center">
                        <Badge className="bg-muted text-muted-foreground text-xs mb-2">No</Badge>
                        <div className="w-px h-4 bg-border" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {/* Add Step Button */}
          <div className="mt-4">
            <div className="w-px h-4 bg-border mx-auto" />
            <Button
              variant="outline"
              className="mt-2 border-dashed hover:border-terminal hover:text-terminal hover:bg-terminal/5 bg-transparent"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Step
            </Button>
          </div>
        </div>
      </div>
    </GlowCard>
  )
}
