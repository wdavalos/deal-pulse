'use client'

import { useState } from 'react'

interface PricingTableProps {
  currentTier?: string
  userId?: string
}

interface TierInfo {
  name: string
  price: number
  description: string
  features: string[]
  highlighted?: boolean
}

const TIERS: TierInfo[] = [
  {
    name: 'Free',
    price: 0,
    description: 'For individuals just getting started',
    features: [
      '1 AppSumo Deal',
      'Email notifications',
      'Basic RSS monitoring',
    ],
  },
  {
    name: 'Pro',
    price: 29,
    description: 'For professionals who need more',
    features: [
      'Unlimited AppSumo Deals',
      'Discord + Email alerts',
      'Priority support',
      'Advanced monitoring',
    ],
    highlighted: true,
  },
  {
    name: 'Agency',
    price: 99,
    description: 'For agencies managing multiple clients',
    features: [
      'Everything in Pro',
      'Team collaboration (5 seats)',
      'Client management',
      'White-label reports',
    ],
  },
]

export function PricingTable({ currentTier, userId }: PricingTableProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleUpgrade = async (tier: string) => {
    if (!userId) {
      alert('Please log in to upgrade')
      return
    }

    setLoading(tier)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, userId }),
      })

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Failed to create checkout session')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to create checkout session')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {TIERS.map((tier) => {
        const isCurrentTier = currentTier === tier.name.toLowerCase()
        const isFreeTier = tier.price === 0

        return (
          <div
            key={tier.name}
            className={`relative rounded-xl border p-6 ${
              tier.highlighted
                ? 'border-blue-500 bg-blue-950/20 shadow-lg shadow-blue-500/10'
                : 'border-gray-800 bg-gray-900/50'
            }`}
          >
            {tier.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-blue-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
            )}

            {isCurrentTier && (
              <div className="absolute top-4 right-4">
                <span className="bg-green-500/20 text-green-400 text-xs font-medium px-2 py-1 rounded border border-green-500/30">
                  Current Plan
                </span>
              </div>
            )}

            <div className="mb-4">
              <h3 className="text-xl font-bold text-white mb-1">{tier.name}</h3>
              <p className="text-sm text-gray-400">{tier.description}</p>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-white">${tier.price}</span>
              {tier.price > 0 && (
                <span className="text-gray-400 ml-1">/month</span>
              )}
            </div>

            <ul className="space-y-3 mb-6">
              {tier.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                  <svg
                    className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleUpgrade(tier.name.toLowerCase())}
              disabled={loading !== null || isCurrentTier || isFreeTier}
              className={`w-full py-2.5 px-4 rounded-lg font-medium transition-colors ${
                isCurrentTier
                  ? 'bg-gray-800 text-gray-400 cursor-not-allowed'
                  : isFreeTier
                  ? 'bg-gray-700 text-gray-300 cursor-not-allowed'
                  : loading === tier.name.toLowerCase()
                  ? 'bg-blue-600 text-white cursor-wait'
                  : tier.highlighted
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            >
              {loading === tier.name.toLowerCase()
                ? 'Loading...'
                : isCurrentTier
                ? 'Current Plan'
                : isFreeTier
                ? 'Free Tier'
                : `Upgrade to ${tier.name}`}
            </button>
          </div>
        )
      })}
    </div>
  )
}