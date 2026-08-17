# NextShop — Full-Stack E-Commerce Platform

A production-ready, fully-featured e-commerce application built with Next.js 15, TypeScript, and PostgreSQL. Includes a complete admin panel, customer accounts, Stripe payments with automatic tax calculation, dedicated cart page, loyalty program, gift cards, abandoned cart recovery, a dedicated delivery driver system, Google OAuth for customers, product bundles, collapsible reviews, forgot password flow, and more — everything needed to launch a real online store with in-house or third-party delivery operations.

---

## ✨ Features

### Storefront

- Homepage with auto-playing promotional carousel and category showcase
- Global navbar with horizontal scrolling category menu and integrated search — accessible from any page, mobile-responsive
- Product catalog with category filtering, price range, and sorting
- Amazon-style product detail page with vertical thumbnail strip, sticky buy box, and image gallery
- Hover-to-preview thumbnails (desktop) and tap-to-preview (mobile)
- Color variant image cards with per-variant pricing and sold-out overlays
- **Variant-accurate cart images** — selecting a color variant shows that variant's image in the cart, not the default product image
- **Dedicated cart page** (`/cart`) — two-column desktop layout with item table and sticky order summary; fully responsive on mobile
- **Frequently Bought Together** — admin-curated product bundles with add-all-to-cart and per-item toggle
- **Collapsible product reviews** — star ratings, verified purchase badges, and review form in a toggleable section
- Product comparison (up to 3 side-by-side) with floating compare drawer and dedicated compare page
- Recently viewed products (Zustand-powered, persisted in localStorage)
- Wishlist (persists per logged-in customer)
- Full-text search with pagination
- Social share buttons (Facebook, X, WhatsApp, Pinterest, Copy Link)
- Stock badges — "Only X left" urgency labels
- Mobile-responsive navigation with sliding category navbar and hamburger menu

### Product Variants & Bundles

- Every product supports color, size, and brand attributes
- Per-variant stock tracking, price overrides, and individual variant images
- Admin UI for creating and managing variants (color, size, SKU, stock, price, image)
- **Per-variant image upload** — each color variant can have its own image; selecting a color updates the main product image and the cart thumbnail
- **Product Bundle Manager** — admin search-and-add UI on the product edit page to curate Frequently Bought Together lists (up to 4 products per bundle)
- Customer-facing variant picker with out-of-stock dimming and smart color+size combo selection
- Cart, checkout, webhooks, and abandoned cart emails are all variant-aware

### Customer Accounts

- Registration and login with email/password
- **Google OAuth sign-in and sign-up** — customers can authenticate with their Google account; accounts are auto-created on first sign-in
- **Forgot password** — email reset link flow with 1-hour token expiry, per-email cooldown, and automatic session invalidation on reset
- Order history and tracking with full status timeline
- Saved addresses (multiple, with default selection)
- Password change
- Loyalty points (10 pts per $1 spent, 100 pts = $1 off)

### Checkout & Payments

- Stripe Checkout integration with webhooks
- **Automatic tax calculation** via Stripe Tax — tax is calculated based on the customer's shipping address on the Stripe-hosted checkout page
- **Shipping options** — Standard (free, 5–7 business days) and Express ($9.99, 1–3 business days) — customer selects on Stripe checkout page
- Discount codes (percentage or fixed amount, expiry dates, usage limits)
- Gift cards (fixed or custom amount, 2-year expiry, email delivery, balance checker)
- Discount codes and gift cards combine correctly in a single Stripe coupon
- Loyalty points redemption at checkout
- Order confirmation emails via Resend
- **Abandoned cart email recovery** — automatically reminds logged-in customers who leave items in their cart for 2+ hours (Vercel Cron)

### Shipping & Delivery

- **Multi-carrier support**: FedEx, UPS, MyStore Delivery (in-house), or Other (with custom company name)
- **Dedicated delivery driver accounts** — separate role, separate login at `/driver/login`
- Admin assigns orders to specific drivers when using MyStore Delivery
- Drivers see only their assigned orders: order number, customer, shipping address, and current status
- Drivers can update status through the delivery lifecycle: **Out for Delivery → Delivered**, or mark **Returned**
- Full order status history log, including which driver made each update
- Tracking number field for external carriers (FedEx/UPS/Other)
- Customer-facing order status timeline

