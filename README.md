# MyStore — Full-Stack E-Commerce Platform

A production-ready, fully-featured e-commerce application built with Next.js 16, TypeScript, and PostgreSQL. Includes a complete admin panel, customer accounts, Stripe payments, loyalty program, gift cards, abandoned cart recovery, a dedicated delivery driver system, Google OAuth for customers, and more — everything needed to launch a real online store with in-house or third-party delivery operations.

---

## ✨ Features

### Storefront

- Homepage with auto-playing promotional carousel and category showcase (real product photography, not icons)
- Global navbar with horizontal scrolling category menu and integrated search — accessible from any page
- Product catalog with category filtering, price range, and sorting
- Product detail pages with image gallery, variant picker (color/size), related products, recently viewed, and customer reviews
- Verified-purchase product reviews (admin-moderated) with star ratings, review form on every product page
- Product comparison (up to 3 side-by-side) with floating compare drawer and dedicated compare page
- Recently viewed products (persisted in local storage, shown on product detail pages)
- Wishlist (persists per logged-in customer)
- Full-text search with pagination
- Mobile-responsive navigation with category sidebar

### Product Variants

- Every product supports color, size, and brand attributes
- Per-variant stock tracking and price overrides
- Admin UI for creating and managing variants (color, size, SKU, stock, price)
- Customer-facing variant picker with out-of-stock dimming and smart color+size combo selection
- Cart, checkout, webhooks, and abandoned cart emails are all variant-aware

### Customer Accounts

- Registration and login with email/password
- **Google OAuth sign-in and sign-up** — customers can authenticate with their Google account; accounts are auto-created on first sign-in
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
- **Abandoned cart email recovery** — automatically reminds logged-in customers who leave items in their cart for 2+ hours

### Shipping & Delivery

- **Multi-carrier support**: FedEx, UPS, MyStore Delivery (in-house), or Other (with custom company name)
- **Dedicated delivery driver accounts** — separate role, separate login at `/driver/login`
- Admin assigns orders to specific drivers when using MyStore Delivery
- Drivers see only their assigned orders: order number, customer, shipping address, and current status
- Drivers can update status through the delivery lifecycle: **Out for Delivery → Delivered**, or mark **Returned**
- Full order status history log, including which driver made each update
- Tracking number field for external carriers (FedEx/UPS/Other)

### Admin Panel

- Dashboard with revenue analytics (7d / 30d / 90d, period comparison, charts)
- Product management (create, edit, bulk actions, image upload via Cloudinary)
- Category management (with real product photography)
- Order management with status history, shipping/carrier assignment, and CSV export
- **Driver account management** — create, edit, and remove delivery driver accounts
- Customer list with order history per customer
- Discount code management
- Gift card management
- Product review moderation
- Stock alerts
- FAQ management (accordion, categorized)
- Newsletter subscriber list with CSV export and Brevo sync

### Infrastructure & Reliability

- Three-tier role-based access control: **Admin**, **Customer**, **Driver** — enforced at the edge via middleware, not just in page components
- Rate limiting on all auth, contact, and newsletter endpoints (Upstash Redis)
- Input sanitization on all public-facing forms
- Custom error pages (404, runtime errors, global error boundary)
- Loading skeletons on every data-driven page
- SEO: sitemap, robots.txt, structured data (JSON-LD), Open Graph, Twitter Cards

---

## 🛠 Tech Stack

| Layer                 | Technology                                          |
| --------------------- | --------------------------------------------------- |
| Framework             | Next.js 16 (App Router, TypeScript, Server Actions) |
| Database              | PostgreSQL (Neon serverless)                        |
| ORM                   | Prisma 7                                            |
| Auth (Admin & Driver) | NextAuth.js (shared `User` model, role-based)       |
| Auth (Customer)       | Custom session-based auth + Google OAuth            |
| Payments              | Stripe Checkout + Webhooks                          |
| Styling               | Tailwind CSS + shadcn/ui                            |
| Images                | Cloudinary                                          |
| Email                 | Resend                                              |
| Newsletter Sync       | Brevo (HTTP API)                                    |
| Live Chat             | Crisp                                               |
| Rate Limiting         | Upstash Redis                                       |
| State Management      | Zustand (cart, compare, recently viewed)            |
| Hosting               | Vercel                                              |

---

## 👤 User Roles

