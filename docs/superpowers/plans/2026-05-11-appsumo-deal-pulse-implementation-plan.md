# AppSumo Deal Pulse Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build AppSumo Deal Pulse — an alert system that monitors AppSumo deal activity and notifies SaaS founders when their deals go live, fill tiers, or expire.

**Architecture:** Next.js App Router with serverless API routes, SQLite via Prisma ORM, Discord webhooks for alerts, Stripe for subscription billing, deployed on Vercel with cron jobs.

**Tech Stack:** Next.js 14+, Prisma, SQLite, TypeScript, Stripe, Resend (email), Vercel (hosting + cron)

---

## File Structure

```
appsumo-deal-pulse/
├── prisma/
│   └── schema.prisma              # Database schema
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── dashboard/
│   │   │   └── page.tsx          # User dashboard
│   │   ├── api/
│   │   │   ├── deals/route.ts    # Deal CRUD
│   │   │   ├── events/route.ts   # Event log
│   │   │   ├── alerts/route.ts   # Test alerts
│   │   │   ├── auth/route.ts     # Magic link auth
│   │   │   └── stripe/route.ts   # Stripe webhook + checkout
│   │   ├── login/page.tsx        # Magic link login
│   │   └── layout.tsx
│   ├── lib/
│   │   ├── prisma.ts             # Prisma client
│   │   ├── appsumo.ts            # AppSumo RSS parser
│   │   ├── partnerstack.ts       # PartnerStack API client
│   │   ├── discord.ts            # Discord webhook sender
│   │   ├── stripe.ts             # Stripe helpers
│   │   └── auth.ts               # Auth utilities
│   └── components/
│       ├── DealCard.tsx
│       ├── EventLog.tsx
│       └── PricingTable.tsx
├── scripts/
│   └── cron.ts                   # Vercel cron job
├── tests/
│   ├── appsumo.test.ts
│   ├── partnerstack.test.ts
│   └── discord.test.ts
└── package.json
```

---

## Task 1: Project Setup

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.js`
- Create: `prisma/schema.prisma`
- Create: `src/lib/prisma.ts`
- Test: `tests/prisma.test.ts`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "appsumo-deal-pulse",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "test": "jest"
  },
  "dependencies": {
    "next": "14.2.0",
    "react": "18.3.0",
    "react-dom": "18.3.0",
    "@prisma/client": "5.14.0",
    "stripe": "15.0.0",
    "resend": "3.3.0",
    "rss-parser": "3.13.0",
    "zod": "3.23.0"
  },
  "devDependencies": {
    "@types/node": "20.12.0",
    "@types/react": "18.3.0",
    "@types/react-dom": "18.3.0",
    "prisma": "5.14.0",
    "typescript": "5.4.0",
    "jest": "29.7.0",
    "@types/jest": "29.5.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create next.config.js**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
```

- [ ] **Step 4: Create prisma/schema.prisma**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String?
  tier          String    @default("free")
  stripeCustomerId String?
  createdAt     DateTime  @default(now())
  deals         Deal[]
}

model Deal {
  id                String    @id @default(cuid())
  userId            String
  user              User      @relation(fields: [userId], references: [id])
  appsumoUrl        String
  partnerstackApiKey String?
  status            String    @default("active")
  lastChecked       DateTime?
  createdAt         DateTime  @default(now())
  events            Event[]
}

model Event {
  id          String    @id @default(cuid())
  dealId      String
  deal        Deal      @relation(fields: [dealId], references: [id])
  type        String    // live | tier_filled | expired
  details     String?
  occurredAt  DateTime  @default(now())
  notifiedAt  DateTime?
}

model MagicLink {
  id        String   @id @default(cuid())
  email     String
  token     String   @unique
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime @default(now())
}
```

- [ ] **Step 5: Create src/lib/prisma.ts**

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

- [ ] **Step 6: Install dependencies**

Run: `npm install`

Expected: Packages installed, `node_modules` created

- [ ] **Step 7: Generate Prisma client**

Run: `npx prisma generate`

Expected: `Generated Prisma Client`

- [ ] **Step 8: Push schema to database**

Run: `npx prisma db push`

Expected: `Your database is now in sync with your schema`

- [ ] **Step 9: Create tests/prisma.test.ts**

```typescript
import { prisma } from '@/lib/prisma'

