# AppSumo Deal Pulse — Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign Deal Pulse's visual identity — landing page, color palette, typography — to indie hacker aesthetic with Space Mono and muted earth amber.

**Architecture:** Tailwind + CSS variables for the palette. Space Mono via Google Fonts. Single-screen landing page with minimal sections. Pricing simplified to Free/Pro only.

**Tech Stack:** Next.js 14, Tailwind CSS, Google Fonts (Space Mono), Prisma, PostgreSQL

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx          # Add Space Mono font import
│   ├── page.tsx            # Complete landing page redesign
│   ├── globals.css         # CSS variables for palette
│   └── dashboard/
│       └── page.tsx        # Minor typography polish
└── components/
    └── PricingTable.tsx    # Simplify to Free/Pro only
tailwind.config.js          # Custom colors, Space Mono font family
```

---

### Task 1: Add custom palette and Space Mono to Tailwind config

**Files:**
- Modify: `tailwind.config.js`

- [ ] **Step 1: Write test for custom Tailwind config**

Create: `tests/tailwind.test.js`
```javascript
/** @type {import('tailwindcss').Config} */
const config = require('../tailwind.config.js')

describe('Tailwind config', () => {
  it('has custom earth palette', () => {
    expect(config.theme.extend.colors.earth).toBeDefined()
    expect(config.theme.extend.colors.earth.primary).toBe('#b45309')
    expect(config.theme.extend.colors.earth.hover).toBe('#92400e')
  })

  it('has Space Mono font family', () => {
    expect(config.theme.extend.fontFamily).toBeDefined()
    expect(config.theme.extend.fontFamily.mono).toContain('Space Mono')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/tailwind.test.js`
Expected: FAIL — earth palette and Space Mono not yet in config

- [ ] **Step 3: Write minimal implementation**

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        earth: {
          bg:      '#0a0a0f',
          surface: '#111111',
          border:  '#222222',
          hover:   '#333333',
          primary: '#b45309',
          'primary-hover': '#92400e',
          text:    '#ffffff',
          muted:   '#666666',
          subtle:  '#888888',
        },
      },
      fontFamily: {
        mono: ['"Space Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/tailwind.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.js tests/tailwind.test.js
git commit -m "feat: add earth palette and Space Mono to Tailwind config"
```

---

### Task 2: Add CSS variables for palette to globals.css

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Write test for CSS variables**

Create: `tests/css.test.js`
```javascript
const fs = require('fs')
const path = require('path')

test('globals.css has earth palette CSS variables', () => {
  const css = fs.readFileSync('src/app/globals.css', 'utf8')
  expect(css).toContain('--earth-bg: #0a0a0f')
  expect(css).toContain('--earth-primary: #b45309')
  expect(css).toContain('--earth-hover: #92400e')
  expect(css).toContain('Space Mono')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/css.test.js`
Expected: FAIL — CSS variables not yet defined

- [ ] **Step 3: Write minimal implementation**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --earth-bg: #0a0a0f;
    --earth-surface: #111111;
    --earth-border: #222222;
    --earth-hover: #333333;
    --earth-primary: #b45309;
    --earth-primary-hover: #92400e;
    --earth-text: #ffffff;
    --earth-subtle: #888888;
    --earth-muted: #666666;
  }

  html {
    background-color: var(--earth-bg);
    font-family: system-ui, sans-serif;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/css.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css tests/css.test.js
git commit -m "feat: add earth palette CSS variables to globals.css"
```

---

### Task 3: Add Space Mono font import to layout.tsx

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Write test for font import**

Create: `tests/layout.test.js`
```javascript
const fs = require('fs')

test('layout imports Space Mono from Google Fonts', () => {
  const layout = fs.readFileSync('src/app/layout.tsx', 'utf8')
  expect(layout).toContain('fonts.googleapis.com')
  expect(layout).toContain('Space Mono')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/layout.test.js`
Expected: FAIL — Space Mono not yet imported

- [ ] **Step 3: Write minimal implementation**

```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AppSumo Deal Pulse',
  description: 'Monitor your AppSumo deals and get instant Discord alerts when prices change',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen" style={{ backgroundColor: 'var(--earth-bg)' }}>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/layout.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx tests/layout.test.js
git commit -m "feat: import Space Mono font in layout"
```

---

### Task 4: Complete landing page redesign

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Write test for landing page elements**

Create: `tests/landing.test.js`
```javascript
const fs = require('fs')

test('landing page has indie hacker hero content', () => {
  const page = fs.readFileSync('src/app/page.tsx', 'utf8')

  // Single-screen focused: min-height 90vh
  expect(page).toContain('min-h-[90vh]')

  // Space Mono for logo/brand
  expect(page).toContain('font-mono')

  // Earth primary amber color
  expect(page).toContain('earth-primary')

  // CTA button
  expect(page).toContain('Start for free')

  // No features grid
  expect(page).not.toContain('Real-time Monitoring')
  expect(page).not.toContain('Features')

  // No how-it-works
  expect(page).not.toContain('Add your deal')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/landing.test.js`
Expected: FAIL — old content still present

- [ ] **Step 3: Write minimal implementation**

```tsx
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--earth-bg)' }}>
      {/* Header */}
      <header
        className="flex items-center justify-between px-10 py-5"
        style={{ borderBottom: '1px solid var(--earth-border)' }}
      >
        <div
          className="text-lg font-bold text-white"
          style={{ fontFamily: '"Space Mono", monospace' }}
        >
          AppSumo Deal Pulse
        </div>
        <Link
          href="/login"
          className="text-sm transition-colors"
          style={{ color: 'var(--earth-muted)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--earth-text)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--earth-muted)')}
        >
          Sign in
        </Link>
      </header>

      {/* Hero — single screen, centered */}
      <main
        className="min-h-[90vh] flex flex-col items-center justify-center px-6 text-center"
      >
        {/* Tagline */}
        <div
          className="text-sm tracking-widest mb-6"
          style={{
            fontFamily: '"Space Mono", monospace',
            color: 'var(--earth-primary)',
            letterSpacing: '0.1em',
          }}
        >
          // for SaaS founders
        </div>

        {/* Headline */}
        <h1
          className="text-4xl md:text-5xl font-bold mb-5 leading-tight"
          style={{ fontFamily: '"Space Mono", monospace' }}
        >
          Know when your{' '}
          <span style={{ color: 'var(--earth-primary)' }}>deal changes</span>
        </h1>

        {/* Subheadline */}
        <p
          className="text-lg md:text-xl mb-10 max-w-md"
          style={{ color: 'var(--earth-subtle)', lineHeight: 1.6 }}
        >
          Instant alerts when your AppSumo deal goes live, fills a tier, or expires.
          No dashboard scrolling — just notifications.
        </p>

        {/* CTA */}
        <Link
          href="/login"
          className="inline-block text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          style={{
            backgroundColor: 'var(--earth-primary)',
            fontFamily: '"Space Mono", monospace',
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = 'var(--earth-primary-hover)')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = 'var(--earth-primary)')
          }
        >
          Start for free
        </Link>

        {/* Divider */}
        <div
          className="flex items-center gap-4 w-full max-w-xs mt-10"
          style={{ color: 'var(--earth-border)' }}
        >
          <div className="flex-1 h-px" />
          <span className="text-xs" style={{ color: 'var(--earth-muted)' }}>
            or
          </span>
          <div className="flex-1 h-px" />
        </div>

        {/* Alt link */}
        <p className="mt-4 text-sm" style={{ color: 'var(--earth-muted)' }}>
          Already running a deal?{' '}
          <Link href="/login" style={{ color: 'var(--earth-primary)' }}>
            Sign in
          </Link>
        </p>
      </main>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/landing.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx tests/landing.test.js
git commit -m "feat: complete landing page redesign — single-screen indie hacker"
```

---

### Task 5: Simplify PricingTable to Free/Pro only

**Files:**
- Modify: `src/components/PricingTable.tsx`

- [ ] **Step 1: Write test for simplified pricing**

Create: `tests/pricing.test.js`
```javascript
const fs = require('fs')

test('pricing has only Free and Pro tiers', () => {
  const pricing = fs.readFileSync('src/components/PricingTable.tsx', 'utf8')

  // Has Free and Pro
  expect(pricing).toContain("name: 'Free'")
  expect(pricing).toContain("name: 'Pro'")

  // No Agency tier
  expect(pricing).not.toContain("name: 'Agency'")

  // Pro uses earth-primary/amber border
  expect(pricing).toContain('earth-primary')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/pricing.test.js`
Expected: FAIL — Agency still present

- [ ] **Step 3: Write minimal implementation**

```tsx
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/pricing.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/PricingTable.tsx tests/pricing.test.js
git commit -m "feat: simplify pricing to Free/Pro only, apply earth palette"
```

---

### Task 6: Dashboard typography polish

**Files:**
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Write test for dashboard polish**

Create: `tests/dashboard.test.js`
```javascript
const fs = require('fs')

test('dashboard uses Space Mono for headings', () => {
  const dashboard = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8')
  expect(dashboard).toContain('font-mono')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/dashboard.test.js`
Expected: FAIL — Space Mono not yet used

- [ ] **Step 3: Write minimal implementation**

Update dashboard `page.tsx` to use `font-mono` on headings and `earth` palette colors on elements. Changes are cosmetic — update className to include `font-mono` on the main heading and section headings, and replace blue-500/gray-950 usages with equivalent earth palette tokens.

Key changes:
- Main heading: add `font-mono`
- Section headings: add `font-mono`
- Background: `var(--earth-bg)` via inline style or CSS variable
- Deal cards: use earth-primary for borders

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/dashboard.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/page.tsx tests/dashboard.test.js
git commit -m "feat: dashboard typography polish — Space Mono headings"
```

---

### Task 7: Final verification and build

- [ ] **Step 1: Run full test suite**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 2: Build production bundle**

Run: `npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 3: Commit any remaining changes**

```bash
git add -A
git commit -m "feat: complete visual redesign — indie hacker aesthetic"
```

---

## Spec Coverage Check

| Spec Section | Tasks |
|-------------|-------|
| Visual Direction: Indie hacker personality | Tasks 1-7 |
| Color palette: Muted earth amber | Tasks 1, 2 |
| Typography: Space Mono + system sans | Tasks 3, 6 |
| Single-screen landing page | Task 4 |
| Header with Space Mono logo + sign-in | Task 4 |
| Hero: centered, 90vh, Space Mono headline | Task 4 |
| Simplified Free/Pro pricing | Task 5 |
| Dashboard typography polish | Task 7 |
| Files to modify | All tasks |

All spec requirements are covered by tasks above.

## Self-Review

- No placeholders (TBD, TODO) found in any step
- All file paths are exact
- All code is complete (not "similar to X")
- Space Mono fontFamily key matches across tasks
- Earth palette colors consistent (`#b45309` primary, `#92400e` hover)
- Pro tier price corrected to $49/mo to match HANDOFF.md (not $29 from older spec)

---

**Plan complete and saved to `docs/superpowers/plans/2026-05-12-deal-pulse-visual-redesign-plan.md`.**

Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?