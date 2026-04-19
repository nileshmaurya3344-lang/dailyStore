# VinayNagarMarT

## What This Is

A modern full-stack grocery web application focused on dairy products, packaged goods, household items, and personal care. The UI is inspired by Zepto, offering instant and scheduled "Morning" deliveries, along with recurring subscription options.

## Core Value

Provide the fastest, most reliable, and easiest local grocery shopping experience for Vinay Nagar residents with guaranteed fresh morning deliveries.

## Requirements

### Validated

- ✓ Product Catalog & Filtering — implemented
- ✓ Next.js App Router Setup — implemented
- ✓ Persistent Cart System (Zustand) — implemented
- ✓ User Authentication (Supabase Magic Link) — implemented
- ✓ Checkout Flow (Address & Delivery scheduling) — implemented
- ✓ User Profile & Order History Dashboard — implemented
- ✓ Admin Dashboard & CRUD — implemented

### Active

- [ ] Notification System (Order confirmations via email/SMS)
- [ ] Subscription Cron (Automated daily order generation for subscriptions)
- [ ] Payment Gateway Integration (Replace mock UPI with Razorpay/Stripe)
- [ ] Analytics (Site performance and basic tracking)
- [ ] Production Deployment (Vercel & custom domain)

### Out of Scope

- Fresh fruits and vegetables — explicitly excluded per initial design rules.

## Context

- **Tech Environment**: Next.js 14, Tailwind CSS, ShadCN, Zustand, React Query, Supabase (Auth, Postgres).
- **Known Issues**: UPI and COD flows currently use mock verification in the checkout page. The admin dashboard uses URL-based image uploading instead of a Supabase bucket.

## Constraints

- **Tech Stack**: Next.js App Router is mandatory.
- **Design**: Must strictly adhere to the modern, Zepto-style, mobile-first design system with animations.
- **Security**: Strict Row Level Security (RLS) on Supabase must be maintained.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js App Router | Modern React ecosystem standard | ✓ Good |
| Supabase Magic Link | Lower friction user onboarding | ✓ Good |
| RLS Helper Function | Bypass recursive admin policy checks | ✓ Good |

---
*Last updated: 2026-04-19 after milestone 1 completion*
