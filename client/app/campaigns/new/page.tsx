"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import { Icon } from "@iconify/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { AppLayout } from "@/components/layout/app-layout"
import { GlowCard } from "@/components/ui/glow-card"
import { campaignsApi } from "@/lib/api"

export default function NewCampaignPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [campaignName, setCampaignName] = useState("")
  const [subject, setSubject] = useState("")
  const [recipients, setRecipients] = useState("all")
  const [previewMode, setPreviewMode] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start writing your newsletter...",
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
    ],
    content: "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none min-h-[400px] p-4 focus:outline-none",
      },
    },
  })

  const handleSaveDraft = async () => {
    if (!editor) return
    setIsLoading(true)
    try {
      await campaignsApi.create({
        name: campaignName,
        subject,
        content: editor.getHTML(),
        status: "draft",
      })
      router.push("/campaigns")
    } catch (error) {
      console.error("Failed to save draft:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = async () => {
    if (!editor || !campaignName || !subject) return
    setIsLoading(true)
    try {
      const response = await campaignsApi.create({
        name: campaignName,
        subject,
        content: editor.getHTML(),
        status: "draft",
      })
      await campaignsApi.send(response.data.id)
      router.push("/campaigns")
    } catch (error) {
      console.error("Failed to send campaign:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const ToolbarButton = ({
    icon,
    action,
    isActive = false,
    tooltip
  }: {
    icon: string
    action: () => void
    isActive?: boolean
    tooltip: string
  }) => (
    <button
      type="button"
      onClick={action}
      className={`p-2 rounded-lg transition-colors ${isActive
        ? "bg-primary text-primary-foreground"
        : "hover:bg-muted text-muted-foreground hover:text-foreground"
        }`}
      title={tooltip}
    >
      <Icon icon={icon} className="h-4 w-4" />
    </button>
  )

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 animate-fade-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Icon icon="lucide:arrow-left" className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold">Create Campaign</h1>
              <p className="text-muted-foreground text-sm hidden sm:block">
                Compose your newsletter and send to subscribers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              disabled={isLoading}
              className="flex-1 sm:flex-none"
            >
              <Icon icon="lucide:save" className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Save Draft</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
              className="flex-1 sm:flex-none"
            >
              <Icon icon={previewMode ? "lucide:edit" : "lucide:eye"} className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{previewMode ? "Edit" : "Preview"}</span>
            </Button>
            <Button
              size="sm"
              onClick={handleSend}
              disabled={isLoading || !campaignName || !subject}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0 flex-1 sm:flex-none"
            >
              <Icon icon="lucide:send" className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Send Now</span>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Details */}
            <GlowCard className="p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Campaign Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Weekly Newsletter #12"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Email Subject</Label>
                  <Input
                    id="subject"
                    placeholder="e.g., This week's top stories..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
              </div>
            </GlowCard>

            {/* Editor */}
            <GlowCard className="overflow-hidden">
              {!previewMode && editor && (
                <div className="flex items-center gap-1 border-b border-border p-2 bg-muted/30 flex-wrap">
                  <ToolbarButton
                    icon="lucide:bold"
                    action={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive("bold")}
                    tooltip="Bold"
                  />
                  <ToolbarButton
                    icon="lucide:italic"
                    action={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive("italic")}
                    tooltip="Italic"
                  />
                  <ToolbarButton
                    icon="lucide:strikethrough"
                    action={() => editor.chain().focus().toggleStrike().run()}
                    isActive={editor.isActive("strike")}
                    tooltip="Strikethrough"
                  />
                  <div className="w-px h-6 bg-border mx-1" />
                  <ToolbarButton
                    icon="lucide:heading-1"
                    action={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    isActive={editor.isActive("heading", { level: 1 })}
                    tooltip="Heading 1"
                  />
                  <ToolbarButton
                    icon="lucide:heading-2"
                    action={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive("heading", { level: 2 })}
                    tooltip="Heading 2"
                  />
                  <div className="w-px h-6 bg-border mx-1" />
                  <ToolbarButton
                    icon="lucide:list"
                    action={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive("bulletList")}
                    tooltip="Bullet List"
                  />
                  <ToolbarButton
                    icon="lucide:list-ordered"
                    action={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive("orderedList")}
                    tooltip="Ordered List"
                  />
                  <ToolbarButton
                    icon="lucide:quote"
                    action={() => editor.chain().focus().toggleBlockquote().run()}
                    isActive={editor.isActive("blockquote")}
                    tooltip="Quote"
                  />
                  <div className="w-px h-6 bg-border mx-1" />
                  <ToolbarButton
                    icon="lucide:link"
                    action={() => {
                      const url = window.prompt("Enter URL")
                      if (url) {
                        editor.chain().focus().setLink({ href: url }).run()
                      }
                    }}
                    isActive={editor.isActive("link")}
                    tooltip="Add Link"
                  />
                  <ToolbarButton
                    icon="lucide:image"
                    action={() => {
                      const url = window.prompt("Enter image URL")
                      if (url) {
                        editor.chain().focus().setImage({ src: url }).run()
                      }
                    }}
                    tooltip="Add Image"
                  />
                  <div className="w-px h-6 bg-border mx-1" />
                  <ToolbarButton
                    icon="lucide:undo"
                    action={() => editor.chain().focus().undo().run()}
                    tooltip="Undo"
                  />
                  <ToolbarButton
                    icon="lucide:redo"
                    action={() => editor.chain().focus().redo().run()}
                    tooltip="Redo"
                  />
                </div>
              )}

              <div className={previewMode ? "p-6" : ""}>
                {previewMode ? (
                  <div
                    className="prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: editor?.getHTML() || "" }}
                  />
                ) : (
                  <EditorContent editor={editor} />
                )}
              </div>
            </GlowCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recipients */}
            <GlowCard className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Icon icon="lucide:users" className="h-4 w-4 text-cyan-400" />
                Recipients
              </h3>
              <Select value={recipients} onValueChange={setRecipients}>
                <SelectTrigger>
                  <SelectValue placeholder="Select recipients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subscribers (12,486)</SelectItem>
                  <SelectItem value="active">Active Subscribers (10,234)</SelectItem>
                  <SelectItem value="paid">Paid Subscribers (1,842)</SelectItem>
                  <SelectItem value="free">Free Subscribers (10,644)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                Campaign will be sent to selected audience
              </p>
            </GlowCard>

            {/* Stats Preview */}
            <GlowCard className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Icon icon="lucide:bar-chart-3" className="h-4 w-4 text-purple-400" />
                Expected Performance
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Recipients</span>
                  <span className="font-medium">12,486</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Est. Opens</span>
                  <span className="font-medium text-cyan-400">~5,344 (42.8%)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Est. Clicks</span>
                  <span className="font-medium text-purple-400">~1,548 (12.4%)</span>
                </div>
              </div>
            </GlowCard>

            {/* Tips */}
            <GlowCard className="p-6 bg-gradient-to-br from-cyan-500/5 to-purple-500/5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Icon icon="lucide:lightbulb" className="h-4 w-4 text-yellow-400" />
                Writing Tips
              </h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <Icon icon="lucide:check" className="h-3 w-3 text-green-400 mt-1 flex-shrink-0" />
                  Keep subject lines under 50 characters
                </li>
                <li className="flex items-start gap-2">
                  <Icon icon="lucide:check" className="h-3 w-3 text-green-400 mt-1 flex-shrink-0" />
                  Use personalization like &#123;&#123;first_name&#125;&#125;
                </li>
                <li className="flex items-start gap-2">
                  <Icon icon="lucide:check" className="h-3 w-3 text-green-400 mt-1 flex-shrink-0" />
                  Add a clear call-to-action
                </li>
              </ul>
            </GlowCard>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
