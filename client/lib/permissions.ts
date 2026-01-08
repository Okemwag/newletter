/**
 * Permission System for Progressive Dashboard Access
 * Maps creator status to available features and dashboard access
 */

export type CreatorStatus =
  | 'draft'
  | 'email_verified'
  | 'profile_created'
  | 'pricing_set'
  | 'payout_pending_review'
  | 'active_earning'
  | 'payouts_enabled'
  | 'suspended'

export type FeatureKey =
  | 'dashboard_view'
  | 'create_campaign'
  | 'edit_campaign'
  | 'send_campaign'
  | 'import_subscribers'
  | 'export_subscribers'
  | 'create_automation'
  | 'ai_writing'
  | 'view_analytics'
  | 'real_time_data'
  | 'paid_campaigns'
  | 'payouts'
  | 'full_payouts'
  | 'referral_program'
  | 'api_access'

export interface FeatureAccess {
  enabled: boolean
  reason?: string
  ctaText?: string
  ctaAction?: string
}

export interface DashboardAccess {
  canView: boolean
  isReadOnly: boolean
  showMockData: boolean
  features: Record<FeatureKey, FeatureAccess>
  nextStep?: {
    title: string
    description: string
    action: string
    href: string
  }
}

/**
 * Get dashboard access and feature permissions based on creator status
 */
export function getDashboardAccess(status: CreatorStatus): DashboardAccess {
  const baseAccess: DashboardAccess = {
    canView: false,
    isReadOnly: true,
    showMockData: true,
    features: {} as Record<FeatureKey, FeatureAccess>,
  }

  switch (status) {
    case 'draft':
      return {
        ...baseAccess,
        canView: false,
        nextStep: {
          title: 'Complete Signup',
          description: 'Verify your email to access your dashboard',
          action: 'Verify Email',
          href: '/onboarding/verify-email',
        },
        features: {
          dashboard_view: { enabled: false, reason: 'Complete signup first' },
          create_campaign: { enabled: false },
          edit_campaign: { enabled: false },
          send_campaign: { enabled: false },
          import_subscribers: { enabled: false },
          export_subscribers: { enabled: false },
          create_automation: { enabled: false },
          ai_writing: { enabled: false },
          view_analytics: { enabled: false },
          real_time_data: { enabled: false },
          paid_campaigns: { enabled: false },
          payouts: { enabled: false },
          full_payouts: { enabled: false },
          referral_program: { enabled: false },
          api_access: { enabled: false },
        },
      }

    case 'email_verified':
      return {
        ...baseAccess,
        canView: true,
        isReadOnly: true,
        showMockData: true,
        nextStep: {
          title: 'Create Your Profile',
          description: 'Set up your newsletter profile to start creating content',
          action: 'Complete Profile',
          href: '/onboarding/profile',
        },
        features: {
          dashboard_view: { enabled: true },
          create_campaign: { enabled: false, reason: 'Complete your profile first', ctaText: 'Complete Profile', ctaAction: '/onboarding/profile' },
          edit_campaign: { enabled: false },
          send_campaign: { enabled: false },
          import_subscribers: { enabled: false, reason: 'Complete your profile first' },
          export_subscribers: { enabled: false },
          create_automation: { enabled: false, reason: 'Complete your profile first' },
          ai_writing: { enabled: false, reason: 'Complete your profile first' },
          view_analytics: { enabled: true },
          real_time_data: { enabled: false },
          paid_campaigns: { enabled: false },
          payouts: { enabled: false },
          full_payouts: { enabled: false },
          referral_program: { enabled: false },
          api_access: { enabled: false },
        },
      }

    case 'profile_created':
      return {
        ...baseAccess,
        canView: true,
        isReadOnly: false,
        showMockData: true,
        nextStep: {
          title: 'Set Your Pricing',
          description: 'Configure your subscription plans to start earning',
          action: 'Set Pricing',
          href: '/onboarding/pricing',
        },
        features: {
          dashboard_view: { enabled: true },
          create_campaign: { enabled: true },
          edit_campaign: { enabled: true },
          send_campaign: { enabled: true },
          import_subscribers: { enabled: true },
          export_subscribers: { enabled: true },
          create_automation: { enabled: true },
          ai_writing: { enabled: true },
          view_analytics: { enabled: true },
          real_time_data: { enabled: false },
          paid_campaigns: { enabled: false, reason: 'Set pricing to enable paid newsletters', ctaText: 'Set Pricing', ctaAction: '/onboarding/pricing' },
          payouts: { enabled: false },
          full_payouts: { enabled: false },
          referral_program: { enabled: true },
          api_access: { enabled: false },
        },
      }

    case 'pricing_set':
      return {
        ...baseAccess,
        canView: true,
        isReadOnly: false,
        showMockData: false,
        nextStep: {
          title: 'Set Up Payouts',
          description: 'Configure your payout method to receive earnings',
          action: 'Configure Payouts',
          href: '/onboarding/payout',
        },
        features: {
          dashboard_view: { enabled: true },
          create_campaign: { enabled: true },
          edit_campaign: { enabled: true },
          send_campaign: { enabled: true },
          import_subscribers: { enabled: true },
          export_subscribers: { enabled: true },
          create_automation: { enabled: true },
          ai_writing: { enabled: true },
          view_analytics: { enabled: true },
          real_time_data: { enabled: true },
          paid_campaigns: { enabled: true },
          payouts: { enabled: false, reason: 'Funds accumulate but cannot withdraw yet', ctaText: 'Set Up Payouts', ctaAction: '/onboarding/payout' },
          full_payouts: { enabled: false },
          referral_program: { enabled: true },
          api_access: { enabled: true },
        },
      }

    case 'payout_pending_review':
      return {
        ...baseAccess,
        canView: true,
        isReadOnly: false,
        showMockData: false,
        nextStep: {
          title: 'Payout Under Review',
          description: 'Your payout setup is being reviewed. First payout will be available soon.',
          action: 'View Status',
          href: '/billing',
        },
        features: {
          dashboard_view: { enabled: true },
          create_campaign: { enabled: true },
          edit_campaign: { enabled: true },
          send_campaign: { enabled: true },
          import_subscribers: { enabled: true },
          export_subscribers: { enabled: true },
          create_automation: { enabled: true },
          ai_writing: { enabled: true },
          view_analytics: { enabled: true },
          real_time_data: { enabled: true },
          paid_campaigns: { enabled: true },
          payouts: { enabled: true, reason: 'First payout delay and caps enforced' },
          full_payouts: { enabled: false },
          referral_program: { enabled: true },
          api_access: { enabled: true },
        },
      }

    case 'active_earning':
      return {
        ...baseAccess,
        canView: true,
        isReadOnly: false,
        showMockData: false,
        features: {
          dashboard_view: { enabled: true },
          create_campaign: { enabled: true },
          edit_campaign: { enabled: true },
          send_campaign: { enabled: true },
          import_subscribers: { enabled: true },
          export_subscribers: { enabled: true },
          create_automation: { enabled: true },
          ai_writing: { enabled: true },
          view_analytics: { enabled: true },
          real_time_data: { enabled: true },
          paid_campaigns: { enabled: true },
          payouts: { enabled: true, reason: 'Weekly/bi-weekly limits apply' },
          full_payouts: { enabled: false },
          referral_program: { enabled: true },
          api_access: { enabled: true },
        },
      }

    case 'payouts_enabled':
      return {
        ...baseAccess,
        canView: true,
        isReadOnly: false,
        showMockData: false,
        features: {
          dashboard_view: { enabled: true },
          create_campaign: { enabled: true },
          edit_campaign: { enabled: true },
          send_campaign: { enabled: true },
          import_subscribers: { enabled: true },
          export_subscribers: { enabled: true },
          create_automation: { enabled: true },
          ai_writing: { enabled: true },
          view_analytics: { enabled: true },
          real_time_data: { enabled: true },
          paid_campaigns: { enabled: true },
          payouts: { enabled: true },
          full_payouts: { enabled: true },
          referral_program: { enabled: true },
          api_access: { enabled: true },
        },
      }

    case 'suspended':
      return {
        ...baseAccess,
        canView: true,
        isReadOnly: true,
        showMockData: false,
        features: {
          dashboard_view: { enabled: true },
          create_campaign: { enabled: false, reason: 'Account suspended' },
          edit_campaign: { enabled: false, reason: 'Account suspended' },
          send_campaign: { enabled: false, reason: 'Account suspended' },
          import_subscribers: { enabled: false, reason: 'Account suspended' },
          export_subscribers: { enabled: true },
          create_automation: { enabled: false, reason: 'Account suspended' },
          ai_writing: { enabled: false, reason: 'Account suspended' },
          view_analytics: { enabled: true },
          real_time_data: { enabled: true },
          paid_campaigns: { enabled: false, reason: 'Account suspended' },
          payouts: { enabled: false, reason: 'Account suspended' },
          full_payouts: { enabled: false, reason: 'Account suspended' },
          referral_program: { enabled: false, reason: 'Account suspended' },
          api_access: { enabled: false, reason: 'Account suspended' },
        },
      }

    default:
      return baseAccess
  }
}

