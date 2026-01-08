"use client"

import { Lock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface FeatureLockOverlayProps {
  reason: string
  ctaText?: string
  ctaAction?: string
  className?: string
}

export function FeatureLockOverlay({
  reason,
  ctaText,
  ctaAction,
  className,
}: FeatureLockOverlayProps) {
  return (
    <div
      className={cn(
        'absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg',
        className
      )}
    >
      <div className="text-center p-6 max-w-sm">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground mb-4">{reason}</p>
        {ctaText && ctaAction && (
          <Link href={ctaAction}>
            <Button size="sm" variant="outline">
              {ctaText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
