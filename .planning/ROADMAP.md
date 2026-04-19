# Roadmap

## Phase 1: Payment Gateway Integration
- **Goal**: Integrate Razorpay to handle live payments for online orders.
- **Tasks**:
  - Set up Razorpay backend API keys in environment.
  - Implement `/api/payment/create-order` route.
  - Implement `/api/payment/verify` route for webhook/client confirmation.
  - Update `app/checkout/page.tsx` to launch the Razorpay checkout modal.

## Phase 2: Notification System
- **Goal**: Send automated confirmation emails to users.
- **Tasks**:
  - Integrate Resend (or similar) into the checkout success flow.
  - Create email templates for "Order Confirmed" and "Order Delivered" (admin trigger).

## Phase 3: Subscription Automation
- **Goal**: Automate daily creation of recurring orders.
- **Tasks**:
  - Create a Supabase Edge Function or external cron endpoint.
  - Query active subscriptions and insert corresponding rows into `orders` and `order_items`.

## Phase 4: Analytics and Deployment
- **Goal**: Go live with tracking capabilities.
- **Tasks**:
  - Add basic Google Analytics or Vercel Analytics script.
  - Final review of environment variables and deployment to Vercel.
