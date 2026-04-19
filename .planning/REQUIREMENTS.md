# Requirements

## Active

- **Phase 1: Payment Gateway Integration**
  - Integrate a real payment provider (e.g., Razorpay) to replace the mocked UPI checkout process.
  - Securely handle webhook callbacks for successful/failed payments to update the `orders` status in Supabase.

- **Phase 2: Notification System**
  - Set up an email/SMS notification service (e.g., Resend).
  - Automatically send order confirmations to users upon successful checkout.

- **Phase 3: Subscription Automation**
  - Implement a backend cron job or Supabase Edge Function to process active recurring subscriptions.
  - Automatically generate orders for active subscriptions at the specified intervals.

- **Phase 4: Analytics and Deployment**
  - Integrate basic site analytics to monitor performance and conversions.
  - Deploy the frontend application to Vercel and connect the custom domain (VinayNagarMarT.com).

## Validated

- ✓ Product Catalog & Category Pages
- ✓ Cart and Checkout Flow (Mocked Payment)
- ✓ Authentication (Magic Link)
- ✓ Dashboards (User & Admin)
- ✓ Mobile-First Zepto-inspired UI
