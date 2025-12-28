"use client"

import { useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { CampaignEditor } from "@/components/campaigns/campaign-editor"
import { AIAssistant } from "@/components/campaigns/ai-assistant"
import { CampaignSidebar } from "@/components/campaigns/campaign-sidebar"
import { GlowCard } from "@/components/ui/glow-card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewCampaignPage() {
  const [content, setContent] = useState("")
  const [subject, setSubject] = useState("")
  const [previewText, setPreviewText] = useState("")

  const handleInsertContent = (newContent: string) => {
    setContent((prev) => prev + (prev ? "\n\n" : "") + newContent)
  }

  return (
    <AppLayout>
      <div className="p-8 animate-fade-up">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/campaigns">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">New Campaign</h1>
            <p className="text-muted-foreground text-sm">Create a beautiful email for your subscribers</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Editor */}
          <div className="lg:col-span-6">
            <GlowCard className="p-6 h-full">
              <CampaignEditor
                content={content}
                onContentChange={setContent}
                subject={subject}
                onSubjectChange={setSubject}
                previewText={previewText}
                onPreviewTextChange={setPreviewText}
              />
            </GlowCard>
          </div>

          {/* AI Assistant */}
          <div className="lg:col-span-4">
            <AIAssistant onInsertContent={handleInsertContent} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2">
            <CampaignSidebar
              status="draft"
              onSave={() => console.log("Save")}
              onSchedule={() => console.log("Schedule")}
              onSendNow={() => console.log("Send")}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
