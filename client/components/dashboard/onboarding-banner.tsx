"use client"

import { X, CheckCircle2, Circle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { CreatorStatus, getDashboardAccess, getOnboardingProgress } from '@/lib/permissions'
import { useState } from 'react'
import Link from 'next/link'

interface OnboardingBannerProps {
  status: CreatorStatus
  onDismiss?: () => void
}

const onboardingSteps = [
  { key: 'email', label: 'Email', status: 'email_verified' },
  { key: 'profile', label: 'Profile', status: 'profile_created' },
  { key: 'pricing', label: 'Pricing', status: 'pricing_set' },
  { key: 'payout', label: 'Payout', status: 'payout_pending_review' },
]

export function OnboardingBanner({ status, onDismiss }: OnboardingBannerProps) {
  const [dismissed, setDismissed] = useState(false)
  const access = getDashboardAccess(status)
  const progress = getOnboardingProgress(status)

  // Don't show banner if fully verified or suspended
  if (status === 'payouts_enabled' || status === 'suspended' || dismissed) {
    return null
  }

  // Don't show if no next step
  if (!access.nextStep) {
    return null
  }

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  const getStepStatus = (stepStatus: string): 'complete' | 'current' | 'pending' => {
    const statusOrder = ['draft', 'email_verified', 'profile_created', 'pricing_set', 'payout_pending_review', 'active_earning', 'payouts_enabled']
    const currentIndex = statusOrder.indexOf(status)
    const stepIndex = statusOrder.indexOf(stepStatus)

    if (stepIndex < currentIndex) return 'complete'
    if (stepIndex === currentIndex) return 'current'
    return 'pending'
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-r from-terminal/10 via-cyan/5 to-purple/10 p-6 mb-6">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-terminal/5 via-transparent to-cyan/5 opacity-50" />

      {/* Close button */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="relative">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {access.nextStep.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {access.nextStep.description}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">
              Setup Progress
            </span>
            <span className="text-xs font-medium text-terminal">
              {progress}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step tracker */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {onboardingSteps.map((step, index) => {
            const stepStatus = getStepStatus(step.status)
            return (
              <div key={step.key} className="flex items-center gap-2 flex-shrink-0">
                <div
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                    stepStatus === 'complete' && 'bg-terminal/20 text-terminal',
                    stepStatus === 'current' && 'bg-cyan/20 text-cyan ring-2 ring-cyan/50',
                    stepStatus === 'pending' && 'bg-muted text-muted-foreground'
                  )}
                >
                  {stepStatus === 'complete' ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <Circle className="h-3 w-3" />
                  )}
                  <span>{step.label}</span>
                </div>
                {index < onboardingSteps.length - 1 && (
                  <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                )}
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <Link href={access.nextStep.href}>
          <Button className="w-full sm:w-auto bg-gradient-to-r from-terminal to-cyan hover:from-terminal/90 hover:to-cyan/90">
            {access.nextStep.action}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
