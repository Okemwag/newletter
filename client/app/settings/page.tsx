"use client"

import { useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { GlowCard } from "@/components/ui/glow-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { TerminalText } from "@/components/ui/terminal-text"
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Key,
  Upload,
  Check,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  AlertTriangle,
} from "lucide-react"

export default function SettingsPage() {
  const [showApiKey, setShowApiKey] = useState(false)
  const apiKey = "pk_live_51NxHc2Ipu5k3Y7h8G9Jk2l..."

  return (
    <AppLayout>
      <div className="p-8 animate-fade-up">
        <div className="max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-foreground mb-2">Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>

          <Tabs defaultValue="profile" className="space-y-8">
            <TabsList className="bg-muted/50 flex-wrap h-auto gap-1 p-1">
              <TabsTrigger value="profile" className="data-[state=active]:bg-secondary gap-2">
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-secondary gap-2">
                <Bell className="w-4 h-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="api" className="data-[state=active]:bg-secondary gap-2">
                <Key className="w-4 h-4" />
                API
              </TabsTrigger>
              <TabsTrigger value="billing" className="data-[state=active]:bg-secondary gap-2">
                <CreditCard className="w-4 h-4" />
                Billing
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-secondary gap-2">
                <Shield className="w-4 h-4" />
                Security
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <GlowCard className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-6">Profile Information</h2>

                {/* Avatar */}
                <div className="flex items-center gap-6 mb-8">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="/professional-headshot.png" alt="Profile" />
                    <AvatarFallback className="bg-muted text-muted-foreground text-xl">JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm" className="mb-2 bg-transparent">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photo
                    </Button>
                    <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max size 2MB.</p>
                  </div>
                </div>

                {/* Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      defaultValue="John"
                      className="bg-input border-border focus:border-terminal"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue="Doe" className="bg-input border-border focus:border-terminal" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue="john@example.com"
                      className="bg-input border-border focus:border-terminal"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself..."
                      className="bg-input border-border focus:border-terminal resize-none"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-6 pt-6 border-t border-border">
                  <Button className="bg-terminal text-terminal-foreground hover:bg-terminal/90">
                    <Check className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </GlowCard>

              <GlowCard className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-6">Newsletter Settings</h2>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="newsletterName">Newsletter Name</Label>
                    <Input
                      id="newsletterName"
                      defaultValue="The Weekly Digest"
                      className="bg-input border-border focus:border-terminal"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fromName">From Name</Label>
                    <Input
                      id="fromName"
                      defaultValue="John from Pulse"
                      className="bg-input border-border focus:border-terminal"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="replyTo">Reply-To Email</Label>
                    <Input
                      id="replyTo"
                      type="email"
                      defaultValue="hello@pulse.app"
                      className="bg-input border-border focus:border-terminal"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select defaultValue="america-ny">
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="america-la">America/Los_Angeles (PST)</SelectItem>
                        <SelectItem value="america-ny">America/New_York (EST)</SelectItem>
                        <SelectItem value="europe-london">Europe/London (GMT)</SelectItem>
                        <SelectItem value="asia-tokyo">Asia/Tokyo (JST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end mt-6 pt-6 border-t border-border">
                  <Button className="bg-terminal text-terminal-foreground hover:bg-terminal/90">
                    <Check className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </GlowCard>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <GlowCard className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-6">Email Notifications</h2>

                <div className="space-y-6">
                  <NotificationToggle
                    title="New Subscribers"
                    description="Get notified when someone subscribes to your newsletter"
                    defaultChecked
                  />
                  <NotificationToggle
                    title="Campaign Performance"
                    description="Daily summary of your campaign open and click rates"
                    defaultChecked
                  />
                  <NotificationToggle
                    title="Subscriber Milestones"
                    description="Celebrate when you hit subscriber milestones"
                    defaultChecked
                  />
                  <NotificationToggle
                    title="Automation Alerts"
                    description="Get notified when automations fail or need attention"
                    defaultChecked
                  />
                  <NotificationToggle
                    title="Weekly Analytics Report"
                    description="Receive a weekly summary of your newsletter performance"
                  />
                  <NotificationToggle
                    title="Product Updates"
                    description="Stay informed about new features and improvements"
                  />
                </div>
              </GlowCard>
            </TabsContent>

            {/* API Tab */}
            <TabsContent value="api" className="space-y-6">
              <GlowCard className="p-6" scanlines>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-terminal/10 flex items-center justify-center">
                    <Key className="w-5 h-5 text-terminal" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">API Keys</h2>
                    <p className="text-sm text-muted-foreground">Manage your API access</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/30 border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-terminal/10 text-terminal border-terminal/20">Live</Badge>
                        <span className="text-sm font-medium text-foreground">Production Key</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Created Nov 1, 2024</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-3 rounded-lg bg-background font-mono text-sm text-foreground/80 border border-border">
                        {showApiKey ? apiKey : "••••••••••••••••••••••••••••••••"}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full border-dashed bg-transparent">
                    <Key className="w-4 h-4 mr-2" />
                    Generate New API Key
                  </Button>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-background/50 border border-border">
                  <p className="text-sm text-muted-foreground font-mono terminal-flicker">
                    <TerminalText>{">"}</TerminalText> curl -X POST https://api.pulse.app/v1/subscribers \<br />
                    &nbsp;&nbsp;-H &quot;Authorization: Bearer YOUR_API_KEY&quot; \<br />
                    &nbsp;&nbsp;-d &apos;&#123;&quot;email&quot;: &quot;new@subscriber.com&quot;&#125;&apos;
                  </p>
                </div>
              </GlowCard>

              <GlowCard className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Webhooks</h2>
                <p className="text-muted-foreground text-sm mb-6">Receive real-time notifications when events happen</p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="webhookUrl">Webhook URL</Label>
                    <Input
                      id="webhookUrl"
                      placeholder="https://your-app.com/webhooks/pulse"
                      className="bg-input border-border focus:border-terminal"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label>Events to Send</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        "subscriber.created",
                        "subscriber.deleted",
                        "campaign.sent",
                        "email.opened",
                        "email.clicked",
                        "automation.triggered",
                      ].map((event) => (
                        <div key={event} className="flex items-center gap-2">
                          <Switch id={event} defaultChecked />
                          <Label htmlFor={event} className="text-sm font-mono text-muted-foreground">
                            {event}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6 pt-6 border-t border-border">
                  <Button className="bg-terminal text-terminal-foreground hover:bg-terminal/90">Save Webhook</Button>
                </div>
              </GlowCard>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing" className="space-y-6">
              <GlowCard className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-1">Current Plan</h2>
                    <p className="text-muted-foreground text-sm">You&apos;re on the Pro plan</p>
                  </div>
                  <Badge className="bg-terminal/10 text-terminal border-terminal/20 text-sm px-3 py-1">Pro</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="p-4 rounded-lg bg-muted/30 border border-border">
                    <p className="text-sm text-muted-foreground mb-1">Subscribers</p>
                    <p className="text-2xl font-semibold text-foreground">
                      12,486 <span className="text-sm font-normal text-muted-foreground">/ 25,000</span>
                    </p>
                    <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full w-1/2 bg-terminal rounded-full" />
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 border border-border">
                    <p className="text-sm text-muted-foreground mb-1">Emails Sent</p>
                    <p className="text-2xl font-semibold text-foreground">
                      48,392 <span className="text-sm font-normal text-muted-foreground">/ 100,000</span>
                    </p>
                    <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full w-[48%] bg-cyan rounded-full" />
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 border border-border">
                    <p className="text-sm text-muted-foreground mb-1">Next Billing</p>
                    <p className="text-2xl font-semibold text-foreground">
                      $49<span className="text-sm font-normal text-muted-foreground">/mo</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Dec 1, 2024</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline">Change Plan</Button>
                  <Button variant="ghost" className="text-muted-foreground">
                    View Invoices
                  </Button>
                </div>
              </GlowCard>

              <GlowCard className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-6">Payment Method</h2>

                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 border border-border mb-4">
                  <div className="w-12 h-8 rounded bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">VISA</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">•••• •••• •••• 4242</p>
                    <p className="text-sm text-muted-foreground">Expires 12/2026</p>
                  </div>
                  <Badge variant="outline" className="text-terminal border-terminal/20">
                    Default
                  </Badge>
                </div>

                <Button variant="outline">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Update Payment Method
                </Button>
              </GlowCard>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <GlowCard className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-6">Password</h2>

                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      className="bg-input border-border focus:border-terminal"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" className="bg-input border-border focus:border-terminal" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      className="bg-input border-border focus:border-terminal"
                    />
                  </div>
                </div>

                <div className="flex justify-start mt-6 pt-6 border-t border-border">
                  <Button className="bg-terminal text-terminal-foreground hover:bg-terminal/90">Update Password</Button>
                </div>
              </GlowCard>

              <GlowCard className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-6">Two-Factor Authentication</h2>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-terminal/10 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-terminal" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Authenticator App</p>
                      <p className="text-sm text-muted-foreground">Use an app to generate one-time codes</p>
                    </div>
                  </div>
                  <Switch />
                </div>
              </GlowCard>

              <GlowCard className="p-6 border-destructive/20">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-foreground mb-2">Danger Zone</h2>
                    <p className="text-muted-foreground text-sm mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button
                      variant="outline"
                      className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive bg-transparent"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </GlowCard>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  )
}

function NotificationToggle({
  title,
  description,
  defaultChecked = false,
}: {
  title: string
  description: string
  defaultChecked?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  )
}