/**
 * Check if a specific feature is enabled
 */
export function hasFeatureAccess(status: CreatorStatus, feature: FeatureKey): boolean {
  const access = getDashboardAccess(status)
  return access.features[feature]?.enabled ?? false
}

/**
 * Get feature access details
 */
export function getFeatureAccess(status: CreatorStatus, feature: FeatureKey): FeatureAccess {
  const access = getDashboardAccess(status)
  return access.features[feature] ?? { enabled: false, reason: 'Feature not available' }
}

/**
 * Get onboarding progress percentage
 */
export function getOnboardingProgress(status: CreatorStatus): number {
  const progressMap: Record<CreatorStatus, number> = {
    draft: 0,
    email_verified: 20,
    profile_created: 40,
    pricing_set: 60,
    payout_pending_review: 80,
    active_earning: 90,
    payouts_enabled: 100,
    suspended: 0,
  }
  return progressMap[status] ?? 0
}

/**
 * Get status display info
 */
export function getStatusInfo(status: CreatorStatus): {
  label: string
  color: string
  description: string
} {
  const statusMap: Record<CreatorStatus, { label: string; color: string; description: string }> = {
    draft: {
      label: 'Draft',
      color: 'gray',
      description: 'Complete signup to get started',
    },
    email_verified: {
      label: 'Email Verified',
      color: 'blue',
      description: 'Create your profile to continue',
    },
    profile_created: {
      label: 'Profile Created',
      color: 'cyan',
      description: 'Set pricing to enable paid features',
    },
    pricing_set: {
      label: 'Pricing Set',
      color: 'purple',
      description: 'Configure payouts to receive earnings',
    },
    payout_pending_review: {
      label: 'Payout Review',
      color: 'amber',
      description: 'Your payout setup is under review',
    },
    active_earning: {
      label: 'Active & Earning',
      color: 'green',
      description: 'All features unlocked, payouts active',
    },
    payouts_enabled: {
      label: 'Fully Verified',
      color: 'terminal',
      description: 'Full access with no restrictions',
    },
    suspended: {
      label: 'Suspended',
      color: 'red',
      description: 'Account suspended - contact support',
    },
  }
  return statusMap[status] ?? statusMap.draft
}
