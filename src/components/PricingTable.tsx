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
    price: 49,
    description: 'For founders running serious AppSumo deals',
    features: [
      'Unlimited AppSumo Deals',
      'Discord + Email alerts',
      'Priority support',
      'Advanced monitoring',
    ],
    highlighted: true,
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
      {TIERS.map((tier) => {
        const isCurrentTier = currentTier === tier.name.toLowerCase()
        const isFreeTier = tier.price === 0

        return (
          <div
            key={tier.name}
            className={`relative rounded-xl p-6 ${
              tier.highlighted
                ? 'border-2 shadow-lg'
                : 'border'
            }`}
            style={{
              borderColor: tier.highlighted ? 'var(--earth-primary)' : 'var(--earth-border)',
              backgroundColor: 'var(--earth-surface)',
            }}
          >
            {tier.highlighted && (
              <div
                className="absolute -top-3 left-1/2 -translate-x-1/2"
                style={{
                  backgroundColor: 'var(--earth-primary)',
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: 500,
                  padding: '3px 10px',
                  borderRadius: '9999px',
                }}
              >
                Most Popular
              </div>
            )}

            {isCurrentTier && (
              <div
                className="absolute top-4 right-4"
                style={{
                  backgroundColor: 'rgba(34, 197, 94, 0.2)',
                  color: '#4ade80',
                  fontSize: '11px',
                  fontWeight: 500,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                }}
              >
                Current Plan
              </div>
            )}

            <div className="mb-4">
              <h3
                className="text-xl font-bold mb-1"
                style={{
                  fontFamily: '"Space Mono", monospace',
                  color: 'var(--earth-text)',
                }}
              >
                {tier.name}
              </h3>
              <p className="text-sm" style={{ color: 'var(--earth-subtle)' }}>
                {tier.description}
              </p>
            </div>

            <div className="mb-6">
              <span
                className="text-4xl font-bold"
                style={{ color: 'var(--earth-text)', fontFamily: '"Space Mono", monospace' }}
              >
                ${tier.price}
              </span>
              {tier.price > 0 && (
                <span className="text-sm ml-1" style={{ color: 'var(--earth-muted)' }}>
                  /month
                </span>
              )}
            </div>

            <ul className="space-y-3 mb-6">
              {tier.features.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm"
                  style={{ color: 'var(--earth-subtle)' }}
                >
                  <svg
                    className="w-5 h-5 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: 'var(--earth-primary)' }}
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
              className="w-full py-2.5 px-4 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor:
                  isCurrentTier || isFreeTier
                    ? 'var(--earth-border)'
                    : loading === tier.name.toLowerCase()
                    ? 'var(--earth-hover)'
                    : tier.highlighted
                    ? 'var(--earth-primary)'
                    : 'var(--earth-surface)',
                color:
                  isCurrentTier || isFreeTier
                    ? 'var(--earth-muted)'
                    : 'white',
                cursor:
                  isCurrentTier || isFreeTier ? 'not-allowed' : 'pointer',
                fontFamily: '"Space Mono", monospace',
                border: `1px solid ${tier.highlighted && !isCurrentTier && !isFreeTier ? 'var(--earth-primary)' : 'var(--earth-border)'}`,
              }}
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