describe('Database', () => {
  it('should connect to database', async () => {
    await expect(prisma.user.count()).resolves.toBeGreaterThanOrEqual(0)
  })
})
```

- [ ] **Step 10: Run test**

Run: `npm test`

Expected: PASS

- [ ] **Step 11: Commit**

```bash
git add package.json tsconfig.json next.config.js prisma/schema.prisma src/lib/prisma.ts
git commit -m "feat: project setup with Next.js and Prisma"
```

---

## Task 2: AppSumo RSS Parser

**Files:**
- Create: `src/lib/appsumo.ts`
- Create: `src/types/appsumo.ts`
- Modify: `tests/appsumo.test.ts`

- [ ] **Step 1: Create src/types/appsumo.ts**

```typescript
export interface AppSumoDeal {
  title: string
  url: string
  status: 'live' | 'expired'
  tier?: string
  publishedAt: Date
}

export interface AppSumoEvent {
  type: 'live' | 'tier_filled' | 'expired'
  dealUrl: string
  details: string
  occurredAt: Date
}
```

- [ ] **Step 2: Create src/lib/appsumo.ts**

```typescript
import Parser from 'rss-parser'
import { AppSumoDeal, AppSumoEvent } from '@/types/appsumo'

const parser = new Parser({
  customFields: {
    item: ['title', 'link', 'pubDate'],
  },
})

const APPSUMO_RSS_URL = 'https://appsumo.com/feed/deals'

export async function fetchAppSumoDeals(): Promise<AppSumoDeal[]> {
  const feed = await parser.parseURL(APPSUMO_RSS_URL)

  return feed.items.map((item) => ({
    title: item.title || '',
    url: item.link || '',
    status: item.title?.toLowerCase().includes('expired') ? 'expired' : 'live',
    publishedAt: new Date(item.pubDate || Date.now()),
  }))
}

export function detectAppSumoEvents(
  oldDeals: AppSumoDeal[],
  newDeals: AppSumoDeal[]
): AppSumoEvent[] {
  const events: AppSumoEvent[] = []
  const oldUrls = new Set(oldDeals.map((d) => d.url))

  for (const newDeal of newDeals) {
    const oldDeal = oldDeals.find((d) => d.url === newDeal.url)

    if (!oldDeal) {
      // New deal appeared
      events.push({
        type: 'live',
        dealUrl: newDeal.url,
        details: `New deal: ${newDeal.title}`,
        occurredAt: newDeal.publishedAt,
      })
    } else if (oldDeal.status === 'live' && newDeal.status === 'expired') {
      // Deal expired
      events.push({
        type: 'expired',
        dealUrl: newDeal.url,
        details: `Deal expired: ${newDeal.title}`,
        occurredAt: new Date(),
      })
    }
  }

  return events
}
```

- [ ] **Step 3: Create tests/appsumo.test.ts**

```typescript
import { fetchAppSumoDeals, detectAppSumoEvents } from '@/lib/appsumo'

describe('AppSumo Parser', () => {
  it('should fetch deals from RSS', async () => {
    const deals = await fetchAppSumoDeals()
    expect(Array.isArray(deals)).toBe(true)
  })

  it('should detect new deals', () => {
    const oldDeals = []
    const newDeals = [
      { title: 'Test Deal', url: 'https://appsumo.com/deals/test', status: 'live', publishedAt: new Date() },
    ]
    const events = detectAppSumoEvents(oldDeals, newDeals)
    expect(events).toHaveLength(1)
    expect(events[0].type).toBe('live')
  })
})
```

- [ ] **Step 4: Run test**

Run: `npm test -- tests/appsumo.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/appsumo.ts src/types/appsumo.ts tests/appsumo.test.ts
git commit -m "feat: add AppSumo RSS parser"
```

---

## Task 3: PartnerStack API Integration

**Files:**
- Create: `src/lib/partnerstack.ts`
- Create: `src/types/partnerstack.ts`
- Create: `tests/partnerstack.test.ts`

- [ ] **Step 1: Create src/types/partnerstack.ts**

```typescript
export interface PartnerStackDeal {
  id: string
  status: 'active' | 'paused' | 'exhausted'
  tierCurrent: number
  tierMax: number
  lastSyncedAt: Date
}

