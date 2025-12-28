export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Pulse",
    url: "https://pulse.app",
    logo: "https://pulse.app/icon.svg",
    description:
      "The modern newsletter platform built for Africa. Accept payments via Paystack & M-Pesa, grow with viral referrals, and write faster with AI.",
    sameAs: [
      "https://twitter.com/pulsehq",
      "https://linkedin.com/company/pulse",
      "https://github.com/pulse",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Support",
      email: "support@pulse.app",
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function FAQSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is Pulse really free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! Pulse is free forever for up to 500 subscribers. You can send unlimited emails and access all core features without a credit card.",
        },
      },
      {
        "@type": "Question",
        name: "Which payment methods do you support?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We support Paystack (for Nigeria and other African countries) and M-Pesa (for Kenya). This makes it easy for African creators to monetize their newsletters.",
        },
      },
      {
        "@type": "Question",
        name: "Can I import my existing subscribers?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Absolutely! You can import subscribers via CSV file. We support bulk imports and will help you migrate from other platforms.",
        },
      },
      {
        "@type": "Question",
        name: "What makes Pulse different from other newsletter platforms?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Pulse is built specifically for Africa with local payment integrations (Paystack, M-Pesa), viral referral systems, AI writing assistance, and industry-leading deliverability rates.",
        },
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function BreadcrumbSchema({ items }: { items: Array<{ name: string; url: string }> }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function ProductSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Pulse Newsletter Platform",
    description:
      "The modern newsletter platform built for Africa. Accept payments via Paystack & M-Pesa, grow with viral referrals, and write faster with AI.",
    brand: {
      "@type": "Brand",
      name: "Pulse",
    },
    offers: {
      "@type": "AggregateOffer",
      lowPrice: "0",
      highPrice: "99",
      priceCurrency: "USD",
      offerCount: "4",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "1247",
      bestRating: "5",
      worstRating: "1",
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
