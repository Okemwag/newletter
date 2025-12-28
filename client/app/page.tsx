import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Mail, Zap, Users, BarChart3, Sparkles, ArrowRight, Check, Terminal, Send, Bot } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Scanline overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,170,0.03)_2px,rgba(0,255,170,0.03)_4px)]" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <Terminal className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-mono text-lg font-bold tracking-tight">pulse_</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Features
            </Link>
            <Link href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Pricing
            </Link>
            <Link
              href="#testimonials"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Testimonials
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-mono">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="font-mono">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-16">
        {/* Background glow */}
        <div className="absolute top-1/4 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-mono text-sm text-primary">AI-Powered Newsletter Platform</span>
          </div>

          <h1 className="mb-6 font-mono text-4xl font-bold tracking-tight text-balance md:text-6xl lg:text-7xl">
            Your newsletter, <span className="text-primary">supercharged_</span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground text-balance md:text-xl">
            Craft stunning newsletters with AI assistance, automate your workflows, and grow your audience. The modern
            way to connect with your subscribers.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button size="lg" className="gap-2 font-mono">
                Start for free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="gap-2 font-mono bg-transparent">
                View Demo
              </Button>
            </Link>
          </div>

          {/* Terminal preview */}
          <div className="mx-auto mt-16 max-w-2xl overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-primary/10">
            <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-red-500/70" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
              <div className="h-3 w-3 rounded-full bg-green-500/70" />
              <span className="ml-2 font-mono text-xs text-muted-foreground">pulse_terminal</span>
            </div>
            <div className="p-6 text-left font-mono text-sm">
              <p className="text-muted-foreground">
                <span className="text-primary">$</span> pulse init --newsletter "Weekly Digest"
              </p>
              <p className="mt-2 text-muted-foreground">
                <span className="text-primary">&gt;</span> Newsletter created successfully
              </p>
              <p className="text-muted-foreground">
                <span className="text-primary">&gt;</span> AI assistant ready
              </p>
              <p className="text-muted-foreground">
                <span className="text-primary">&gt;</span> <span className="text-green-400">2,847</span> subscribers
                synced
              </p>
              <p className="mt-2 text-primary animate-pulse">_</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative border-t border-border bg-muted/30 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-mono text-3xl font-bold md:text-4xl">Everything you need_</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Powerful features to help you create, manage, and grow your newsletter
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Bot,
                title: "AI Writing Assistant",
                description: "Generate compelling content, subject lines, and CTAs with our AI-powered writing tools.",
              },
              {
                icon: Zap,
                title: "Smart Automations",
                description: "Set up welcome sequences, drip campaigns, and trigger-based workflows effortlessly.",
              },
              {
                icon: Users,
                title: "Subscriber Management",
                description: "Segment your audience, track engagement, and manage contacts with ease.",
              },
              {
                icon: BarChart3,
                title: "Advanced Analytics",
                description: "Deep insights into open rates, click-through rates, and subscriber behavior.",
              },
              {
                icon: Mail,
                title: "Beautiful Templates",
                description: "Professionally designed templates that look great on every device.",
              },
              {
                icon: Send,
                title: "Reliable Delivery",
                description: "Industry-leading deliverability rates to ensure your emails reach inboxes.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-mono text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative border-t border-border px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-mono text-3xl font-bold md:text-4xl">Simple pricing_</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">Start free, scale as you grow. No hidden fees.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Starter",
                price: "0",
                description: "Perfect for getting started",
                features: ["Up to 500 subscribers", "1,000 emails/month", "Basic templates", "Email support"],
                cta: "Get Started",
                highlight: false,
              },
              {
                name: "Pro",
                price: "29",
                description: "For growing newsletters",
                features: [
                  "Up to 5,000 subscribers",
                  "Unlimited emails",
                  "AI writing assistant",
                  "Advanced analytics",
                  "Priority support",
                ],
                cta: "Start Free Trial",
                highlight: true,
              },
              {
                name: "Enterprise",
                price: "99",
                description: "For large-scale operations",
                features: [
                  "Unlimited subscribers",
                  "Unlimited emails",
                  "Custom integrations",
                  "Dedicated account manager",
                  "SLA guarantee",
                ],
                cta: "Contact Sales",
                highlight: false,
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`relative overflow-hidden rounded-xl border p-6 transition-all ${
                  plan.highlight
                    ? "border-primary bg-card shadow-xl shadow-primary/10"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute top-0 right-0 rounded-bl-lg bg-primary px-3 py-1 font-mono text-xs text-primary-foreground">
                    Popular
                  </div>
                )}
                <h3 className="mb-1 font-mono text-lg font-semibold">{plan.name}</h3>
                <p className="mb-4 text-sm text-muted-foreground">{plan.description}</p>
                <div className="mb-6">
                  <span className="font-mono text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="mb-6 space-y-3">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button className="w-full font-mono" variant={plan.highlight ? "default" : "outline"}>
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative border-t border-border bg-muted/30 px-6 py-24">
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <h2 className="mb-4 font-mono text-3xl font-bold md:text-4xl">Ready to get started?_</h2>
          <p className="mb-8 text-muted-foreground">
            Join thousands of creators and businesses using Pulse to grow their audience.
          </p>
          <Link href="/register">
            <Button size="lg" className="gap-2 font-mono">
              Create your newsletter
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
              <Terminal className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="font-mono text-sm">pulse_</span>
          </div>
          <p className="font-mono text-sm text-muted-foreground">&copy; 2025 Pulse. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
