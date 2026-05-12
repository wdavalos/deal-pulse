# AppSumo Deal Pulse — Visual Redesign Spec

**Date:** 2026-05-12
**Status:** Draft

## 1. Overview

Redesign Deal Pulse's visual identity and landing page to align with an indie hacker aesthetic, clarify the target audience (solo founders, not agencies), and create a distinctive 2026-era presence that stands out from generic blue-gradient SaaS.

## 2. Audience

**Primary:** Bootstrapped SaaS founders running their own AppSumo deals. Solo operators who value authenticity, transparency, and tools built by someone who understands their problem.

**Not targeting:** Agencies, teams, or enterprise. Agency tier removed from messaging until team features are built.

## 3. Visual Direction

### Personality
**Indie Hacker** — Warm, approachable, hand-crafted. Feels like a real person built it, not a growth team. Confident without being corporate.

### Color Palette (Muted Earth)
| Role | Hex | Usage |
|------|-----|-------|
| Background | `#0a0a0f` | Deep charcoal, near-black |
| Surface | `#111111` | Card backgrounds |
| Border | `#222222` | Subtle dividers |
| Border hover | `#333333` | Interactive states |
| Primary accent | `#b45309` | Amber muted — buttons, highlights, links |
| Primary hover | `#92400e` | Deeper amber on hover |
| Text primary | `#ffffff` | Headlines |
| Text secondary | `#888888` | Body, descriptions |
| Text muted | `#666666` | Hints, captions |

### Typography
| Role | Font | Rationale |
|------|------|-----------|
| Headings / Branding | Space Mono | Distinctive, not a typical dev font. Quirky character signals indie. |
| Body | System UI / Inter | Readable, neutral, pairs with monospace without competing |

### Layout
**Single-screen focused** — Above-the-fold hero with CTA. Everything critical visible without scrolling. The "I don't need a 10-section page" confidence.

## 4. Landing Page Structure

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER: Logo (Space Mono) + "Sign in" link                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  HERO (centered, full viewport height)                     │
│                                                             │
│    AppSumo Deal Pulse                                      │
│    in Space Mono, large                                    │
│                                                             │
│    Know when your deal changes                             │
│    One-line value prop below                               │
│                                                             │
│    [  Get started free  ]                                  │
│    amber button, centered                                  │
│                                                             │
│  ─── or subtle divider ───                                 │
│                                                             │
│    Already running a deal? → Sign in                       │
│    small link below                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**No features grid, no how-it-works, no pricing table on landing page.** All secondary content lives on the dashboard (post-login) or a minimal pricing component below the fold.

## 5. Component Inventory

### Header
- Logo: "AppSumo Deal Pulse" in Space Mono, white
- Right side: "Sign in" link in gray, hover → white
- Border-bottom: 1px `#222`

### Hero
- Full viewport height or near (min-height: 90vh)
- Centered vertically and horizontally
- Headline: Space Mono, 48-56px, white
- Subheadline: System UI, 18-20px, `#888`
- CTA button: Amber background, white text, rounded-lg, hover darkens

### Sign-in Link
- Small, understated below CTA
- Color: `#666`, hover: `#b45309`

### Pricing (below fold)
- Three columns: Free / Pro / Agency (but Agency grayed out as "coming soon" or removed)
- Simplified: Free vs Pro only until team features exist
- Pro highlighted with amber border, not blue

### Dashboard
- Same dark background, Space Mono headings
- Deal cards with amber accent borders
- Event log with subtle amber highlights for activity

## 6. Out of Scope

- Team / agency features (data model doesn't support them)
- Complex animations or micro-interactions
- Multiple landing page variants
- Mobile-native redesign (responsive yes, but not PWA)

## 7. Implementation Notes

1. Remove Agency tier from pricing UI until team features are built
2. Update landing page copy to speak to founders ("your deal" singular, not "deals")
3. Update hero headline to match indie hacker voice — less corporate, more direct
4. Test at mobile viewport — single-screen should still work

## 8. Files to Modify

- `src/app/page.tsx` — Landing page (full redesign)
- `src/app/layout.tsx` — Font imports (Space Mono)
- `src/components/PricingTable.tsx` — Simplify to Free/Pro only
- `src/app/dashboard/page.tsx` — Minor typography polish
- `tailwind.config.js` — Add Space Mono, update colors
- `src/app/globals.css` — CSS variables for palette