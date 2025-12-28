"use client"

import { useState } from "react"
import { GlowCard } from "@/components/ui/glow-card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { TerminalText } from "@/components/ui/terminal-text"
import { Sparkles, Send, Copy, RefreshCw, Loader2, ChevronDown, ChevronUp } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface AIAssistantProps {
  onInsertContent: (content: string) => void
}

const suggestions = [
  "Write a compelling introduction for a product launch",
  "Create a call-to-action for a limited-time offer",
  "Generate a welcome email for new subscribers",
  "Write a re-engagement email for inactive users",
]

export function AIAssistant({ onInsertContent }: AIAssistantProps) {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState("")
  const [isExpanded, setIsExpanded] = useState(true)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setGeneratedContent("")

    // Simulate AI generation with typing effect
    await new Promise((resolve) => setTimeout(resolve, 500))

    const sampleResponse = `# Welcome to Our Newsletter!

We're thrilled to have you join our community of forward-thinking readers.

## What to Expect

Every week, you'll receive:
- **Exclusive insights** from industry experts
- **Early access** to new features and products
- **Curated content** tailored to your interests

> "The best investment you can make is in yourself." - Warren Buffett

Stay tuned for our upcoming launch announcement. We have something special planned just for our newsletter subscribers.

---

**Ready to get started?** [Click here to explore](#) and discover what's waiting for you.`

    // Simulate typing
    for (let i = 0; i <= sampleResponse.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 5))
      setGeneratedContent(sampleResponse.slice(0, i))
    }

    setIsGenerating(false)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion)
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <GlowCard className="h-full flex flex-col overflow-hidden" scanlines>
        {/* Header */}
        <CollapsibleTrigger asChild>
          <button className="flex items-center justify-between p-4 border-b border-border hover:bg-muted/30 transition-colors w-full text-left">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">AI Writing Assistant</h3>
                <p className="text-xs text-muted-foreground font-mono">
                  <TerminalText>{">"}</TerminalText> powered by GPT-4
                </p>
              </div>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className="flex-1 flex flex-col overflow-hidden">
          {/* Content */}
          <div className="flex-1 flex flex-col p-4 overflow-hidden">
            {/* Suggestions */}
            {!generatedContent && !isGenerating && (
              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-2">Quick prompts:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs px-3 py-1.5 rounded-full bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Generated Content */}
            {(generatedContent || isGenerating) && (
              <div className="flex-1 mb-4 overflow-hidden">
                <div className="h-full bg-background/50 rounded-lg border border-border p-4 overflow-auto font-mono text-sm">
                  <div className="text-foreground/90 whitespace-pre-wrap">
                    {generatedContent}
                    {isGenerating && <span className="cursor-blink text-terminal">▌</span>}
                  </div>
                </div>
                {generatedContent && !isGenerating && (
                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      size="sm"
                      onClick={() => onInsertContent(generatedContent)}
                      className="bg-terminal text-terminal-foreground hover:bg-terminal/90"
                    >
                      <Copy className="w-3 h-3 mr-2" />
                      Insert
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleGenerate}>
                      <RefreshCw className="w-3 h-3 mr-2" />
                      Regenerate
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Input */}
            <div className="mt-auto">
              <div className="relative">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe what you want to write..."
                  className="pr-12 resize-none bg-input border-border focus:border-terminal min-h-[80px]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.metaKey) {
                      handleGenerate()
                    }
                  }}
                />
                <Button
                  size="icon"
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="absolute right-2 bottom-2 h-8 w-8 bg-terminal text-terminal-foreground hover:bg-terminal/90 disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Press <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">⌘</kbd> +{" "}
                <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">Enter</kbd> to generate
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </GlowCard>
    </Collapsible>
  )
}
