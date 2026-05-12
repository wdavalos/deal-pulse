import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment')
}

// Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
  typescript: true,
})

// Price IDs from environment
export const STRIPE_PRICES = {
  free: null,
  pro: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_placeholder',
  agency: process.env.STRIPE_AGENCY_PRICE_ID || 'price_agency_placeholder',
} as const

// Tier limits configuration
export const TIER_LIMITS = {
  free: {
    maxDeals: 1,
    alerts: 'email' as const,
  },
  pro: {
    maxDeals: Infinity,
    alerts: 'discord+email' as const,
  },
  agency: {
    maxDeals: Infinity,
    alerts: 'discord+email' as const,
    teamSize: 5,
  },
} as const

export type Tier = keyof typeof STRIPE_PRICES
export type AlertType = 'email' | 'discord+email'