"use client"

import { useState } from "react"

import { GlowCard } from "@/components/ui/glow-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TerminalText } from "@/components/ui/terminal-text"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Users, Send, Clock, Save } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface CampaignSidebarProps {
  status: "draft" | "scheduled" | "sending"
  onSave: () => void
  onSchedule: () => void
  onSendNow: () => void
}

export function CampaignSidebar({ status, onSave, onSchedule, onSendNow }: CampaignSidebarProps) {
  const statusStyles = {
    draft: "bg-muted text-muted-foreground",
    scheduled: "bg-amber/10 text-amber",
    sending: "bg-terminal/10 text-terminal",
  }

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <GlowCard className="p-4" scanlines>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TerminalText className="text-xs">{">"}</TerminalText>
            <span className="text-sm font-medium text-foreground">Status</span>
          </div>
          <Badge className={statusStyles[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
        </div>
        <div className="space-y-3 font-mono text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>last_saved:</span>
            <span className="text-foreground">2 min ago</span>
          </div>
          <div className="flex items-center justify-between">
            <span>word_count:</span>
            <span className="text-foreground">342</span>
          </div>
          <div className="flex items-center justify-between">
            <span>read_time:</span>
            <span className="text-foreground">~2 min</span>
          </div>
        </div>
      </GlowCard>

      {/* Recipients */}
      <GlowCard className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Recipients</span>
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="bg-input border-border">
            <SelectValue placeholder="Select audience" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subscribers (12,486)</SelectItem>
            <SelectItem value="active">Active Users (8,234)</SelectItem>
            <SelectItem value="new">New Subscribers (1,842)</SelectItem>
            <SelectItem value="premium">Premium Members (2,410)</SelectItem>
          </SelectContent>
        </Select>
      </GlowCard>

      {/* Schedule */}
      <GlowCard className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Schedule</span>
        </div>
        <div className="space-y-3">
          <ScheduleDatePicker />
          <Select defaultValue="09:00">
            <SelectTrigger className="bg-input border-border">
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="06:00">6:00 AM</SelectItem>
              <SelectItem value="09:00">9:00 AM</SelectItem>
              <SelectItem value="12:00">12:00 PM</SelectItem>
              <SelectItem value="15:00">3:00 PM</SelectItem>
              <SelectItem value="18:00">6:00 PM</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </GlowCard>

      {/* Actions */}
      <div className="space-y-2">
        <Button
          className="w-full bg-terminal text-terminal-foreground hover:bg-terminal/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
          onClick={onSendNow}
        >
          <Send className="w-4 h-4 mr-2" />
          Send Now
        </Button>
        <Button variant="outline" className="w-full bg-transparent" onClick={onSchedule}>
          <Clock className="w-4 h-4 mr-2" />
          Schedule
        </Button>
        <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground" onClick={onSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Draft
        </Button>
      </div>
    </div>
  )
}

function ScheduleDatePicker() {
  const [date, setDate] = useState<Date>()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal bg-input border-border",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : "Pick a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
      </PopoverContent>
    </Popover>
  )
}
