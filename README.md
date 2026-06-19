# MyStore — Full-Stack E-Commerce Platform

A production-ready, fully-featured e-commerce application built with Next.js 16, TypeScript, and PostgreSQL. Includes a complete admin panel, customer accounts, Stripe payments, loyalty program, gift cards, abandoned cart recovery, and more — everything needed to launch a real online store.

---

## ✨ Features

### Storefront

- Homepage with auto-playing promotional carousel
- Product catalog with category filtering, price range, and sorting
- Product detail pages with image gallery, related products, and reviews
- Verified-purchase product reviews (admin-moderated)
- Product comparison (up to 3 side-by-side)
- Recently viewed products
- Wishlist (persists per logged-in customer)
- Full-text search with pagination
- Mobile-responsive navigation with category sidebar

### Customer Accounts

- Registration, login, secure sessions
- Order history and tracking
- Saved addresses (multiple, with default selection)
- Password change
- Loyalty points (10 pts per $1 spent, 100 pts = $1 off)

### Checkout & Payments

- Stripe Checkout integration with webhooks
- Discount codes (percentage or fixed amount)
- Gift cards (fixed or custom amount, 2-year expiry, email delivery, balance checker)
- Discount codes and gift cards combine correctly in a single Stripe coupon
- Order confirmation emails via Resend
- **Abandoned cart email recovery** — automatically reminds customers who leave items in their cart for 2+ hours

### Admin Panel

- Dashboard with revenue analytics (7d / 30d / 90d, period comparison, charts)
- Product management (create, edit, bulk actions, image upload via Cloudinary)
- Category management
- Order management with status history and CSV export
- Customer list with order history per customer
- Discount code management
- Gift card management
- Product review moderation
- Stock alerts
- FAQ management (accordion, categorized)
- Newsletter subscriber list with CSV export and Brevo sync

### Infrastructure & Reliability

- Rate limiting on all auth, contact, and newsletter endpoints (Upstash Redis)
- Input sanitization on all public-facing forms
- Custom error pages (404, runtime errors, global error boundary)
- Loading skeletons on every data-driven page
- SEO: sitemap, robots.txt, structured data (JSON-LD), Open Graph, Twitter Cards

---

## 🛠 Tech Stack

| Layer           | Technology                                          |
| --------------- | --------------------------------------------------- |
| Framework       | Next.js 16 (App Router, TypeScript, Server Actions) |
| Database        | PostgreSQL (Neon serverless)                        |
| ORM             | Prisma 7                                            |
| Auth (Admin)    | NextAuth.js                                         |
| Auth (Customer) | Custom session-based auth                           |
| Payments        | Stripe Checkout + Webhooks                          |
| Styling         | Tailwind CSS + shadcn/ui                            |
| Images          | Cloudinary                                          |
| Email           | Resend                                              |
| Newsletter Sync | Brevo (HTTP API)                                    |
| Live Chat       | Crisp                                               |
| Rate Limiting   | Upstash Redis                                       |
| Hosting         | Vercel                                              |

---

## 📋 Prerequisites

