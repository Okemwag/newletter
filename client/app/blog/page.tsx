import { Metadata } from 'next'
import Link from 'next/link'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/react'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Learn about email marketing, newsletter growth strategies, African payment integrations, and creator economy insights from the Pulse team.',
  openGraph: {
    title: 'Pulse Blog - Newsletter Marketing & Growth Tips',
    description:
      'Expert guides on email marketing, subscriber growth, and newsletter monetization for African creators.',
  },
}

// Sample blog posts - replace with actual data from CMS/API
const blogPosts = [
  {
    id: 1,
    title: 'How to Grow Your Newsletter from 0 to 10,000 Subscribers',
    excerpt:
      'A comprehensive guide to building your email list using proven strategies, viral referrals, and content marketing.',
    author: 'Sarah Johnson',
    date: '2025-01-15',
    readTime: '8 min read',
    category: 'Growth',
    image: '/placeholder.jpg',
    slug: 'grow-newsletter-10k-subscribers',
  },
  {
    id: 2,
    title: 'Integrating Paystack with Your Newsletter: Complete Guide',
    excerpt:
      'Step-by-step tutorial on accepting payments from Nigerian subscribers using Paystack integration.',
    author: 'David Okonkwo',
    date: '2025-01-10',
    readTime: '6 min read',
    category: 'Monetization',
    image: '/placeholder.jpg',
    slug: 'paystack-integration-guide',
  },
  {
    id: 3,
    title: '10 AI Prompts to Write Better Newsletter Content',
    excerpt:
      'Boost your writing productivity with these AI prompts designed specifically for newsletter creators.',
    author: 'Emily Chen',
    date: '2025-01-05',
    readTime: '5 min read',
    category: 'Content',
    image: '/placeholder.jpg',
    slug: 'ai-prompts-newsletter-writing',
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-cyan-500 to-purple-500">
              <Icon icon="lucide:mail" className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">Pulse</span>
          </Link>
          <Link href="/dashboard">
            <Button size="sm">Dashboard</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border px-6 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">Pulse Blog</h1>
          <p className="text-lg text-muted-foreground">
            Expert guides on email marketing, newsletter growth, and monetization strategies for creators.
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogPosts.map((post) => (
              <article
                key={post.id}
                className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg"
              >
                <Link href={`/blog/${post.slug}`}>
                  <div className="aspect-video overflow-hidden bg-muted">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <div className="mb-3 flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                        {post.category}
                      </span>
                      <span>{post.readTime}</span>
                    </div>
                    <h2 className="mb-2 text-xl font-semibold group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    <p className="mb-4 text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{post.author}</span>
                      <span>•</span>
                      <time dateTime={post.date}>
                        {new Date(post.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </time>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
