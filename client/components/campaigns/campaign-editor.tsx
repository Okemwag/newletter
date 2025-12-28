"use client"

import { useState } from "react"
import { GlowCard } from "@/components/ui/glow-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bold, Italic, Link2, ImageIcon, List, ListOrdered, Heading1, Heading2, Code, Quote, Minus } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface CampaignEditorProps {
  content: string
  onContentChange: (content: string) => void
  subject: string
  onSubjectChange: (subject: string) => void
  previewText: string
  onPreviewTextChange: (text: string) => void
}

const toolbarItems = [
  { icon: Bold, label: "Bold", markdown: "**text**" },
  { icon: Italic, label: "Italic", markdown: "*text*" },
  { icon: Link2, label: "Link", markdown: "[text](url)" },
  { icon: ImageIcon, label: "Image", markdown: "![alt](url)" },
  { icon: Heading1, label: "Heading 1", markdown: "# " },
  { icon: Heading2, label: "Heading 2", markdown: "## " },
  { icon: List, label: "Bullet List", markdown: "- " },
  { icon: ListOrdered, label: "Numbered List", markdown: "1. " },
  { icon: Quote, label: "Quote", markdown: "> " },
  { icon: Code, label: "Code", markdown: "`code`" },
  { icon: Minus, label: "Divider", markdown: "\n---\n" },
]

export function CampaignEditor({
  content,
  onContentChange,
  subject,
  onSubjectChange,
  previewText,
  onPreviewTextChange,
}: CampaignEditorProps) {
  const [activeTab, setActiveTab] = useState("write")

  const insertMarkdown = (markdown: string) => {
    onContentChange(content + markdown)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Subject and Preview Text */}
      <div className="space-y-4 mb-6">
        <div className="space-y-2">
          <Label htmlFor="subject" className="text-sm text-foreground">
            Subject Line
          </Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
            placeholder="Enter your email subject..."
            className="bg-input border-border focus:border-terminal"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="preview" className="text-sm text-foreground">
            Preview Text
          </Label>
          <Input
            id="preview"
            value={previewText}
            onChange={(e) => onPreviewTextChange(e.target.value)}
            placeholder="Text shown in inbox preview..."
            className="bg-input border-border focus:border-terminal"
          />
        </div>
      </div>

      {/* Editor Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="write" className="data-[state=active]:bg-secondary">
              Write
            </TabsTrigger>
            <TabsTrigger value="preview" className="data-[state=active]:bg-secondary">
              Preview
            </TabsTrigger>
          </TabsList>

          {/* Toolbar */}
          {activeTab === "write" && (
            <TooltipProvider delayDuration={0}>
              <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1">
                {toolbarItems.map((item) => (
                  <Tooltip key={item.label}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary"
                        onClick={() => insertMarkdown(item.markdown)}
                      >
                        <item.icon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </TooltipProvider>
          )}
        </div>

        <TabsContent value="write" className="flex-1 mt-0">
          <Textarea
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder="Write your email content in Markdown..."
            className="h-full min-h-[400px] resize-none bg-input border-border focus:border-terminal font-mono text-sm leading-relaxed"
          />
        </TabsContent>

        <TabsContent value="preview" className="flex-1 mt-0">
          <GlowCard className="h-full min-h-[400px] p-6 overflow-auto">
            <div className="prose prose-invert prose-sm max-w-none">
              <MarkdownPreview content={content} />
            </div>
          </GlowCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function MarkdownPreview({ content }: { content: string }) {
  // Simple markdown to HTML conversion for preview
  const renderMarkdown = (text: string) => {
    if (!text) return <p className="text-muted-foreground italic">Start writing to see preview...</p>

    const lines = text.split("\n")
    return lines.map((line, i) => {
      // Headers
      if (line.startsWith("### ")) {
        return (
          <h3 key={i} className="text-lg font-semibold mt-4 mb-2 text-foreground">
            {line.slice(4)}
          </h3>
        )
      }
      if (line.startsWith("## ")) {
        return (
          <h2 key={i} className="text-xl font-semibold mt-6 mb-3 text-foreground">
            {line.slice(3)}
          </h2>
        )
      }
      if (line.startsWith("# ")) {
        return (
          <h1 key={i} className="text-2xl font-bold mt-6 mb-4 text-foreground">
            {line.slice(2)}
          </h1>
        )
      }
      // Horizontal rule
      if (line === "---") {
        return <hr key={i} className="my-6 border-border" />
      }
      // Quote
      if (line.startsWith("> ")) {
        return (
          <blockquote key={i} className="border-l-2 border-terminal pl-4 my-4 text-muted-foreground italic">
            {line.slice(2)}
          </blockquote>
        )
      }
      // List items
      if (line.startsWith("- ")) {
        return (
          <li key={i} className="ml-4 text-foreground/90">
            {formatInline(line.slice(2))}
          </li>
        )
      }
      if (/^\d+\.\s/.test(line)) {
        return (
          <li key={i} className="ml-4 list-decimal text-foreground/90">
            {formatInline(line.replace(/^\d+\.\s/, ""))}
          </li>
        )
      }
      // Empty line
      if (!line.trim()) {
        return <br key={i} />
      }
      // Regular paragraph
      return (
        <p key={i} className="my-2 text-foreground/90">
          {formatInline(line)}
        </p>
      )
    })
  }

  const formatInline = (text: string) => {
    // Bold
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    // Italic
    text = text.replace(/\*(.*?)\*/g, "<em>$1</em>")
    // Code
    text = text.replace(
      /`(.*?)`/g,
      '<code class="bg-muted px-1 py-0.5 rounded text-terminal font-mono text-xs">$1</code>',
    )
    // Links
    text = text.replace(
      /\[(.*?)\]$$(.*?)$$/g,
      '<a href="$2" class="text-terminal underline hover:text-terminal/80">$1</a>',
    )

    return <span dangerouslySetInnerHTML={{ __html: text }} />
  }

  return <div>{renderMarkdown(content)}</div>
}