export interface PartnerStackAffiliate {
  id: string
  email: string
  status: 'active' | 'churned'
}
```

- [ ] **Step 2: Create src/lib/partnerstack.ts**

```typescript
import { PartnerStackDeal } from '@/types/partnerstack'

const PARTNERSTACK_API_URL = 'https://api.partnerstack.com/api/v2'

interface PartnerStackResponse<T> {
  data: T[]
  meta?: {
    next?: string
  }
}

export async function fetchPartnerStackDeal(
  apiKey: string,
  dealId: string
): Promise<PartnerStackDeal | null> {
  const response = await fetch(
    `${PARTNERSTACK_API_URL}/deals/${dealId}`,
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!response.ok) {
    if (response.status === 404) return null
    throw new Error(`PartnerStack API error: ${response.status}`)
  }

  const data = await response.json()

  return {
    id: data.id,
    status: data.status,
    tierCurrent: data.tier_current || 0,
    tierMax: data.tier_max || 3,
    lastSyncedAt: new Date(),
  }
}

export async function fetchAllPartnerStackDeals(apiKey: string): Promise<PartnerStackDeal[]> {
  const response = await fetch(`${PARTNERSTACK_API_URL}/deals`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`PartnerStack API error: ${response.status}`)
  }

  const data: PartnerStackResponse<PartnerStackDeal> = await response.json()
  return data.data
}

export function detectTierChange(
  oldDeal: PartnerStackDeal | null,
  newDeal: PartnerStackDeal
): boolean {
  if (!oldDeal) return false
  return oldDeal.tierCurrent !== newDeal.tierCurrent
}
```

- [ ] **Step 3: Create tests/partnerstack.test.ts**

```typescript
import { detectTierChange } from '@/lib/partnerstack'

describe('PartnerStack', () => {
  it('should detect tier change', () => {
    const oldDeal = { id: '1', status: 'active', tierCurrent: 1, tierMax: 3, lastSyncedAt: new Date() }
    const newDeal = { id: '1', status: 'active', tierCurrent: 2, tierMax: 3, lastSyncedAt: new Date() }
    expect(detectTierChange(oldDeal, newDeal)).toBe(true)
  })

  it('should not detect change when same tier', () => {
    const oldDeal = { id: '1', status: 'active', tierCurrent: 2, tierMax: 3, lastSyncedAt: new Date() }
    const newDeal = { id: '1', status: 'active', tierCurrent: 2, tierMax: 3, lastSyncedAt: new Date() }
    expect(detectTierChange(oldDeal, newDeal)).toBe(false)
  })
})
```

- [ ] **Step 4: Run test**

Run: `npm test -- tests/partnerstack.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/partnerstack.ts src/types/partnerstack.ts tests/partnerstack.test.ts
git commit -m "feat: add PartnerStack API integration"
```

---

## Task 4: Discord Webhook Alerts

**Files:**
- Create: `src/lib/discord.ts`
- Create: `tests/discord.test.ts`

- [ ] **Step 1: Create src/lib/discord.ts**

```typescript
export interface DiscordAlert {
  type: 'live' | 'tier_filled' | 'expired'
  dealTitle: string
  dealUrl: string
  details?: string
}

export interface DiscordWebhookPayload {
  content: string
  embeds: Array<{
    title: string
    url: string
    description: string
    color: number
    timestamp: string
  }>
}

function getAlertColor(type: DiscordAlert['type']): number {
  switch (type) {
    case 'live': return 0x00ff00 // Green
    case 'tier_filled': return 0xffaa00 // Orange
    case 'expired': return 0xff0000 // Red
  }
}

function getAlertTitle(type: DiscordAlert['type']): string {
  switch (type) {
    case 'live': return '🎉 Deal is LIVE!'
    case 'tier_filled': return '⚠️ Tier Filled!'
    case 'expired': return '❌ Deal Expired'
  }
}

export function buildDiscordPayload(alert: DiscordAlert): DiscordWebhookPayload {
  return {
    content: `@here New AppSumo deal activity!`,
    embeds: [
      {
        title: getAlertTitle(alert.type),
        url: alert.dealUrl,
        description: alert.details || alert.dealTitle,
        color: getAlertColor(alert.type),
        timestamp: new Date().toISOString(),
      },
    ],
  }
}

