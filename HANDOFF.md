# AppSumo Deal Pulse — Project Handoff

**Status:** Live at https://dealpulse.space — Visual redesign deployed
**Last Updated:** 2026-05-12
**Repository:** https://github.com/wdavalos/deal-pulse

---

## What Is Deal Pulse

Alert system that monitors AppSumo deal activity and notifies SaaS founders when their deals go live, fill tiers, or expire.

**Target:** Bootstrapped SaaS founders running their own AppSumo deals. Solo operators, not agencies (Agency tier removed until team features exist).

**Pricing:**
- Free: 1 deal, email alerts only
- Pro: $49/mo, unlimited deals, Discord + email alerts

---

## Quick Start

```bash
cd /home/thinkpad/Projects/ai-micro-saas-portfolio/appsumo-deal-pulse
npm install
npm run dev       # Local development
npm run build     # Production build
npm run start     # Start production server
npm test          # Run tests
```

---

## Architecture

| Component | Technology |
|-----------|------------|
| Framework | Next.js 14 App Router |
| Database | PostgreSQL (Vercel Postgres) |
| ORM | Prisma |
| Auth | Magic link (email) |
| Payments | Stripe subscriptions |
| Email | Resend |
| Hosting | Vercel |
| Domain | dealpulse.space (via Vercel) |

---

## Visual Design

| Element | Value |
|---------|-------|
| Aesthetic | Indie hacker — warm, approachable |
| Background | `#0a0a0f` (deep charcoal) |
| Surface | `#111111` |
| Border | `#222222` |
| Primary accent | `#b45309` (muted earth amber) |
| Primary hover | `#92400e` |
| Text primary | `#ffffff` |
| Text secondary | `#888888` |
| Text muted | `#666666` |
| Heading font | Space Mono (Google Fonts) |
| Body font | System UI |

**Landing page:** Single-screen focused — hero above fold, no scroll required. No features grid, no how-it-works sections.

---

## Environment Variables

```bash
cp .env.example .env
# Fill in values below
```

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `DATABASE_URL` | PostgreSQL connection string | Vercel Postgres (Storage tab) |
| `STRIPE_SECRET_KEY` | Stripe live secret key | Stripe Dashboard → Developers → API keys |
| `STRIPE_PRO_PRICE_ID` | Pro tier price ID | Stripe Dashboard → Products → price_xxx |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Stripe Dashboard → Webhooks |
| `RESEND_API_KEY` | Resend email API key | Resend.com → API Keys |
| `SESSION_SECRET` | Session signing secret | Generate: `openssl rand -hex 16` |
| `CRON_SECRET` | Cron job security token | Generate: `openssl rand -hex 16` |
| `NEXT_PUBLIC_APP_URL` | Production URL | `https://dealpulse.space` |

### Vercel Environment Setup

```bash
vercel link
vercel env add DATABASE_URL production
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_PRO_PRICE_ID production
vercel env add STRIPE_WEBHOOK_SECRET production
vercel env add RESEND_API_KEY production
vercel env add SESSION_SECRET production
vercel env add CRON_SECRET production
vercel env add NEXT_PUBLIC_APP_URL production
```

---

## Database

```bash
npx prisma db push       # Push schema to database
npx prisma generate      # Generate Prisma client (run before build)
npx prisma studio        # Open database GUI
```

---

## Stripe Setup

**Note:** Agency tier is removed from the UI. Only Free and Pro tiers exist in the product.

```bash
# Create Pro product
stripe products create --name="AppSumo Deal Pulse Pro"

# Create recurring price ($49/mo)
stripe prices create -d "product=prod_XXX" -d "unit_amount=4900" -d "currency=usd" -d "billing_scheme=per_unit" -d "nickname=Pro Monthly" -d "recurring[interval]=month"
```

---

## Key Files

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Landing page (indie hacker redesign) |
| `src/app/layout.tsx` | Root layout (Space Mono font, earth bg) |
| `src/app/globals.css` | CSS variables for earth palette |
| `src/app/login/page.tsx` | Magic link login |
| `src/app/dashboard/page.tsx` | User dashboard |
| `src/app/api/auth/route.ts` | Send magic link |
| `src/app/api/auth/verify/route.ts` | Verify token + session |
| `src/app/api/cron/route.ts` | Deal monitoring cron |
| `src/app/api/stripe/checkout/route.ts` | Stripe checkout session |
| `src/app/api/stripe/webhook/route.ts` | Stripe webhook handler |
| `src/components/PricingTable.tsx` | Free/Pro pricing only |
| `src/components/DealCard.tsx` | Deal card with amber border |
| `src/components/EventLog.tsx` | Event log with earth palette |
| `src/lib/stripe.ts` | Stripe singleton |
| `src/lib/auth.ts` | Magic link utilities |
| `src/lib/appsumo.ts` | AppSumo RSS parser |
| `src/lib/partnerstack.ts` | PartnerStack API |
| `src/lib/discord.ts` | Discord webhooks |
| `prisma/schema.prisma` | Database schema |
| `tailwind.config.js` | Earth palette + Space Mono |
| `vercel.json` | Cron schedule |

---

## Cron Job

Daily on Hobby plan:

```json
// vercel.json
{ "crons": [{ "path": "/api/cron", "schedule": "0 0 * * *" }] }
```

Upgrade to Vercel Pro for more frequent checks.

---

## Known Issues

1. **Hobby plan cron limit** — Once/day max. Upgrade to Pro for more frequent checks.
2. **Agency tier removed from UI** — Data model still supports it, but pricing table only shows Free/Pro. Don't mention Agency in Stripe dashboard either — it will confuse users.
3. **Space Mono via Google Fonts** — Requires internet connection on first load. Fallback is system monospace.

---

## Testing Checklist (Next Phase)

- [ ] Sign up flow — magic link sent to email
- [ ] Verify magic link login works
- [ ] Add a deal URL to monitor
- [ ] Confirm deal appears in dashboard
- [ ] Trigger a mock event (edit deal status manually in DB)
- [ ] Verify Discord webhook fires on event
- [ ] Upgrade to Pro via Stripe checkout
- [ ] Verify Pro features unlocked after payment
- [ ] Verify Free tier limits enforced (1 deal only)
- [ ] Mobile layout — single-screen landing still readable
- [ ] Login page theming consistent with landing
- [ ] Dashboard event log displays correctly
- [ ] DealCard amber border visible on active deals

---

## Troubleshooting

```bash
# Rebuild cleanly
rm -rf .next && npm run build

# Force production deploy
vercel deploy --prod --force

# Check deployment status
vercel ls

# View logs
vercel logs dealpulse.space

# Inspect deployment
vercel inspect <url>
```

---

## Documentation

- [Visual Redesign Spec](./docs/superpowers/specs/2026-05-12-deal-pulse-visual-redesign.md)
- [Visual Redesign Plan](./docs/superpowers/plans/2026-05-12-deal-pulse-visual-redesign-plan.md)
- [Original Design Spec](./docs/superpowers/specs/2026-05-11-appsumo-deal-pulse-design.md)
- [Original Implementation Plan](./docs/superpowers/plans/2026-05-11-appsumo-deal-pulse-implementation-plan.md)
- [Completion Notes](./docs/COMPLETION.md)
