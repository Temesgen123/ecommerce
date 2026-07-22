# NextShop — Full-Stack E-Commerce Platform

A production-ready, fully-featured e-commerce application built with Next.js 15, TypeScript, and PostgreSQL. Includes a complete admin panel, customer accounts, Stripe payments, loyalty program, gift cards, abandoned cart recovery, a dedicated delivery driver system, Google OAuth for customers, product bundles, collapsible reviews, forgot password flow, and more — everything needed to launch a real online store with in-house or third-party delivery operations.

---

## ✨ Features

### Storefront

- Homepage with auto-playing promotional carousel and category showcase
- Global navbar with horizontal scrolling category menu and integrated search — accessible from any page
- Product catalog with category filtering, price range, and sorting
- Amazon-style product detail page with vertical thumbnail strip, sticky buy box, and image gallery
- Hover-to-preview thumbnails (desktop) and tap-to-preview (mobile)
- Color variant image cards with per-variant pricing and sold-out overlays
- **Frequently Bought Together** — admin-curated product bundles with add-all-to-cart and per-item toggle
- **Collapsible product reviews** — star ratings, verified purchase badges, and review form in a toggleable section
- Product comparison (up to 3 side-by-side) with floating compare drawer and dedicated compare page
- Recently viewed products (Zustand-powered, persisted in localStorage)
- Wishlist (persists per logged-in customer)
- Full-text search with pagination
- Social share buttons (Facebook, X, WhatsApp, Pinterest, Copy Link)
- Stock badges — "Only X left" urgency labels
- Mobile-responsive navigation with category sidebar

### Product Variants & Bundles

- Every product supports color, size, and brand attributes
- Per-variant stock tracking, price overrides, and individual variant images
- Admin UI for creating and managing variants (color, size, SKU, stock, price, image)
- **Per-variant image upload** — each color variant can have its own image; selecting a color updates the main product image
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
| Payments              | Stripe Checkout + Webhooks                          |
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

Admins and drivers share the same underlying `User` table (distinguished by a `role` field), while customers use a separate `Customer` table with its own session system. Route access for `/admin/*` and `/driver/*` is enforced in `middleware.ts` at the edge — admins may also access `/driver/*` for oversight, but drivers can never access `/admin/*`.

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

This populates demo products across multiple categories with real Cloudinary-hosted images.

### 5. Create the first admin account

```bash
npx cross-env \
  ADMIN_EMAIL=admin@yourstore.com \
  ADMIN_PASSWORD=yourpassword \
  ADMIN_NAME="Your Name" \
  npx tsx prisma/seed-admin.ts
```

Once logged in, additional admin accounts can be created the same way, and **driver accounts can be created directly from the admin panel** at `/admin/drivers`.

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
9. Vercel Cron (configured in `vercel.json`) will automatically run the abandoned-cart email job hourly — no extra setup needed
10. Create your first production admin via the seed script, then create driver accounts from the admin panel

---

## 📁 Project Structure

```
app/
├── (store)/                  # Public storefront routes
│   ├── account/              # Customer account, login, register, forgot/reset password
│   ├── compare/              # Product comparison page
│   └── products/[slug]/      # Product detail page
├── admin/                    # Admin panel (protected — role: ADMIN only)
│   ├── drivers/              # Driver account management
│   └── orders/[id]/          # Order detail, shipping/carrier/driver assignment
├── driver/                   # Driver portal (protected — role: DRIVER or ADMIN)
│   └── login/
├── actions/                  # Server actions (auth, cart, products, reviews, bundles, password reset)
├── api/
│   ├── auth/google/          # Google OAuth routes (redirect + callback)
│   ├── webhooks/stripe/      # Stripe webhook handler
│   └── cron/                 # Scheduled jobs (abandoned carts)
├── error.tsx                 # Route-level error boundary
├── not-found.tsx             # 404 page
└── global-error.tsx          # Root-level error boundary

middleware.ts                 # Edge-level role-based route protection for /admin and /driver

lib/
├── prisma.ts                 # Prisma client singleton with PrismaPg adapter
├── auth.ts                   # NextAuth configuration (admin + driver roles)
├── customer-auth.ts          # Customer session logic
├── cart-store.ts             # Zustand cart store (variant-aware)
├── compare-store.ts          # Zustand compare store (up to 3 products)
├── recently-viewed-store.ts  # Zustand recently viewed store (persisted)
├── ratelimit.ts              # Upstash rate limiters
└── sanitize.ts               # Input sanitization helpers

components/
├── admin/
│   ├── BundleManager.tsx     # Search and manage Frequently Bought Together products
│   ├── VariantForm.tsx       # Variant create/edit with per-variant image upload
│   ├── VariantsClient.tsx    # Variant table with image column
│   └── ...                   # Other admin components
├── driver/                   # Driver portal components
└── store/
    ├── ProductDetail.tsx         # Product detail with variant picker, gallery, bundles
    ├── ProductReviews.tsx        # Collapsible reviews section with write-a-review form
    ├── FrequentlyBoughtTogether.tsx  # Bundle UI with per-item toggle and add-all-to-cart
    ├── ReviewForm.tsx            # Customer review submission form
    ├── RelatedProducts.tsx       # Same-category product suggestions
    ├── RecentlyViewed.tsx        # Recently viewed products from Zustand store
    ├── LoginForm.tsx             # Customer login with Google sign-in + forgot password link
    └── ...                       # Other store components

prisma/
├── schema.prisma             # Full database schema including ProductBundle, PasswordResetToken
├── migrations/               # All database migrations
└── *-seed.ts                 # Demo data and admin seed scripts
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
- **Abandoned cart emails apply to logged-in customers only** — guest checkouts aren't tracked (no persistent identity to attach a cart to).
- **Driver deletion unassigns rather than deletes orders** — removing a driver account sets their assigned orders back to unassigned; an admin will need to manually reassign them.
- **Google OAuth customers have no password** — if a customer signs up via Google and later tries to log in with email/password, they won't have a password set. The forgot password flow will not work for OAuth-only accounts.
- **Resend free tier** — in development, emails can only be sent to the address registered on your Resend account. Verify a domain for production to send to any address.
- **Crisp, Brevo, and Upstash all use free tiers** — sufficient for a small-to-medium store; upgrade as you scale.

---

## 🗺️ Possible Future Enhancements

- Driver mobile app or PWA support for on-the-go status updates
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