| Role         | Login            | Access                                                        |
| ------------ | ---------------- | ------------------------------------------------------------- |
| **Admin**    | `/admin/login`   | Full control — products, orders, customers, drivers, settings |
| **Driver**   | `/driver/login`  | Only their assigned deliveries; can update delivery status    |
| **Customer** | `/account/login` | Their own orders, addresses, wishlist, loyalty points         |

Admins and drivers share the same underlying `User` table (distinguished by a `role` field), while customers use a separate `Customer` table with its own session system. Route access for `/admin/*` and `/driver/*` is enforced in `middleware.ts` at the edge — admins may also access `/driver/*` for oversight, but drivers can never access `/admin/*`.

---

## 📋 Prerequisites

- Node.js 18.18+ (20 LTS recommended)
- A [Neon](https://neon.tech) PostgreSQL database (free tier works)
- Accounts for: [Stripe](https://stripe.com), [Cloudinary](https://cloudinary.com), [Resend](https://resend.com), [Upstash](https://upstash.com), [Brevo](https://brevo.com) — all have free tiers sufficient for getting started
- A [Google Cloud](https://console.cloud.google.com) project with OAuth 2.0 credentials (for customer Google sign-in)
- A [Crisp](https://crisp.chat) account (optional, for live chat)
- An [Unsplash Developer](https://unsplash.com/developers) account (optional — only needed if re-running the category/product image-fetch scripts)

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

This populates ~70 demo products across 18 categories with real Cloudinary-hosted images.

### 5. Create admin and driver accounts

Use Prisma Studio for the first account:

```bash
npx prisma studio
```

Create a `User` record with `role: ADMIN` for yourself. Once logged in, additional admin accounts can be created the same way, and **driver accounts can be created directly from the admin panel** at `/admin/drivers` — no need to touch Prisma Studio again after the first admin exists.

### 6. Set up Google OAuth (for customer sign-in)

1. Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
2. Create an OAuth 2.0 Client ID (Web application type)
3. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/google/callback` (development)
   - `https://yourdomain.com/api/auth/google/callback` (production)
4. Copy the Client ID and Client Secret into your `.env`

### 7. Run the development server

```bash
npm run dev
```

- Storefront: `http://localhost:3000`
- Admin panel: `http://localhost:3000/admin/login`
- Driver portal: `http://localhost:3000/driver/login`

### 8. Set up Stripe webhooks (local testing)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET` in `.env`.

---

## 🔑 Environment Variables

| Variable                             | Where to get it                                                            |
| ------------------------------------ | -------------------------------------------------------------------------- |
| `DATABASE_URL`                       | Neon dashboard → Connection string (append `?connect_timeout=15`)          |
| `NEXTAUTH_SECRET`                    | Generate with `openssl rand -base64 32`                                    |
| `NEXTAUTH_URL`                       | Your site URL (e.g. `http://localhost:3000`)                               |
| `NEXT_PUBLIC_BASE_URL`               | Your site URL (e.g. `http://localhost:3000`) — used for Google OAuth       |
| `GOOGLE_CLIENT_ID`                   | Google Cloud Console → APIs & Services → Credentials                       |
| `GOOGLE_CLIENT_SECRET`               | Google Cloud Console → APIs & Services → Credentials                       |
| `STRIPE_SECRET_KEY`                  | Stripe Dashboard → Developers → API keys                                   |
| `STRIPE_WEBHOOK_SECRET`              | Stripe CLI output, or Dashboard → Webhooks                                 |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API keys                                   |
| `RESEND_API_KEY`                     | Resend Dashboard → API Keys                                                |
| `CLOUDINARY_CLOUD_NAME`              | Cloudinary Dashboard → Account Details                                     |
| `CLOUDINARY_API_KEY`                 | Cloudinary Dashboard → Account Details                                     |
| `CLOUDINARY_API_SECRET`              | Cloudinary Dashboard → Account Details                                     |
| `NEXT_PUBLIC_CRISP_WEBSITE_ID`       | Crisp Dashboard → Settings → Website Settings                              |
| `STORE_OWNER_EMAIL`                  | Your email — receives contact form + order notifications                   |
| `BREVO_API_KEY`                      | Brevo Dashboard → SMTP & API → API Keys                                    |
| `UPSTASH_REDIS_REST_URL`             | Upstash Dashboard → Redis database → REST API                              |
| `UPSTASH_REDIS_REST_TOKEN`           | Upstash Dashboard → Redis database → REST API                              |
| `CRON_SECRET`                        | Generate with `openssl rand -hex 32` (secures the abandoned-cart cron)     |
| `UNSPLASH_ACCESS_KEY`                | Unsplash Developers → Create an app (optional, only for re-seeding images) |

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
7. Add your production URL to Google Cloud Console → Authorized redirect URIs: `https://yourdomain.com/api/auth/google/callback`
8. Vercel Cron (configured in `vercel.json`) will automatically run the abandoned-cart email job hourly — no extra setup needed
9. Create your first production admin via Prisma Studio connected to the production database, then create driver accounts from the admin panel as needed

---

## 📁 Project Structure

```
app/
├── (store)/              # Public storefront routes
│   ├── auth/             # Customer login and register pages
│   ├── compare/          # Product comparison page (/compare?ids=id1,id2,id3)
│   └── products/[slug]/  # Product detail page
├── admin/                # Admin panel (protected — role: ADMIN only)
│   ├── drivers/          # Driver account management
│   └── orders/[id]/      # Order detail, including shipping/carrier assignment
├── driver/               # Driver portal (protected — role: DRIVER or ADMIN)
│   └── login/
├── account/              # Customer account routes
├── actions/              # Server actions (forms, cart, auth, drivers, shipping, reviews)
├── api/
│   ├── auth/google/      # Google OAuth routes (redirect + callback)
│   ├── webhooks/stripe/  # Stripe webhook handler
│   └── cron/             # Scheduled jobs (abandoned carts)
├── error.tsx             # Route-level error boundary
├── not-found.tsx         # 404 page
└── global-error.tsx      # Root-level error boundary

middleware.ts             # Edge-level role-based route protection for /admin and /driver

lib/
├── prisma.ts             # Prisma client singleton
├── auth.ts               # NextAuth configuration (shared by admin + driver roles)
├── customer-auth.ts      # Customer session logic
├── cart-store.ts         # Zustand cart store (variant-aware)
├── compare-store.ts      # Zustand compare store (up to 3 products)
├── recently-viewed-store.ts  # Zustand recently viewed store (persisted, with variants)
├── ratelimit.ts          # Upstash rate limiters
└── sanitize.ts           # Input sanitization helpers

components/
├── admin/                # Admin-only components (DriversClient, ShippingAssignment, etc.)
├── driver/               # Driver portal components (DriverOrderCard, SignOutButton)
└── store/                # Storefront components
    ├── ProductCard.tsx       # Product card with compare toggle button
    ├── ProductDetail.tsx     # Full product detail with variant picker, reviews, review form
    ├── ReviewForm.tsx        # Customer review submission form
    ├── RelatedProducts.tsx   # Server component — same-category product suggestions
    ├── RecentlyViewed.tsx    # Client component — recently viewed products from local store
    ├── CompareButton.tsx     # Add/remove from compare store
    ├── CompareDrawer.tsx     # Floating compare drawer (global, shown when 1+ selected)
    ├── GoogleSignInButton.tsx # Reusable Google OAuth button
    ├── LoginForm.tsx         # Customer login form with Google sign-in
    └── RegisterForm.tsx      # Customer register form with Google sign-up

prisma/
├── schema.prisma         # Database schema
└── *-seed.ts             # Demo data scripts
```

---

## ⚠️ Known Limitations

- **Neon free tier sleeps after inactivity** — the first request after idle time may take 10–45 seconds. Upgrade to a paid Neon plan to eliminate this, or accept it as a minor demo-only quirk.
- **Abandoned cart emails apply to logged-in customers only** — guest checkouts aren't tracked (no persistent identity to attach a cart to).
- **Driver deletion unassigns rather than deletes orders** — removing a driver account sets their assigned orders back to unassigned; an admin will need to manually reassign them.
- **Google OAuth customers have no password** — if a customer signs up via Google and later tries to log in with email/password, they won't have a password set. Consider adding a "set password" option in account settings for OAuth users.
- **Crisp, Brevo, and Upstash all use free tiers** — sufficient for a small-to-medium store; upgrade as you scale.

---

## 🗺️ Possible Future Enhancements

- Driver mobile app or PWA support for on-the-go status updates
- Real-time delivery tracking map for customers
- Subscription / recurring orders
- Multi-vendor marketplace support
- Multi-language / multi-currency
- AI-powered product recommendations
- Product bundles
- Affiliate / referral program
- "Set password" flow for Google OAuth customers

---

## 📄 License

[Specify your license here — e.g. proprietary, single-site license, or as defined by your sale agreement.]

---

## 💬 Support

For setup help or questions, contact: `support@yourdomain.com`