### Admin Panel

- Dashboard with revenue analytics (7d / 30d / 90d, period comparison, charts)
- Product management (create, edit, image upload via Cloudinary, variants, bundles)
- Category management with images and slugs
- Order management with status history, shipping/carrier assignment, driver assignment, and CSV export
- **Driver account management** — create, edit, and remove delivery driver accounts
- Customer list with order history per customer
- Discount code management — create, activate/deactivate, track usage
- Gift card management — create, track balance and usage
- Product review moderation — approve or reject customer reviews
- Stock alerts
- FAQ management (accordion, categorized, with ordering)
- Newsletter subscriber list with CSV export and Brevo sync

### Security & Infrastructure

- Three-tier role-based access control: **Admin**, **Customer**, **Driver** — enforced at the edge via middleware
- **Rate limiting on all auth endpoints** including forgot password and reset password (Upstash Redis)
- **Per-email cooldown on password reset** — prevents Resend quota abuse
- Input sanitization on all public-facing forms
- Bcrypt password hashing (cost factor 12)
- Automatic session invalidation on password reset
- Custom error pages (404, runtime errors, global error boundary)
- Loading skeletons on every data-driven page
- SEO: sitemap, robots.txt, structured data (JSON-LD), Open Graph, Twitter Cards
- Neon connection pool fix (PrismaPg adapter) for serverless P1017 prevention

---

## 🛠 Tech Stack

| Layer                 | Technology                                          |
| --------------------- | --------------------------------------------------- |
| Framework             | Next.js 15 (App Router, TypeScript, Server Actions) |
| Database              | PostgreSQL (Neon serverless)                        |
| ORM                   | Prisma 7 + PrismaPg adapter                         |
| Auth (Admin & Driver) | NextAuth.js (shared `User` model, role-based)       |
| Auth (Customer)       | Custom session-based auth + Google OAuth            |
| Payments              | Stripe Checkout + Webhooks + Stripe Tax             |
| Styling               | Tailwind CSS + shadcn/ui                            |
| Images                | Cloudinary                                          |
| Email                 | Resend                                              |
| Newsletter Sync       | Brevo (HTTP API)                                    |
| Live Chat             | Crisp                                               |
| Rate Limiting         | Upstash Redis                                       |
| State Management      | Zustand (cart, compare, recently viewed)            |
| Hosting               | Vercel + Vercel Cron                                |

---

## 👤 User Roles

| Role         | Login            | Access                                                        |
| ------------ | ---------------- | ------------------------------------------------------------- |
| **Admin**    | `/admin/login`   | Full control — products, orders, customers, drivers, settings |
| **Driver**   | `/driver/login`  | Only their assigned deliveries; can update delivery status    |
| **Customer** | `/account/login` | Their own orders, addresses, wishlist, loyalty points         |

Admins and drivers share the same underlying `User` table (distinguished by a `role` field), while customers use a separate `Customer` table with its own session system. Route access for `/admin/*` and `/driver/*` is enforced in `middleware.ts` at the edge.

---

## 📋 Prerequisites