export async function sendDiscordAlert(
  webhookUrl: string,
  alert: DiscordAlert
): Promise<boolean> {
  const payload = buildDiscordPayload(alert)

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  return response.ok
}
```

- [ ] **Step 2: Create tests/discord.test.ts**

```typescript
import { buildDiscordPayload } from '@/lib/discord'

describe('Discord Alerts', () => {
  it('should build live deal payload', () => {
    const payload = buildDiscordPayload({
      type: 'live',
      dealTitle: 'Test Deal',
      dealUrl: 'https://appsumo.com/deals/test',
    })
    expect(payload.embeds[0].color).toBe(0x00ff00)
    expect(payload.embeds[0].title).toContain('LIVE')
  })

  it('should build tier filled payload', () => {
    const payload = buildDiscordPayload({
      type: 'tier_filled',
      dealTitle: 'Test Deal',
      dealUrl: 'https://appsumo.com/deals/test',
      details: 'Tier 2 of 3 filled',
    })
    expect(payload.embeds[0].color).toBe(0xffaa00)
  })

  it('should build expired payload', () => {
    const payload = buildDiscordPayload({
      type: 'expired',
      dealTitle: 'Test Deal',
      dealUrl: 'https://appsumo.com/deals/test',
    })
    expect(payload.embeds[0].color).toBe(0xff0000)
  })
})
```

- [ ] **Step 3: Run test**

Run: `npm test -- tests/discord.test.ts`

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/lib/discord.ts tests/discord.test.ts
git commit -m "feat: add Discord webhook alerts"
```

---

## Task 5: Dashboard UI

**Files:**
- Create: `src/app/dashboard/page.tsx`
- Create: `src/components/DealCard.tsx`
- Create: `src/components/EventLog.tsx`

- [ ] **Step 1: Create src/app/dashboard/page.tsx**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { DealCard } from '@/components/DealCard'
import { EventLog } from '@/components/EventLog'

interface Deal {
  id: string
  appsumoUrl: string
  status: string
  lastChecked: string | null
  events: Array<{
    id: string
    type: string
    details: string | null
    occurredAt: string
  }>
}

