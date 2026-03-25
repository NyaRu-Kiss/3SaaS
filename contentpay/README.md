# ContentPay - Creator Paid Content Platform

A SaaS platform for creators to build their paid content site in 5 minutes. Support articles, resources, and membership subscriptions.

## Features

- **Rich Text Editor** - TipTap editor with Markdown support
- **Flexible Pricing** - Free, one-time purchase, or subscription
- **Paywall Options** - Full paid, free preview (30%), or members-only
- **Stripe Integration** - Accept credit card payments
- **Subscription Management** - Monthly and yearly plans
- **Email Notifications** - New post alerts to subscribers
- **Revenue Dashboard** - Track earnings and subscribers
- **Coupon System** - Percentage or fixed discounts
- **Withdrawal System** - Request payouts with 10% platform fee

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Backend | Next.js API Routes + Prisma ORM |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Auth | NextAuth.js (Credentials) |
| Payments | Stripe (Checkout + Subscriptions) |
| Deployment | Vercel |

## Prerequisites

- Node.js 18+
- npm or yarn
- Stripe account (for payments)
- SMTP email service (for notifications)

## Setup

### 1. Clone and Install

```bash
git clone <your-repo>
cd contentpay
npm install
```

### 2. Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```bash
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret-key"

# Stripe (get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Stripe Price IDs (create in Stripe Dashboard > Products)
STRIPE_MONTHLY_PRICE_ID="price_..."
STRIPE_YEARLY_PRICE_ID="price_..."

# Email (optional - for notifications)
EMAIL_HOST="smtp.ethereal.email"
EMAIL_PORT="587"
EMAIL_USER="your-email"
EMAIL_PASS="your-password"
EMAIL_FROM="ContentPay <noreply@contentpay.com>"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Generate Secret Key

```bash
openssl rand -base64 32
```

### 4. Database Setup

```bash
# Push schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate
```

### 5. Stripe Setup

1. Create a Stripe account at https://stripe.com
2. Go to Developers > API Keys and copy your test keys
3. Create two Products with Prices:
   - Monthly Subscription (e.g., $9.99/month)
   - Yearly Subscription (e.g., $99.99/year)
4. Copy the Price IDs to your `.env` file
5. Set up Webhook endpoint:
   - URL: `https://your-domain.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `charge.refunded`

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

Build the project:

```bash
npm run build
```

Start production server:

```bash
npm start
```

## Project Structure

```
contentpay/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/              # Auth pages (login, register)
│   │   ├── (creator)/            # Creator pages
│   │   │   ├── [slug]/         # Creator homepage
│   │   │   └── [slug]/[post]/  # Post detail
│   │   ├── account/            # Reader account
│   │   ├── dashboard/          # Creator dashboard
│   │   │   ├── new/           # Create post
│   │   │   ├── edit/[id]/     # Edit post
│   │   │   ├── coupons/        # Coupon management
│   │   │   ├── withdrawals/    # Withdrawal management
│   │   │   └── refunds/        # Refund management
│   │   └── api/                # API Routes
│   │       ├── auth/           # Auth APIs
│   │       ├── posts/          # Post APIs
│   │       ├── payments/        # Payment APIs
│   │       ├── subscriptions/   # Subscription APIs
│   │       ├── webhooks/       # Stripe webhooks
│   │       ├── coupons/         # Coupon APIs
│   │       ├── withdrawals/     # Withdrawal APIs
│   │       └── refunds/        # Refund APIs
│   ├── components/              # React components
│   │   ├── ui/                # UI components
│   │   ├── editor/            # TipTap editor
│   │   ├── payment/           # Payment components
│   │   └── dashboard/          # Dashboard components
│   ├── lib/                    # Utilities
│   │   ├── prisma.ts         # Prisma client
│   │   ├── stripe.ts          # Stripe config
│   │   ├── auth.ts            # NextAuth config
│   │   ├── email.ts           # Email service
│   │   └── utils.ts           # Helpers
│   └── types/                  # TypeScript types
├── prisma/
│   └── schema.prisma           # Database schema
└── public/                     # Static assets
```

## API Routes

### Posts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | List posts |
| POST | `/api/posts` | Create post |
| GET | `/api/posts/[id]` | Get post |
| PUT | `/api/posts/[id]` | Update post |
| DELETE | `/api/posts/[id]` | Delete post |
| GET | `/api/posts/public/[creator]` | Get creator's public posts |

### Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/checkout` | Create checkout session |
| GET | `/api/payments/verify/[postId]` | Verify purchase |

### Subscriptions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/subscriptions` | List user subscriptions |
| POST | `/api/subscriptions` | Create subscription |
| DELETE | `/api/subscriptions/[id]` | Cancel subscription |
| GET | `/api/subscriptions/subscribers` | List creator's subscribers |

### Webhooks

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/webhooks/stripe` | Handle Stripe events |

## Database Schema

### User
- id, email, password, name, avatar, role, bio, slug, stripeAccountId

### Post
- id, title, slug, content, excerpt, priceType, price, currency, paywallType, previewRatio, status, publishedAt, creatorId

### Purchase
- id, userId, postId, amount, currency, stripePaymentId, paymentStatus

### Subscription
- id, subscriberId, creatorId, status, plan, amount, stripeSubscriptionId, currentPeriodStart, currentPeriodEnd

### Coupon
- id, code, discountType, discountValue, maxUses, usedCount, validFrom, validUntil, creatorId

### Withdrawal
- id, userId, amount, currency, status, stripeTransferId

## Testing Payments

Use Stripe test mode:

- Test card: `4242 4242 4242 4242`
- Any future expiry date
- Any 3-digit CVC

## Production Checklist

1. Set `NEXTAUTH_SECRET` to a strong random value
2. Use PostgreSQL instead of SQLite
3. Configure Stripe with live API keys
4. Set up proper email service
5. Enable Stripe webhook signature verification
6. Configure SSL/HTTPS
7. Set up proper CORS origins

## License

MIT
