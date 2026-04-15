import Stripe from 'stripe'

export function getStripe(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY ?? '')
}

export const PLANS = {
  starter: {
    name: 'Single Venue',
    price: 39,
    priceId: process.env.STRIPE_PRICE_STARTER!,
    venues: 1,
    features: [
      '1 venue location',
      'Unlimited events',
      'Pre & post walkthroughs',
      'AI Comparison Engine',
      'Deposit deduction reports',
      'PDF export',
      'Digital client signature',
    ],
  },
  pro: {
    name: 'Multi-Venue',
    price: 79,
    priceId: process.env.STRIPE_PRICE_PRO!,
    venues: 5,
    features: [
      'Up to 5 venue locations',
      'Unlimited events',
      'Pre & post walkthroughs',
      'AI Comparison Engine',
      'Deposit deduction reports',
      'PDF export',
      'Digital client signature',
      'Seasonal analytics',
      'Priority support',
    ],
  },
  enterprise: {
    name: 'Portfolio',
    price: 149,
    priceId: process.env.STRIPE_PRICE_ENTERPRISE!,
    venues: 999,
    features: [
      'Unlimited venue locations',
      'Unlimited events',
      'Pre & post walkthroughs',
      'AI Comparison Engine',
      'Deposit deduction reports',
      'PDF export',
      'Digital client signature',
      'Seasonal analytics',
      'White-label reports',
      'Priority support',
      'Team members',
    ],
  },
} as const

export type PlanKey = keyof typeof PLANS