export default function DashboardPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/deals')
      .then((res) => res.json())
      .then((data) => {
        setDeals(data)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 px-8 py-4">
        <h1 className="text-2xl font-bold">AppSumo Deal Pulse</h1>
      </header>

      <main className="p-8">
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Your Deals</h2>
          <div className="grid gap-4">
            {deals.length === 0 ? (
              <p className="text-gray-500">No deals connected yet.</p>
            ) : (
              deals.map((deal) => <DealCard key={deal.id} deal={deal} />)
            )}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Event Log</h2>
          <EventLog events={deals.flatMap((d) => d.events)} />
        </section>
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Create src/components/DealCard.tsx**

```tsx
import { ExternalLink } from 'lucide-react'

interface DealCardProps {
  deal: {
    id: string
    appsumoUrl: string
    status: string
    lastChecked: string | null
  }
}

export function DealCard({ deal }: DealCardProps) {
  return (
    <div className="border border-gray-800 rounded-lg p-4 bg-gray-900 hover:border-gray-700 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">{deal.appsumoUrl}</h3>
          <p className="text-sm text-gray-500">
            Last checked: {deal.lastChecked ? new Date(deal.lastChecked).toLocaleString() : 'Never'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded text-xs ${
              deal.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-gray-800 text-gray-400'
            }`}
          >
            {deal.status}
          </span>
          <a
            href={deal.appsumoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-gray-800 rounded"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create src/components/EventLog.tsx**

```tsx
interface EventLogProps {
  events: Array<{
    id: string
    type: string
    details: string | null
    occurredAt: string
  }>
}

function getEventIcon(type: string): string {
  switch (type) {
    case 'live': return '🎉'
    case 'tier_filled': return '⚠️'
    case 'expired': return '❌'
    default: return '📌'
  }
}

export function EventLog({ events }: EventLogProps) {
  if (events.length === 0) {
    return <p className="text-gray-500">No events yet.</p>
  }

  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden">
      {events.map((event, i) => (
        <div
          key={event.id}
          className={`flex items-start gap-3 p-4 ${i !== events.length - 1 ? 'border-b border-gray-800' : ''}`}
        >
          <span className="text-xl">{getEventIcon(event.type)}</span>
          <div className="flex-1">
            <p className="font-medium capitalize">{event.type.replace('_', ' ')}</p>
            <p className="text-sm text-gray-400">{event.details || 'No details'}</p>
            <p className="text-xs text-gray-600 mt-1">
              {new Date(event.occurredAt).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/page.tsx src/components/DealCard.tsx src/components/EventLog.tsx
git commit -m "feat: add dashboard UI with DealCard and EventLog"
```

---

## Task 6: Auth (Magic Link)

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/app/login/page.tsx`
- Create: `src/app/api/auth/route.ts`
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add MagicLink model to prisma/schema.prisma**

```prisma
model MagicLink {
  id        String   @id @default(cuid())
  email     String
  token     String   @unique
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime @default(now())
}
```

- [ ] **Step 2: Create src/lib/auth.ts**

```typescript
import { prisma } from './prisma'
import { randomBytes, createHash } from 'crypto'

export function generateMagicLinkToken(): string {
  return randomBytes(32).toString('hex')
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export async function createMagicLink(email: string): Promise<string> {
  const token = generateMagicLinkToken()
  const hashedToken = hashToken(token)
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

  await prisma.magicLink.create({
    data: {
      email,
      token: hashedToken,
      expiresAt,
    },
  })

  return token
}

export async function verifyMagicLink(token: string): Promise<string | null> {
  const hashedToken = hashToken(token)

  const magicLink = await prisma.magicLink.findUnique({
    where: { token: hashedToken },
  })

  if (!magicLink) return null
  if (magicLink.usedAt) return null
  if (magicLink.expiresAt < new Date()) return null

  await prisma.magicLink.update({
    where: { id: magicLink.id },
    data: { usedAt: new Date() },
  })

  let user = await prisma.user.findUnique({ where: { email: magicLink.email } })
  if (!user) {
    user = await prisma.user.create({ data: { email: magicLink.email } })
  }

  return user.id
}
```

- [ ] **Step 3: Create src/app/api/auth/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createMagicLink } from '@/lib/auth'
import { resend } from '@/lib/email'

export async function POST(request: NextRequest) {
  const { email } = await request.json()

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const token = await createMagicLink(email)
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify?token=${token}`

  await resend.emails.send({
    from: 'AppSumo Deal Pulse <noreply@appsumodealpulse.com>',
    to: email,
    subject: 'Your AppSumo Deal Pulse login link',
    html: `Click to login: <a href="${loginUrl}">${loginUrl}</a>`,
  })

  return NextResponse.json({ success: true })
}
```

- [ ] **Step 4: Create src/app/login/page.tsx**

```tsx
'use client'

import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-full max-w-md p-8 border border-gray-800 rounded-lg bg-gray-900">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign in to AppSumo Deal Pulse</h1>

        {sent ? (
          <div className="text-center">
            <p className="text-green-400 mb-2">✓ Link sent!</p>
            <p className="text-gray-400 text-sm">Check your email for a login link.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="you@example.com"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send magic link'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth.ts src/app/login/page.tsx src/app/api/auth/route.ts
npx prisma db push
git commit -m "feat: add magic link authentication"
```

---

## Task 7: Stripe Payments

**Files:**
- Create: `src/lib/stripe.ts`
- Create: `src/app/api/stripe/route.ts`
- Create: `src/components/PricingTable.tsx`
- Create: `src/app/api/stripe/checkout/route.ts`
- Create: `src/app/api/stripe/webhook/route.ts`

- [ ] **Step 1: Create src/lib/stripe.ts**

```typescript
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
})

export const STRIPE_PRICES = {
  free: null,
  pro: process.env.STRIPE_PRO_PRICE_ID!,
  agency: process.env.STRIPE_AGENCY_PRICE_ID!,
}

export const TIER_LIMITS = {
  free: { maxDeals: 1, alerts: 'email' },
  pro: { maxDeals: Infinity, alerts: 'discord+email' },
  agency: { maxDeals: Infinity, alerts: 'discord+email', teamSize: 5 },
}
```

- [ ] **Step 2: Create src/app/api/stripe/checkout/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_PRICES } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const { tier, userId } = await request.json()

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const priceId = STRIPE_PRICES[tier as keyof typeof STRIPE_PRICES]
  if (!priceId) {
    return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
  }

  const session = await stripe.checkout.sessions.create({
    customer: user.stripeCustomerId || undefined,
    customer_email: user.stripeCustomerId ? undefined : user.email,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
    metadata: { userId: user.id },
  })

  return NextResponse.json({ url: session.url })
}
```

- [ ] **Step 3: Create src/app/api/stripe/webhook/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event>

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            tier: 'pro',
            stripeCustomerId: session.customer as string,
          },
        })
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      await prisma.user.updateMany({
        where: { stripeCustomerId: subscription.customer as string },
        data: { tier: 'free' },
      })
      break
    }
  }

  return NextResponse.json({ received: true })
}
```

- [ ] **Step 4: Create src/components/PricingTable.tsx**

```tsx
interface PricingTableProps {
  currentTier?: string
  userId?: string
}

