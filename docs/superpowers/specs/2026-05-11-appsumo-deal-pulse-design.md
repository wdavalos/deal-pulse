# AppSumo Deal Pulse — Design Spec

**Date:** 2026-05-11
**Project:** AppSumo Deal Activation Tracker
**Status:** Draft

## 1. Overview

**Product Name:** AppSumo Deal Pulse

**One-liner:** Alert system that monitors AppSumo deal activity and notifies SaaS founders when their deals go live, fill tiers, or expire.

**Core Value:** SaaS founders running AppSumo deals have zero visibility into deal performance. This gives them real-time alerts so they can act fast.

**Target User:** Bootstrapped SaaS founders actively running AppSumo deals, plus growth agencies managing multiple deals.

---

## 2. Features & Scope

### Core Features (MVP)

1. **Deal Monitoring**
   - Monitor AppSumo deal pages via RSS + web scraping
   - Track PartnerStack affiliate data (free API)
   - Detect: deal goes live, tier fills, promo expires

2. **Alert System**
   - Discord webhook notifications (primary)
   - Email notifications (secondary)
   - Configurable per-deal alerts

3. **Dashboard**
   - List of user's connected deals
   - Event history / log
   - Alert preferences per deal

4. **Simple Auth**
   - Email + password or
   - Single "magic link" for simplicity

### Out of Scope (v1)

- PartnerStack OAuth integration (manual API key entry OK)
- Multiple team members
- Analytics/reporting beyond event log
- Mobile app

---

## 3. Architecture

### Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Frontend | Next.js (App Router) | Fast to build, good DX |
| Backend | Next.js API routes | Serverless, no separate server |
| Database | SQLite (via Prisma) | Zero cost, simple |
| Hosting | Vercel | Free tier, easy deploy |
| Payments | LemonSqueezy | SaaS-friendly, free tier |
| Email | Resend | Free tier, simple API |
| Monitoring | Cron job via Vercel cron | Free |

### Data Model

```
User
  - id, email, passwordHash, createdAt

Deal
  - id, userId, appsumoUrl, partnerstackApiKey
  - lastChecked, status, createdAt

Event
  - id, dealId, type (live|tier_filled|expired)
  - occurredAt, notifiedAt, details
```

### Flow

```
[AppSumo RSS] ─→ [Cron: every 15 min] ─→ [Check for changes]
                                             ↓
[PartnerStack API] ─→ [Detect events] ─→ [Store in DB]
                                             ↓
                                    [Send Discord/Email alert]
```

---

## 4. Build Order

| Day | Task |
|-----|------|
| 1-2 | Project setup, AppSumo RSS parsing, PartnerStack API |
| 3 | Alert system (Discord webhooks) |
| 4 | Dashboard + auth |
| 5 | Payments (LemonSqueezy) + landing page |
| 6-7 | First beta users, iterate |

---

## 5. Pricing

| Tier | Price | Limits |
|------|-------|--------|
| Free | $0 | 1 deal, email alerts only |
| Pro | $29/mo | Unlimited deals, Discord + email |
| Agency | $99/mo | 5 users, priority support |

Launch price (first 30 days): 50% off Pro tier.

---

## 6. Success Criteria

- 5 paying users in first 30 days
- User can connect a deal and receive an alert within 15 minutes
- No false positives (tier didn't fill, but we said it did)
- Flip-ready (clean code, documented) after 6 months or 30+ users

---

## Notes

- PartnerStack API is free and requires only an API key (no OAuth complexity)
- AppSumo doesn't have a public API — use RSS + targeted scraping
- Discord webhooks are free and require zero setup for users