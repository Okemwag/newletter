import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import { GoogleAnalytics } from "@/components/analytics/google-analytics"
import { GoogleTagManager } from "@/components/analytics/google-tag-manager"
import { AuthProvider } from "@/contexts/auth-context"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://pulse.app'),
  title: {
    default: "Pulse — Newsletter Platform for Africa | Email Marketing & Automation",
    template: "%s | Pulse Newsletter Platform",
  },
  description:
    "The modern newsletter platform built for Africa. Accept payments via Paystack & M-Pesa, grow with viral referrals, and write faster with AI. Join 10,000+ creators.",
  keywords: [
    "newsletter platform",
    "email marketing",
    "email automation",
    "newsletter software",
    "email campaigns",
    "subscriber management",
    "Paystack integration",
    "M-Pesa payments",
    "African newsletter platform",
    "email analytics",
    "AI writing assistant",
    "referral marketing",
    "creator economy",
    "newsletter monetization",
    "email deliverability",
  ],
  authors: [{ name: "Pulse Team" }],
  creator: "Pulse",
  publisher: "Pulse",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Pulse Newsletter Platform",
    title: "Pulse — Newsletter Platform for Africa",
    description:
      "Turn your audience into a revenue machine. Accept payments via Paystack & M-Pesa, grow with viral referrals, and write faster with AI.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Pulse Newsletter Platform Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pulse — Newsletter Platform for Africa",
    description:
      "Turn your audience into a revenue machine. Accept payments via Paystack & M-Pesa, grow with viral referrals, and write faster with AI.",
    images: ["/og-image.png"],
    creator: "@pulsehq",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "/",
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },
}

export const viewport: Viewport = {
  themeColor: "#1a1a1f",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Pulse Newsletter Platform",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free forever for up to 500 subscribers",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "1247",
    },
    description:
      "The modern newsletter platform built for Africa. Accept payments via Paystack & M-Pesa, grow with viral referrals, and write faster with AI.",
  }

  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <GoogleTagManager />
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster
          position="top-right"
          theme="dark"
          richColors
          closeButton
          toastOptions={{
            style: {
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              color: 'hsl(var(--foreground))',
            },
          }}
        />
        <GoogleAnalytics />
        <Analytics />
      </body>
    </html>
  )
}