- Node.js 18.18+ (20 LTS recommended)
- A [Neon](https://neon.tech) PostgreSQL database (free tier works)
- Accounts for: [Stripe](https://stripe.com), [Cloudinary](https://cloudinary.com), [Resend](https://resend.com), [Upstash](https://upstash.com), [Brevo](https://brevo.com) — all have free tiers sufficient for getting started
- A [Crisp](https://crisp.chat) account (optional, for live chat)

---

## 🚀 Setup Guide

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in each value:

```bash
cp .env.example .env
```

See [Environment Variables](#-environment-variables) below for where to get each key.

### 3. Set up the database

```bash
npx prisma migrate dev
npx prisma generate
```

### 4. Seed demo data (optional but recommended)

```bash
npx tsx prisma/new-categories-seed.ts
npx tsx prisma/products-seed.ts
npx tsx prisma/new-category-products-seed.ts
```

This populates ~70 demo products across 18 categories with working images.

### 5. Create an admin user

```bash
npx tsx prisma/create-admin.ts
```

(Or insert directly via Prisma Studio: `npx prisma studio`)

### 6. Run the development server

```bash
npm run dev
```

Visit `http://localhost:3000` for the storefront and `http://localhost:3000/admin/login` for the admin panel.

### 7. Set up Stripe webhooks (local testing)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET` in `.env`.

---

## 🔑 Environment Variables

| Variable                             | Where to get it                                                        |
| ------------------------------------ | ---------------------------------------------------------------------- |
| `DATABASE_URL`                       | Neon dashboard → Connection string (append `?connect_timeout=15`)      |
| `NEXTAUTH_SECRET`                    | Generate with `openssl rand -base64 32`                                |
| `NEXTAUTH_URL`                       | Your site URL (e.g. `http://localhost:3000`)                           |
| `STRIPE_SECRET_KEY`                  | Stripe Dashboard → Developers → API keys                               |
| `STRIPE_WEBHOOK_SECRET`              | Stripe CLI output, or Dashboard → Webhooks                             |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API keys                               |
| `RESEND_API_KEY`                     | Resend Dashboard → API Keys                                            |
| `CLOUDINARY_CLOUD_NAME`              | Cloudinary Dashboard → Account Details                                 |
| `CLOUDINARY_API_KEY`                 | Cloudinary Dashboard → Account Details                                 |
| `CLOUDINARY_API_SECRET`              | Cloudinary Dashboard → Account Details                                 |
| `NEXT_PUBLIC_CRISP_WEBSITE_ID`       | Crisp Dashboard → Settings → Website Settings                          |
| `STORE_OWNER_EMAIL`                  | Your email — receives contact form + order notifications               |
| `BREVO_API_KEY`                      | Brevo Dashboard → SMTP & API → API Keys                                |
| `UPSTASH_REDIS_REST_URL`             | Upstash Dashboard → Redis database → REST API                          |
| `UPSTASH_REDIS_REST_TOKEN`           | Upstash Dashboard → Redis database → REST API                          |
| `CRON_SECRET`                        | Generate with `openssl rand -hex 32` (secures the abandoned-cart cron) |

---

## 🌐 Deploying to Production (Vercel)

1. Push this repository to GitHub
2. Import the project in [Vercel](https://vercel.com/new)
3. Add all environment variables from the table above in Vercel's project settings
4. Deploy
5. Run migrations against your production database:
   ```bash
   npx prisma migrate deploy
   ```
6. Configure your Stripe webhook endpoint to point at `https://yourdomain.com/api/webhooks/stripe`
7. Vercel Cron (configured in `vercel.json`) will automatically run the abandoned-cart email job hourly — no extra setup needed

---

## 📁 Project Structure

```
app/
├── (store)/              # Public storefront routes
├── admin/                # Admin panel (protected)
├── account/              # Customer account routes
├── actions/              # Server actions (forms, cart, auth)
├── api/
│   ├── webhooks/stripe/  # Stripe webhook handler
│   └── cron/             # Scheduled jobs (abandoned carts)
├── error.tsx             # Route-level error boundary
├── not-found.tsx         # 404 page
└── global-error.tsx      # Root-level error boundary

lib/
├── prisma.ts              # Prisma client singleton
├── auth.ts                # NextAuth configuration (admin)
├── customer-auth.ts        # Customer session logic
├── ratelimit.ts             # Upstash rate limiters
└── sanitize.ts               # Input sanitization helpers

prisma/
├── schema.prisma          # Database schema
└── *-seed.ts                # Demo data scripts
```

---

## ⚠️ Known Limitations

- **Neon free tier sleeps after inactivity** — the first request after idle time may take 10–45 seconds. Upgrade to a paid Neon plan to eliminate this, or accept it as a minor demo-only quirk.
- **Abandoned cart emails apply to logged-in customers only** — guest checkouts aren't tracked (no persistent identity to attach a cart to).
- **Crisp, Brevo, and Upstash all use free tiers** — sufficient for a small-to-medium store; upgrade as you scale.

---

## 🗺️ Possible Future Enhancements

- Subscription / recurring orders
- Multi-vendor marketplace support
- Multi-language / multi-currency
- AI-powered product recommendations
- Product bundles
- Affiliate / referral program
- Native mobile app (React Native)

---

## 📄 License

[Specify your license here — e.g. proprietary, single-site license, or as defined by your sale agreement.]

---

## 💬 Support

For setup help or questions, contact: `support@yourdomain.com`
