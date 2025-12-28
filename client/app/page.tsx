import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react"
import { pricingPlans } from "@/lib/pricing"
import { OrganizationSchema, FAQSchema, ProductSchema } from "@/components/seo/structured-data"

export default function HomePage() {
  return (
    <>
      <OrganizationSchema />
      <FAQSchema />
      <ProductSchema />
      <div className="min-h-screen bg-background text-foreground">
      {/* Scanline overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,170,0.03)_2px,rgba(0,255,170,0.03)_4px)]" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-cyan-500 to-purple-500">
              <Icon icon="lucide:mail" className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">Pulse</span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {/* Platform Dropdown */}
            <div className="group relative">
              <button className="flex items-center gap-1 px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                Platform
                <Icon icon="lucide:chevron-down" className="h-3 w-3 transition-transform group-hover:rotate-180" />
              </button>
              <div className="invisible absolute left-0 top-full pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                <div className="w-72 rounded-xl border border-border bg-card p-4 shadow-xl">
                  <div className="space-y-1">
                    <Link href="#features" className="flex items-center gap-3 rounded-lg p-3 hover:bg-muted transition-colors">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
                        <Icon icon="lucide:mail" className="h-5 w-5 text-cyan-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Email Campaigns</p>
                        <p className="text-xs text-muted-foreground">Create & send newsletters</p>
                      </div>
                    </Link>
                    <Link href="#features" className="flex items-center gap-3 rounded-lg p-3 hover:bg-muted transition-colors">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                        <Icon icon="lucide:users" className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Subscriber Management</p>
                        <p className="text-xs text-muted-foreground">Grow & segment audience</p>
                      </div>
                    </Link>
                    <Link href="#features" className="flex items-center gap-3 rounded-lg p-3 hover:bg-muted transition-colors">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                        <Icon icon="lucide:credit-card" className="h-5 w-5 text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Payments</p>
                        <p className="text-xs text-muted-foreground">Paystack, M-Pesa & more</p>
                      </div>
                    </Link>
                    <Link href="#features" className="flex items-center gap-3 rounded-lg p-3 hover:bg-muted transition-colors">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/10">
                        <Icon icon="lucide:bar-chart-3" className="h-5 w-5 text-pink-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Analytics</p>
                        <p className="text-xs text-muted-foreground">Track opens, clicks & revenue</p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Solutions Dropdown */}
            <div className="group relative">
              <button className="flex items-center gap-1 px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                Solutions
                <Icon icon="lucide:chevron-down" className="h-3 w-3 transition-transform group-hover:rotate-180" />
              </button>
              <div className="invisible absolute left-1/2 top-full -translate-x-1/2 pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                <div className="w-[640px] rounded-xl border border-border bg-card p-6 shadow-xl">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Use Cases */}
                    <div>
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Use Cases</p>
                      <div className="space-y-1">
                        <Link href="#" className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted transition-colors">
                          <Icon icon="lucide:megaphone" className="h-4 w-4 text-cyan-400" />
                          <span className="text-sm">Reach More Customers</span>
                        </Link>
                        <Link href="#" className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted transition-colors">
                          <Icon icon="lucide:heart" className="h-4 w-4 text-pink-400" />
                          <span className="text-sm">Engage Your Audience</span>
                        </Link>
                        <Link href="#" className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted transition-colors">
                          <Icon icon="lucide:star" className="h-4 w-4 text-yellow-400" />
                          <span className="text-sm">Build Your Brand</span>
                        </Link>
                      </div>
                    </div>
                    {/* For Who */}
                    <div>
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Built For</p>
                      <div className="grid grid-cols-2 gap-1">
                        <Link href="#" className="rounded-lg p-2 text-sm hover:bg-muted transition-colors">Writers</Link>
                        <Link href="#" className="rounded-lg p-2 text-sm hover:bg-muted transition-colors">Founders</Link>
                        <Link href="#" className="rounded-lg p-2 text-sm hover:bg-muted transition-colors">Journalists</Link>
                        <Link href="#" className="rounded-lg p-2 text-sm hover:bg-muted transition-colors">Publishers</Link>
                        <Link href="#" className="rounded-lg p-2 text-sm hover:bg-muted transition-colors">Newsrooms</Link>
                        <Link href="#" className="rounded-lg p-2 text-sm hover:bg-muted transition-colors">Startups</Link>
                        <Link href="#" className="rounded-lg p-2 text-sm hover:bg-muted transition-colors">Businesses</Link>
                        <Link href="#" className="rounded-lg p-2 text-sm hover:bg-muted transition-colors">Creators</Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Link href="#pricing" className="px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
              Pricing
            </Link>
            <Link href="/blog" className="px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
              Blog
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Text Only */}
      <section className="relative overflow-hidden px-6 pt-28 pb-20 lg:pt-40 lg:pb-28" aria-label="Hero">
        {/* Background glow effects */}
        <div className="absolute top-20 left-1/4 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" aria-hidden="true" />
        <div className="absolute bottom-20 right-1/4 h-96 w-96 rounded-full bg-purple-500/15 blur-3xl" aria-hidden="true" />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-500/10 blur-3xl" aria-hidden="true" />

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5" role="status">
            <Icon icon="lucide:sparkles" className="h-4 w-4 text-cyan-400" aria-hidden="true" />
            <span className="text-sm text-cyan-400">Join 10,000+ creators already growing</span>
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            Turn your audience into
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
              a revenue machine.
            </span>
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl lg:text-2xl">
            The newsletter platform built for Africa. Accept payments via Paystack & M-Pesa, grow with viral referrals, and write faster with AI.
          </p>

          {/* Pain points in a row */}
          <ul className="mb-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground" role="list">
            <li className="flex items-center gap-2">
              <Icon icon="lucide:credit-card" className="h-4 w-4 text-cyan-400" aria-hidden="true" />
              <span>African payments</span>
            </li>
            <li className="flex items-center gap-2">
              <Icon icon="lucide:share-2" className="h-4 w-4 text-purple-400" aria-hidden="true" />
              <span>Viral referrals</span>
            </li>
            <li className="flex items-center gap-2">
              <Icon icon="lucide:bot" className="h-4 w-4 text-pink-400" aria-hidden="true" />
              <span>AI writing</span>
            </li>
            <li className="flex items-center gap-2">
              <Icon icon="lucide:trending-up" className="h-4 w-4 text-green-400" aria-hidden="true" />
              <span>42%+ open rates</span>
            </li>
          </ul>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button size="lg" className="h-14 px-8 text-lg gap-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0 shadow-lg shadow-cyan-500/25">
                Start free — no credit card
                <Icon icon="lucide:arrow-right" className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg gap-2 bg-transparent border-border hover:bg-muted">
                <Icon icon="lucide:play-circle" className="h-5 w-5" />
                Watch demo
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            Free forever for up to 500 subscribers • Setup in 2 minutes • No technical skills needed
          </p>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="border-t border-border bg-background px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <p className="mb-8 text-center text-sm text-muted-foreground">
            Trusted by professionals from
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-60 hover:opacity-100 transition-opacity duration-500">
            {/* Google */}
            <svg className="h-7 w-auto" viewBox="0 0 272 92" fill="currentColor">
              <path d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" className="text-muted-foreground" />
              <path d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" className="text-muted-foreground" />
              <path d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z" className="text-muted-foreground" />
              <path d="M225 3v65h-9.5V3h9.5z" className="text-muted-foreground" />
              <path d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z" className="text-muted-foreground" />
              <path d="M35.29 41.41V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49.01z" className="text-muted-foreground" />
            </svg>
            {/* Linear */}
            <svg className="h-6 w-auto" viewBox="0 0 100 100" fill="currentColor">
              <path d="M1.22541 61.5228c-.2225-.9485.90748-1.5459 1.59638-.857L39.3342 97.1782c.6889.6889.0915 1.8189-.857 1.5765A50.0014 50.0014 0 0 1 1.22541 61.5228Z" className="text-muted-foreground" />
              <path d="M.00189135 46.8891c-.01764375.2833.00519572.5765.0929SEQ3.859l8.39140365 35.5903c.05765.2446.17015.4736.3326.6783l35.1338 35.1338c.2046.1624.4336.275.6782.3326l35.5872 8.3885c.2654.0626.5413.0798.8185.0432.7449-.0982 1.1485-.7296.8587-1.3702a49.9992 49.9992 0 0 0-83.3154-13.208C-.70810865 50.587-.0969013 47.4497.00189135 46.8891Z" className="text-muted-foreground" />
              <path d="M50 0C22.3858 0 0 22.3858 0 50c0 .7236.0152 1.4439.0452 2.1608.0755-.4661.223-.9242.4494-1.3535 4.0855-7.7616 14.158-15.2207 26.3582-21.9211C38.4852 22.3356 53.5227 16.5 62.5 16.5c9.0005 0 13.5 3.5 13.5 8.5s-4.5 8.5-13.5 8.5c-4.5025 0-10.7588 2.0618-17.4488 4.8969-6.6632 2.8227-13.5884 6.3868-19.2384 10.0031h.0008C12.158 57.45 6.5 66.5 6.5 76c0 9.3888 5.5005 14.5772 12.9058 15.6818.2578-.1396.5257-.2655.8026-.377 11.2968-4.548 24.4842-11.6422 35.4282-19.595 10.9252-7.9388 19.5482-16.7338 23.4282-24.5588C82.6992 39.7108 85.5 33.5 85.5 28c0-5.5884-2.9282-11.2226-8.5298-15.6602C71.0246 7.6146 61.6878 5 50 5c-17.5228 0-33.1228 9.0022-42.1518 22.7108C2.778 35.6438.0152 43.0372 0 50.898-.0152 43.7108 5.1928 35.0772 12.7726 28.8142 7.178 31.1928 2.7922 35.2448.45 40.0658c-.7706 1.577-.9852 3.3242-.4788 4.9582.5064 1.634 1.755 3.0652 3.4938A49.5212 49.5212 0 0 0 50.088 100 50.0188 50.0188 0 0 0 100 50c0-27.6142-22.3858-50-50-50Z" className="text-muted-foreground" />
            </svg>
            {/* Vercel */}
            <svg className="h-5 w-auto" viewBox="0 0 283 64" fill="currentColor">
              <path d="M141.04 16c-11.04 0-19 7.2-19 18s8.96 18 20 18c6.67 0 12.55-2.64 16.19-7.09l-7.65-4.42c-2.02 2.21-5.09 3.5-8.54 3.5-4.79 0-8.86-2.5-10.37-6.5h28.02c.22-1.12.35-2.28.35-3.5 0-10.79-7.96-17.99-19-17.99zm-9.46 14.5c1.25-3.99 4.67-6.5 9.45-6.5 4.79 0 8.21 2.51 9.45 6.5h-18.9zM248.72 16c-11.04 0-19 7.2-19 18s8.96 18 20 18c6.67 0 12.55-2.64 16.19-7.09l-7.65-4.42c-2.02 2.21-5.09 3.5-8.54 3.5-4.79 0-8.86-2.5-10.37-6.5h28.02c.22-1.12.35-2.28.35-3.5 0-10.79-7.96-17.99-19-17.99zm-9.45 14.5c1.25-3.99 4.67-6.5 9.45-6.5 4.79 0 8.21 2.51 9.45 6.5h-18.9zM200.24 34c0 6 3.92 10 10 10 4.12 0 7.21-1.87 8.8-4.92l7.68 4.43c-3.18 5.3-9.14 8.49-16.48 8.49-11.05 0-19-7.2-19-18s7.96-18 19-18c7.34 0 13.29 3.19 16.48 8.49l-7.68 4.43c-1.59-3.05-4.68-4.92-8.8-4.92-6.07 0-10 4-10 10zm82.48-29v46h-9V5h9zM36.95 0L73.9 64H0L36.95 0zm92.38 5l-27.71 48L73.91 5H84.3l17.32 30 17.32-30h10.39zm58.91 12v9.69c-1-.29-2.06-.49-3.2-.49-5.81 0-10 4-10 10v14.8h-9V17h9v9.2c0-5.08 5.91-9.2 13.2-9.2z" className="text-muted-foreground" />
            </svg>
            {/* Stripe */}
            <svg className="h-8 w-auto" viewBox="0 0 60 25" fill="currentColor">
              <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.02 1.04-.06 1.48zm-6.3-5.88c-1.2 0-1.9 1.12-2.11 2.97h4.19c0-1.7-.72-2.97-2.08-2.97zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.15 1.06a4.67 4.67 0 0 1 3.31-1.32c2.91 0 5.52 2.53 5.52 7.35 0 5.42-2.68 7.64-5.7 7.64zm-.78-11.02c-.9 0-1.52.3-1.93.7L38.24 15c.4.41 1 .7 1.93.7 1.48 0 2.5-1.47 2.5-3.84 0-2.36-1.02-3.58-2.5-3.58zm-12.23-.64c-.9 0-1.56.18-1.83.32v11.22H22V8.11c1.04-.52 2.64-.91 4.38-.91a16.76 16.76 0 0 1 3.82.48l-.78 3.62c-.62-.24-1.2-.45-1.48-.46v-.2zM17.54 20v-9.95c0-3.03-1.1-4.26-3.3-4.26-1.62 0-2.9.55-4.24 1.4v12.8H5.88V.98L10 .1v6c1.13-.75 2.7-1.4 4.42-1.4 3.65 0 5.24 2.1 5.24 6.26V20h-2.12zM4.13 8.4c-.87 0-1.35.07-1.66.2V4.28c.35-.13 1-.2 1.66-.2 1.54 0 2.7.3 2.7 2.12 0 1.88-1.16 2.2-2.7 2.2z" className="text-muted-foreground" />
            </svg>
            {/* Notion */}
            <svg className="h-7 w-auto" viewBox="0 0 100 100" fill="currentColor">
              <path d="M6.017 4.313l55.333 -4.087c6.797 -0.583 8.543 -0.19 12.817 2.917l17.663 12.443c2.913 2.14 3.883 2.723 3.883 5.053v68.243c0 4.277 -1.553 6.807 -6.99 7.193L24.467 99.967c-4.08 0.193 -6.023 -0.39 -8.16 -3.113L3.3 79.94c-2.333 -3.113 -3.3 -5.443 -3.3 -8.167V11.113c0 -3.497 1.553 -6.413 6.017 -6.8z" className="text-muted-foreground/30" />
              <path d="M61.35 0.227l-55.333 4.087C1.553 4.7 0 7.617 0 11.113v60.66c0 2.723 0.967 5.053 3.3 8.167l13.007 16.913c2.137 2.723 4.08 3.307 8.16 3.113l64.257 -3.89c5.437 -0.387 6.99 -2.917 6.99 -7.193V20.64c0 -2.21 -0.873 -2.847 -3.443 -4.733L74.167 3.143c-4.273 -3.107 -6.02 -3.5 -12.817 -2.917zM25.92 19.523c-5.247 0.353 -6.437 0.433 -9.417 -1.99L8.927 11.507c-0.77 -0.78 -0.383 -1.753 1.557 -1.947l53.193 -3.887c4.467 -0.39 6.793 1.167 8.54 2.527l9.123 6.61c0.39 0.197 1.36 1.36 0.193 1.36l-54.933 3.307 -0.68 0.047zM19.803 88.3V30.367c0 -2.53 0.777 -3.697 3.103 -3.893L86 22.78c2.14 -0.193 3.107 1.167 3.107 3.693v57.547c0 2.53 -0.39 4.67 -3.883 4.863l-60.377 3.5c-3.493 0.193 -5.043 -0.97 -5.043 -4.083zm59.6 -54.827c0.387 1.75 0 3.5 -1.75 3.7l-2.91 0.577v42.773c-2.527 1.36 -4.853 2.137 -6.797 2.137 -3.107 0 -3.883 -0.973 -6.21 -3.887l-19.03 -29.94v28.967l6.02 1.363s0 3.5 -4.857 3.5l-13.39 0.777c-0.39 -0.78 0 -2.723 1.357 -3.11l3.497 -0.97v-38.3L30.48 40.667c-0.39 -1.75 0.58 -4.277 3.3 -4.473l14.367 -0.967 19.8 30.327v-26.83l-5.047 -0.58c-0.39 -2.143 1.163 -3.7 3.103 -3.89l13.4 -0.78z" className="text-muted-foreground" />
            </svg>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="relative border-t border-border bg-muted/20 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-2xl font-bold md:text-3xl">
              Everything you need in one beautiful dashboard
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Track subscribers, analyze campaigns, manage payments, and grow your newsletter — all from one place.
            </p>
          </div>

          <div className="relative">
            <div className="relative rounded-2xl border border-border/50 bg-card/50 p-3 shadow-2xl shadow-cyan-500/10 backdrop-blur-sm">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 border-b border-border/50 pb-3 mb-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/70" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                  <div className="h-3 w-3 rounded-full bg-green-500/70" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-sm text-muted-foreground">pulse.app/dashboard</span>
                </div>
              </div>
              {/* Dashboard image */}
              <img
                src="/dashboard-preview.png"
                alt="Pulse Newsletter Dashboard"
                className="rounded-xl w-full"
              />
            </div>

            {/* Floating stat cards */}
            <div className="absolute -left-6 top-1/3 rounded-xl border border-border/50 bg-card/95 backdrop-blur-sm p-4 shadow-xl hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
                  <Icon icon="lucide:users" className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">New subscribers</p>
                  <p className="text-xl font-bold text-green-400">+847 <span className="text-xs text-muted-foreground">today</span></p>
                </div>
              </div>
            </div>

            <div className="absolute -right-6 top-1/4 rounded-xl border border-border/50 bg-card/95 backdrop-blur-sm p-4 shadow-xl hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/20">
                  <Icon icon="lucide:mail-open" className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Open rate</p>
                  <p className="text-xl font-bold text-cyan-400">42.8%</p>
                </div>
              </div>
            </div>

            <div className="absolute -right-4 bottom-1/4 rounded-xl border border-border/50 bg-card/95 backdrop-blur-sm p-4 shadow-xl hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20">
                  <Icon icon="lucide:dollar-sign" className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                  <p className="text-xl font-bold text-purple-400">$12.4K</p>
                </div>
              </div>
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
                icon: "lucide:bot",
                title: "AI Writing Assistant",
                description: "Generate compelling content, subject lines, and CTAs with our AI-powered writing tools.",
              },
              {
                icon: "lucide:zap",
                title: "Smart Automations",
                description: "Set up welcome sequences, drip campaigns, and trigger-based workflows effortlessly.",
              },
              {
                icon: "lucide:users",
                title: "Subscriber Management",
                description: "Segment your audience, track engagement, and manage contacts with ease.",
              },
              {
                icon: "lucide:bar-chart-3",
                title: "Advanced Analytics",
                description: "Deep insights into open rates, click-through rates, and subscriber behavior.",
              },
              {
                icon: "lucide:mail",
                title: "Beautiful Templates",
                description: "Professionally designed templates that look great on every device.",
              },
              {
                icon: "lucide:send",
                title: "Reliable Delivery",
                description: "Industry-leading deliverability rates to ensure your emails reach inboxes.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon icon={feature.icon} className="h-6 w-6" />
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

          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
            {pricingPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative overflow-hidden rounded-xl border p-6 transition-all ${plan.popular
                  ? "border-primary bg-card shadow-xl shadow-primary/10"
                  : "border-border bg-card hover:border-primary/50"
                  }`}
              >
                {plan.popular && (
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
                      <Icon icon="lucide:check" className="h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button className="w-full font-mono" variant={plan.popular ? "default" : "outline"}>
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
              <Icon icon="lucide:arrow-right" className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
              <Icon icon="lucide:terminal" className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="font-mono text-sm">pulse_</span>
          </div>
          <p className="font-mono text-sm text-muted-foreground">&copy; 2025 Pulse. All rights reserved.</p>
        </div>
      </footer>
    </div>
    </>
  )
}