- Node.js 18.17+ (20 LTS recommended)
- A [Neon](https://neon.tech) PostgreSQL database (free tier works)
- Accounts for: [Stripe](https://stripe.com), [Cloudinary](https://cloudinary.com), [Resend](https://resend.com), [Upstash](https://upstash.com), [Brevo](https://brevo.com) — all have free tiers sufficient for getting started
- A [Google Cloud](https://console.cloud.google.com) project with OAuth 2.0 credentials (for customer Google sign-in)
- A [Crisp](https://crisp.chat) account (optional, for live chat)

---

## 🚀 Setup Guide

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in each value — see [Environment Variables](#-environment-variables) below.

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

### 5. Create the first admin account

```bash
npx cross-env \
  ADMIN_EMAIL=admin@yourstore.com \
  ADMIN_PASSWORD=yourpassword \
  ADMIN_NAME="Your Name" \
  npx tsx prisma/seed-admin.ts
```

### 6. Set up Google OAuth (for customer sign-in)

1. Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
2. Create an OAuth 2.0 Client ID (Web application type)
3. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/google/callback` (development)
   - `https://yourdomain.com/api/auth/google/callback` (production)
4. Copy the Client ID and Client Secret into your `.env`

### 7. Activate Stripe Tax

Stripe Tax automatically calculates tax based on the customer's shipping address. No extra environment variables are required — it is already enabled in `app/actions/checkout.ts`.

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → **Settings → Tax**
2. Click **Activate Stripe Tax** and enter your business address
3. Click **Add registration** and add at least one country/state where you collect tax
4. In sandbox/test mode you can use a placeholder registration number (e.g. `TEST-123`)

### 8. Run the development server

```bash
npm run dev
```

- Storefront: `http://localhost:3000`
- Cart page: `http://localhost:3000/cart`
- Admin panel: `http://localhost:3000/admin/login`
- Driver portal: `http://localhost:3000/driver/login`

### 9. Set up Stripe webhooks (local testing)

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
| `NEXT_PUBLIC_BASE_URL`               | Your site URL — used for password reset emails and OAuth               |
| `GOOGLE_CLIENT_ID`                   | Google Cloud Console → APIs & Services → Credentials                   |
| `GOOGLE_CLIENT_SECRET`               | Google Cloud Console → APIs & Services → Credentials                   |
| `STRIPE_SECRET_KEY`                  | Stripe Dashboard → Developers → API keys                               |
| `STRIPE_WEBHOOK_SECRET`              | Stripe CLI output, or Dashboard → Webhooks                             |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API keys                               |
| `RESEND_API_KEY`                     | Resend Dashboard → API Keys                                            |
| `RESEND_FROM_EMAIL`                  | Your verified sender address (e.g. `noreply@yourdomain.com`)           |
| `CLOUDINARY_CLOUD_NAME`              | Cloudinary Dashboard → Account Details                                 |
| `CLOUDINARY_API_KEY`                 | Cloudinary Dashboard → Account Details                                 |
| `CLOUDINARY_API_SECRET`              | Cloudinary Dashboard → Account Details                                 |
| `NEXT_PUBLIC_CRISP_WEBSITE_ID`       | Crisp Dashboard → Settings → Website Settings                          |
| `STORE_OWNER_EMAIL`                  | Your email — receives contact form and order notifications             |
| `BREVO_API_KEY`                      | Brevo Dashboard → SMTP & API → API Keys                                |
| `UPSTASH_REDIS_REST_URL`             | Upstash Dashboard → Redis database → REST API                          |
| `UPSTASH_REDIS_REST_TOKEN`           | Upstash Dashboard → Redis database → REST API                          |
| `CRON_SECRET`                        | Generate with `openssl rand -hex 32` (secures the abandoned-cart cron) |
| `EMAIL_TEST_ADDRESS`                 | Your email address — reset emails are sent here in development         |
| `LOW_STOCK_THRESHOLD`                | Integer — variants at or below this stock level trigger a stock alert  |

---

## 🌐 Deploying to Production (Vercel)

1. Push this repository to GitHub
2. Import the project in [Vercel](https://vercel.com/new)
3. Add all environment variables in Vercel's project settings
4. Deploy
5. Run migrations against your production database:
   ```bash
   npx prisma migrate deploy
   ```
6. Configure your Stripe webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
7. Add your production URL to Google Cloud Console → Authorized redirect URIs: `https://yourdomain.com/api/auth/google/callback`
8. Verify your sending domain in [Resend](https://resend.com/domains) and update `RESEND_FROM_EMAIL`
9. Activate Stripe Tax in your live-mode Stripe dashboard (separate from test mode) and add real tax registrations
10. Vercel Cron (configured in `vercel.json`) will automatically run the abandoned-cart email job hourly
11. Create your first production admin via the seed script, then create driver accounts from the admin panel

---

## 📁 Project Structure

```
app/
├── (store)/                  # Public storefront routes
│   ├── cart/                 # Dedicated cart page (/cart) — two-column layout
│   ├── account/              # Customer account, login, register, forgot/reset password
│   ├── checkout/             # Checkout page with discount, gift card, loyalty redemption
│   ├── compare/              # Product comparison page
│   └── products/[slug]/      # Product detail page
├── admin/                    # Admin panel (protected — role: ADMIN only)
│   ├── drivers/              # Driver account management
│   └── orders/[id]/          # Order detail, shipping/carrier/driver assignment
├── driver/                   # Driver portal (protected — role: DRIVER or ADMIN)
│   └── login/
├── actions/                  # Server actions (auth, cart, checkout, products, reviews)
├── api/
│   ├── auth/google/          # Google OAuth routes (redirect + callback)
│   ├── webhooks/stripe/      # Stripe webhook handler
│   └── cron/                 # Scheduled jobs (abandoned carts)
├── error.tsx                 # Route-level error boundary
├── not-found.tsx             # 404 page
└── global-error.tsx          # Root-level error boundary

middleware.ts                 # Edge-level role-based route protection

lib/
├── prisma.ts                 # Prisma client singleton with PrismaPg adapter
├── auth.ts                   # NextAuth configuration (admin + driver roles)
├── customer-auth.ts          # Customer session logic
├── cart-store.ts             # Zustand cart store (variant-aware, variant image-aware)
├── compare-store.ts          # Zustand compare store (up to 3 products)
├── recently-viewed-store.ts  # Zustand recently viewed store (persisted)
├── ratelimit.ts              # Upstash rate limiters
└── sanitize.ts               # Input sanitization helpers

components/
├── admin/
│   ├── BundleManager.tsx         # Frequently Bought Together product search
│   ├── VariantForm.tsx           # Variant create/edit with per-variant image upload
│   └── ...
└── store/
    ├── CartDrawer.tsx            # Slide-out cart drawer with View Cart link
    ├── ProductDetail.tsx         # Variant picker — passes variant image to cart
    ├── ProductReviews.tsx        # Collapsible reviews section
    ├── FrequentlyBoughtTogether.tsx
    └── ...
```

---

## 🗄️ Key Database Models

| Model                 | Purpose                                          |
| --------------------- | ------------------------------------------------ |
| `Product`             | Core product with images, pricing, stock         |
| `ProductVariant`      | Color/size/SKU/price/stock/image per variant     |
| `ProductBundle`       | Frequently Bought Together join table            |
| `PasswordResetToken`  | 1-hour expiry tokens for forgot password flow    |
| `Order` / `OrderItem` | Orders with variant snapshots and status history |
| `Customer`            | Customer accounts with sessions                  |
| `LoyaltyAccount`      | Points balance and transaction history           |
| `DiscountCode`        | Percentage and fixed discount codes              |
| `GiftCard`            | Gift cards with balance tracking                 |
| `Cart` / `CartItem`   | Persistent cart for abandoned cart recovery      |
| `ProductReview`       | Customer reviews with moderation flag            |

---

## ⚠️ Known Limitations

- **Neon free tier sleeps after inactivity** — the first request after idle time may take 10–45 seconds. Upgrade to a paid Neon plan to eliminate this.
- **Abandoned cart emails apply to logged-in customers only** — guest checkouts aren't tracked.
- **Driver deletion unassigns rather than deletes orders** — removing a driver sets their assigned orders back to unassigned.
- **Google OAuth customers have no password** — the forgot password flow will not work for OAuth-only accounts.
- **Resend free tier** — in development, emails can only be sent to the address registered on your Resend account. Verify a domain for production.
- **Stripe Tax requires activation per environment** — test mode and live mode have separate Tax settings in the Stripe dashboard.
- **Admin panel is desktop-only** — the admin panel is not optimised for mobile screens, which is standard for e-commerce admin interfaces.

---

## 🗺️ Possible Future Enhancements

- Driver mobile app or PWA for on-the-go status updates
- Real-time delivery tracking map for customers
- Subscription / recurring orders
- Multi-vendor marketplace support
- Multi-language / multi-currency
- AI-powered product recommendations
- Affiliate / referral program
- "Set password" flow for Google OAuth customers

---

## 📄 License

[Specify your license here — e.g. proprietary, single-site license, or as defined by your sale agreement.]

---

## 💬 Support

For setup help or questions, contact: `support@yourdomain.com`