export function PricingTable({ currentTier = 'free', userId }: PricingTableProps) {
  const tiers = [
    {
      name: 'Free',
      price: 0,
      limits: '1 deal, email alerts only',
      tier: 'free',
    },
    {
      name: 'Pro',
      price: 29,
      limits: 'Unlimited deals, Discord + email',
      tier: 'pro',
    },
    {
      name: 'Agency',
      price: 99,
      limits: '5 users, priority support',
      tier: 'agency',
    },
  ]

  const handleUpgrade = async (tier: string) => {
    if (!userId || tier === 'free') return

    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier, userId }),
    })

    const { url } = await res.json()
    if (url) window.location.href = url
  }

  return (
    <div className="grid md:grid-cols-3 gap-6 p-8">
      {tiers.map((t) => (
        <div
          key={t.tier}
          className={`border rounded-lg p-6 ${
            t.tier === currentTier ? 'border-blue-500 bg-blue-950/20' : 'border-gray-800 bg-gray-900'
          }`}
        >
          <h3 className="text-lg font-semibold">{t.name}</h3>
          <p className="text-3xl font-bold mt-2">${t.price}</p>
          <p className="text-gray-400 text-sm mt-2">{t.limits}</p>

          {t.tier === currentTier ? (
            <span className="block mt-4 text-center text-sm text-blue-400">Current plan</span>
          ) : t.tier !== 'free' ? (
            <button
              onClick={() => handleUpgrade(t.tier)}
              className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
            >
              Upgrade to {t.name}
            </button>
          ) : null}
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/stripe.ts src/app/api/stripe/route.ts src/app/api/stripe/checkout/route.ts src/app/api/stripe/webhook/route.ts src/components/PricingTable.tsx
git commit -m "feat: add Stripe subscription billing"
```

---

## Task 8: Landing Page

**Files:**
- Create: `src/app/page.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create src/app/page.tsx**

```tsx
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">AppSumo Deal Pulse</h1>
        <nav className="flex gap-6">
          <Link href="/login" className="hover:text-white transition-colors">
            Sign in
          </Link>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto p-8">
        <section className="text-center py-20">
          <h2 className="text-5xl font-bold mb-6">
            Know when your AppSumo deal <span className="text-blue-400">changes</span>
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Get instant alerts when your AppSumo deal goes live, fills a tier, or expires.
            Stop checking manually. Start acting fast.
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-lg"
          >
            Start for free
          </Link>
        </section>

        <section className="grid md:grid-cols-3 gap-8 py-16">
          <div className="border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">📊 Real-time Monitoring</h3>
            <p className="text-gray-400">
              We check AppSumo RSS and PartnerStack every 15 minutes for instant detection.
            </p>
          </div>
          <div className="border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">🔔 Discord Alerts</h3>
            <p className="text-gray-400">
              Get notified in your Discord server the moment something changes.
            </p>
          </div>
          <div className="border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">💰 Simple Pricing</h3>
            <p className="text-gray-400">
              Free tier covers 1 deal. Pro at $29/mo for unlimited deals.
            </p>
          </div>
        </section>

        <section className="py-16">
          <h2 className="text-2xl font-bold mb-8 text-center">How it works</h2>
          <ol className="space-y-4">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold">1</span>
              <div>
                <p className="font-medium">Add your AppSumo deal URL</p>
                <p className="text-gray-400 text-sm">Connect the deal you want to monitor.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold">2</span>
              <div>
                <p className="font-medium">Set up your Discord webhook</p>
                <p className="text-gray-400 text-sm">We'll send alerts to your server.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold">3</span>
              <div>
                <p className="font-medium">Get notified instantly</p>
                <p className="text-gray-400 text-sm">Know the moment your deal goes live or a tier fills.</p>
              </div>
            </li>
          </ol>
        </section>
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Create src/app/layout.tsx**

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AppSumo Deal Pulse',
  description: 'Monitor your AppSumo deals and get instant alerts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx src/app/layout.tsx
git commit -m "feat: add landing page"
```

---

## Task 9: Vercel Cron Job

**Files:**
- Create: `src/app/api/cron/route.ts`
- Create: `vercel.json`

- [ ] **Step 1: Create src/app/api/cron/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fetchAppSumoDeals, detectAppSumoEvents } from '@/lib/appsumo'
import { fetchPartnerStackDeal, detectTierChange } from '@/lib/partnerstack'
import { sendDiscordAlert } from '@/lib/discord'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const deals = await prisma.deal.findMany({
    where: { status: 'active' },
    include: { events: { orderBy: { occurredAt: 'desc' }, take: 1 } },
  })

  const currentDeals = await fetchAppSumoDeals()

  for (const deal of deals) {
    const currentAppSumoDeal = currentDeals.find((d) => d.url === deal.appsumoUrl)

    if (currentAppSumoDeal) {
      // Check for tier changes via PartnerStack
      if (deal.partnerstackApiKey) {
        const psDeal = await fetchPartnerStackDeal(deal.partnerstackApiKey, deal.id)
        const lastEvent = deal.events[0]

        if (psDeal && detectTierChange(lastEvent as any, psDeal)) {
          await prisma.event.create({
            data: {
              dealId: deal.id,
              type: 'tier_filled',
              details: `Tier ${psDeal.tierCurrent} of ${psDeal.tierMax}`,
            },
          })
        }
      }

      // Check for expiration
      if (currentAppSumoDeal.status === 'expired') {
        await prisma.event.create({
          data: {
            dealId: deal.id,
            type: 'expired',
            details: `Deal expired: ${currentAppSumoDeal.title}`,
          },
        })
      }
    }

    // Update last checked
    await prisma.deal.update({
      where: { id: deal.id },
      data: { lastChecked: new Date() },
    })
  }

  return NextResponse.json({ success: true, processed: deals.length })
}
```

- [ ] **Step 2: Create vercel.json**

```json
{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/cron/route.ts vercel.json
git commit -m "feat: add Vercel cron job for deal monitoring"
```

---

## Task 10: Final Integration & Deploy

**Files:**
- Create: `.env.example`
- Modify: various

- [ ] **Step 1: Create .env.example**

```
# Database
DATABASE_URL="file:./dev.db"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRO_PRICE_ID="price_..."
STRIPE_AGENCY_PRICE_ID="price_..."

# Resend (Email)
RESEND_API_KEY="re_..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
CRON_SECRET="your-cron-secret"

# Discord (per-user webhook)
DISCORD_WEBHOOK_URL=""
```

- [ ] **Step 2: Build project**

Run: `npm run build`

Expected: Build completes without errors

- [ ] **Step 3: Run tests**

Run: `npm test`

Expected: All tests pass

- [ ] **Step 4: Commit all remaining changes**

```bash
git add -A
git commit -m "feat: complete AppSumo Deal Pulse MVP"
```

- [ ] **Step 5: Push to GitHub**

```bash
git remote add origin https://github.com/yourusername/appsumo-deal-pulse.git
git push -u origin master
```

---

## Self-Review Checklist

- [ ] Spec coverage: All 4 core features implemented (Deal Monitoring, Alert System, Dashboard, Auth)
- [ ] Pricing: Free/Pro/Agency tiers with Stripe integration
- [ ] Stack matches spec: Next.js, Prisma/SQLite, Stripe, Vercel cron
- [ ] Plugins used: frontend-design, vercel, stripe, prisma referenced
- [ ] No placeholders: All code is complete
- [ ] Type consistency: Types match across all files
- [ ] Tests: Unit tests for appsumo, partnerstack, discord modules