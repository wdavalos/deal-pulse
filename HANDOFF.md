# AppSumo Deal Pulse — Project Handoff

**Status:** Live at https://dealpulse.space
**Last Updated:** 2026-05-12
**Repository:** https://github.com/wdavalos/deal-pulse

---

## Quick Start

```bash
cd /home/thinkpad/Projects/ai-micro-saas-portfolio/appsumo-deal-pulse
npm install
npm run dev       # Local development
npm run build     # Production build (includes prisma generate)
npm run start     # Start production server
npm test          # Run tests
```

**Note:** The app uses `src/app/` for Next.js pages (not a root `app/` directory). Keep the `src/` directory structure intact.

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

## Environment Variables

Copy `.env.example` to `.env` and fill in values:

```bash
cp .env.example .env
```

### Required Variables

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `DATABASE_URL` | PostgreSQL connection string | Vercel Postgres (Storage tab) |
| `STRIPE_SECRET_KEY` | Stripe live secret key | Stripe Dashboard → Developers → API keys |
| `STRIPE_PRO_PRICE_ID` | Pro tier price ID | Stripe Dashboard → Products → price_xxx |
| `STRIPE_AGENCY_PRICE_ID` | Agency tier price ID | Stripe Dashboard → Products → price_xxx |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Stripe Dashboard → Webhooks |
| `RESEND_API_KEY` | Resend email API key | Resend.com → API Keys |
| `SESSION_SECRET` | Session signing secret | Generate: `openssl rand -hex 16` |
| `CRON_SECRET` | Cron job security token | Generate: `openssl rand -hex 16` |
| `NEXT_PUBLIC_APP_URL` | Production URL | `https://dealpulse.space` |

### Vercel Environment Setup

```bash
# Link project
vercel link

# Add env vars to Vercel
vercel env add DATABASE_URL production
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_PRO_PRICE_ID production
vercel env add STRIPE_AGENCY_PRICE_ID production
vercel env add STRIPE_WEBHOOK_SECRET production
vercel env add RESEND_API_KEY production
vercel env add SESSION_SECRET production
vercel env add CRON_SECRET production
vercel env add NEXT_PUBLIC_APP_URL production
```

---

## Database

```bash
# Push schema to database
npx prisma db push

# Generate Prisma client (required before build)
npx prisma generate

# Open Prisma Studio
npx prisma studio
```

---

## Stripe Setup

### Create Products via Stripe CLI

```bash
# Create Pro product
stripe products create --name="AppSumo Deal Pulse Pro"

# Create Agency product
stripe products create --name="AppSumo Deal Pulse Agency"

# Create recurring prices ($49/mo Pro, $99/mo Agency)
stripe prices create -d "product=prod_XXX" -d "unit_amount=4900" -d "currency=usd" -d "billing_scheme=per_unit" -d "nickname=Pro Monthly" -d "recurring[interval]=month"
```

### Price IDs (Current)
- **Pro:** `price_1TWJmBDlXhiWIiRT64Kce3Sa` ($49/mo)
- **Agency:** `price_1TWJmKDlXhiWIiRTgtMK4jLy` ($99/mo)

---

## Key Files

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Landing page |
| `src/app/login/page.tsx` | Magic link login |
| `src/app/dashboard/page.tsx` | User dashboard |
| `src/app/api/auth/route.ts` | Send magic link |
| `src/app/api/auth/verify/route.ts` | Verify token |
| `src/app/api/cron/route.ts` | Deal monitoring cron |
| `src/app/api/stripe/checkout/route.ts` | Stripe checkout |
| `src/app/api/stripe/webhook/route.ts` | Stripe webhooks |
| `src/lib/stripe.ts` | Stripe singleton |
| `src/lib/auth.ts` | Magic link utilities |
| `src/lib/appsumo.ts` | AppSumo RSS parser |
| `src/lib/partnerstack.ts` | PartnerStack API |
| `src/lib/discord.ts` | Discord webhooks |
| `prisma/schema.prisma` | Database schema |
| `vercel.json` | Cron schedule |

---

## Cron Job

Currently set to **daily** (Hobby plan limit):

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "0 0 * * *"
    }
  ]
}
```

To change frequency, upgrade to Vercel Pro plan.

---

## Known Issues

1. **Tailwind CSS not rendering** — Caused by an empty `app/` directory at the project root shadowing `src/app/`. If styles break again, verify no `app/` directory exists at root level (`ls -la /` in project root).
2. **Hobby plan cron limit** — Cron runs daily max. Upgrade to Vercel Pro for more frequent checks.
3. **Resend API key** — `RESEND_API_KEY` must be set in `.env` for the build to succeed. The email client uses lazy initialization to avoid build-time errors.

---

## Troubleshooting

```bash
# If styles aren't loading, check for shadowing app/ directory
ls -la /path/to/project/ | grep "^d.*app"

# Rebuild locally
rm -rf .next && npm run build

# Check Vercel deployment
vercel ls
vercel inspect <deployment-url>

# View Vercel logs
vercel logs dealpulse.space

# Force a clean production deploy
vercel deploy --prod --force
```

---

## Documentation

- [SPEC](./docs/superpowers/specs/2026-05-11-appsumo-deal-pulse-design.md)
- [Implementation Plan](./docs/superpowers/plans/2026-05-11-appsumo-deal-pulse-implementation-plan.md)
- [Completion Notes](./docs/COMPLETION.md)