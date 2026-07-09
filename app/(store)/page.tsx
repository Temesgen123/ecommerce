// Store page
import Link from 'next/link';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import ProductCard from '@/components/store/ProductCard';
import CategoryCard from '@/components/store/CategoryCard';
import { ArrowRight, Truck, Shield, RotateCcw, Headphones } from 'lucide-react';
import HeroCarousel from '@/components/store/HeroCarousel';

export const dynamic = 'force-dynamic';

const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'MyStore — Quality Products, Simply Delivered',
  description:
    'Shop thousands of products across electronics, apparel, home goods, and more. Free shipping on orders over $50.',
  openGraph: {
    type: 'website',
    title: 'MyStore — Quality Products, Simply Delivered',
    description:
      'Shop thousands of products across electronics, apparel, home goods, and more.',
    url: baseUrl,
  },
  alternates: { canonical: baseUrl },
};

// Replace each URL below with the corresponding value from
// prisma/category-images.json after running fetch-category-images.ts.
// Format: cloud_name comes from your own Cloudinary account.
const CATEGORY_IMAGES: Record<string, string> = {
  electronics:
    'https://res.cloudinary.com/deiqvcg5b/image/upload/v1781900350/categories/electronics.jpg',
  computers:
    'https://res.cloudinary.com/deiqvcg5b/image/upload/v1781900352/categories/computers.jpg',
  smartphones:
    'https://res.cloudinary.com/deiqvcg5b/image/upload/v1783231188/categories/smartphones.jpg',
  apparel:
    'https://res.cloudinary.com/deiqvcg5b/image/upload/v1781900357/categories/apparel.jpg',
  shoes:
    'https://res.cloudinary.com/deiqvcg5b/image/upload/v1781900359/categories/shoes.jpg',
  accessories:
    'https://res.cloudinary.com/deiqvcg5b/image/upload/v1783231194/categories/accessories.jpg',
  'home-goods':
    'https://res.cloudinary.com/deiqvcg5b/image/upload/v1783231196/categories/home-goods.jpg',
  kitchen:
    'https://res.cloudinary.com/deiqvcg5b/image/upload/v1781900365/categories/kitchen.jpg',
  books:
    'https://res.cloudinary.com/deiqvcg5b/image/upload/v1781900367/categories/books.jpg',
  'sports-outdoors':
    'https://res.cloudinary.com/deiqvcg5b/image/upload/v1781900368/categories/sports-outdoors.jpg',
  'toys-games':
    'https://res.cloudinary.com/deiqvcg5b/image/upload/v1781900371/categories/toys-games.jpg',
  beauty:
    'https://res.cloudinary.com/deiqvcg5b/image/upload/v1781900373/categories/beauty.jpg',
  'tools-diy':
    'https://res.cloudinary.com/deiqvcg5b/image/upload/v1783231208/categories/tools-diy.jpg',
  'pet-supplies':
    'https://res.cloudinary.com/deiqvcg5b/image/upload/v1783231210/categories/pet-supplies.jpg',
  gaming:
    'https://res.cloudinary.com/deiqvcg5b/image/upload/v1783231212/categories/gaming.jpg',
  garden:
    'https://res.cloudinary.com/deiqvcg5b/image/upload/v1781900384/categories/garden.jpg',
  'health-pharmacy':
    'https://res.cloudinary.com/deiqvcg5b/image/upload/v1781900387/categories/health-wellness.jpg',
  'health-wellness':
    'https://res.cloudinary.com/deiqvcg5b/image/upload/v1781900387/categories/health-wellness.jpg',
  'musical-instruments':
    'https://res.cloudinary.com/deiqvcg5b/image/upload/v1781900388/categories/musical-instruments.jpg',
  'travel-luggage':
    'https://res.cloudinary.com/deiqvcg5b/image/upload/v1781900390/categories/travel-luggage.jpg',
  'office-supplies':
    'https://res.cloudinary.com/deiqvcg5b/image/upload/v1781900392/categories/office-supplies.jpg',
  'baby-kids':
    'https://res.cloudinary.com/deiqvcg5b/image/upload/v1783231224/categories/baby-kids.jpg',
  'auto-parts-accessories':
    'https://res.cloudinary.com/deiqvcg5b/image/upload/v1781900395/categories/auto-parts-accessories.jpg',
};

const FALLBACK_IMAGE =
  'https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/categories/fallback.jpg';

export default async function HomePage() {
  const [featured, newArrivals, categories] = await Promise.all([
    prisma.product.findMany({
      where: { published: true, featured: true },
      orderBy: { createdAt: 'desc' },
      take: 4,
      include: {
        category: { select: { name: true } },
        variants: {
          select: {
            id: true,
            color: true,
            size: true,
            price: true,
            stock: true,
          },
        },
      },
    }),
    prisma.product.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 4,
      include: {
        category: { select: { name: true } },
        variants: {
          select: {
            id: true,
            color: true,
            size: true,
            price: true,
            stock: true,
          },
        },
      },
    }),
    prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: { where: { published: true } } } },
      },
    }),
  ]);

  const topCategories = [...categories]
    .sort((a: any, b: any) => b._count.products - a._count.products)
    .slice(0, 8);

  // JSON-LD for homepage
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'MyStore',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/products?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="space-y-0">
        {/* Hero */}
        <section
          className="relative overflow-hidden"
          style={{ background: 'var(--navy-900)' }}
        >
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          <div
            className="absolute -top-20 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full blur-3xl opacity-20"
            style={{ background: 'var(--accent)' }}
          />
          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left — text content */}
              <div>
                <span
                  className="inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest mb-4"
                  style={{
                    background: 'rgba(249,115,22,0.2)',
                    color: 'var(--accent)',
                  }}
                >
                  Free shipping on orders over $50
                </span>
                <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl leading-tight">
                  Everything you need,{' '}
                  <span style={{ color: 'var(--accent)' }}>
                    delivered fast.
                  </span>
                </h1>
                <p
                  className="mt-5 text-lg max-w-lg"
                  style={{ color: 'var(--navy-100)' }}
                >
                  Thousands of products across every category. Great prices,
                  fast shipping, and hassle-free returns.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/products"
                    className="btn-primary rounded-lg px-8 py-3.5 text-base font-bold inline-flex items-center gap-2"
                  >
                    Shop Now <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/track-order"
                    className="btn-ghost rounded-lg px-6 py-3.5 text-base font-semibold"
                    style={{
                      borderColor: 'rgba(255,255,255,0.2)',
                      color: '#fff',
                    }}
                  >
                    Track Order
                  </Link>
                </div>
              </div>

              {/* Right — promotional carousel */}
              <div className="hidden lg:block h-72">
                <HeroCarousel />
              </div>
            </div>
          </div>
        </section>

        {/* Trust badges */}
        <section
          style={{
            background: 'var(--bg-elevated)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid grid-cols-2 gap-0 lg:grid-cols-4">
              {[
                {
                  icon: <Truck className="h-5 w-5" />,
                  title: 'Free Shipping',
                  sub: 'On orders over $50',
                },
                {
                  icon: <Shield className="h-5 w-5" />,
                  title: 'Secure Payments',
                  sub: 'SSL encrypted checkout',
                },
                {
                  icon: <RotateCcw className="h-5 w-5" />,
                  title: 'Easy Returns',
                  sub: '30-day return policy',
                },
                {
                  icon: <Headphones className="h-5 w-5" />,
                  title: '24/7 Support',
                  sub: 'Always here to help',
                },
              ].map(({ icon, title, sub }, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-6 py-5"
                  style={{
                    borderRight:
                      i < 3 ? '1px solid var(--border-subtle)' : 'none',
                  }}
                >
                  <div
                    className="flex-shrink-0 rounded-lg p-2"
                    style={{
                      background: 'var(--navy-50)',
                      color: 'var(--navy-700)',
                    }}
                  >
                    {icon}
                  </div>
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {title}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Category grid */}
        {topCategories.length > 0 && (
          <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-xl font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                Shop by Category
              </h2>
              <Link
                href="/products"
                className="text-sm font-semibold"
                style={{ color: 'var(--navy-700)' }}
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {topCategories.map((cat: any) => (
                <CategoryCard
                  key={cat.id}
                  name={cat.name}
                  slug={cat.slug}
                  image={CATEGORY_IMAGES[cat.slug] ?? FALLBACK_IMAGE}
                  count={cat._count.products}
                />
              ))}
            </div>
          </section>
        )}

        {/* Promo banner */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-4">
          <div
            className="relative overflow-hidden rounded-2xl px-8 py-10"
            style={{
              background:
                'linear-gradient(135deg, var(--navy-700) 0%, var(--navy-900) 100%)',
            }}
          >
            <div
              className="absolute right-0 top-0 h-full w-1/2 opacity-10"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 70% 50%, var(--accent) 0%, transparent 60%)',
              }}
            />
            <div className="relative max-w-lg">
              <span
                className="inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest mb-3"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                Limited Time
              </span>
              <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
                Up to 40% off sale items
              </h2>
              <p
                className="mt-2 text-base"
                style={{ color: 'var(--navy-100)' }}
              >
                Shop our sale collection and save big on hundreds of products.
              </p>
              <Link
                href="/products"
                className="mt-5 inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-bold"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                Shop the Sale <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Featured products */}
        {featured.length > 0 && (
          <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-xl font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                Featured Products
              </h2>
              <Link
                href="/products"
                className="text-sm font-semibold"
                style={{ color: 'var(--navy-700)' }}
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {featured.map((product: any, index: number) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  price={product.price}
                  compareAt={product.compareAt}
                  image={product.images[0] ?? null}
                  category={product.category?.name}
                  priority={index < 4}
                  variants={product.variants ?? []}
                />
              ))}
            </div>
          </section>
        )}

        {/* New arrivals */}
        {newArrivals.length > 0 && (
          <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2
                  className="text-xl font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  New Arrivals
                </h2>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Just added to the store
                </p>
              </div>
              <Link
                href="/products"
                className="text-sm font-semibold"
                style={{ color: 'var(--navy-700)' }}
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {newArrivals.map((product: any, index: number) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  price={product.price}
                  compareAt={product.compareAt}
                  image={product.images[0] ?? null}
                  category={product.category?.name}
                  priority={index < 4}
                  variants={product.variants ?? []}
                />
              ))}
            </div>
          </section>
        )}

        {/* Bottom CTA */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div
            className="rounded-2xl p-10 text-center"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <h2
              className="text-2xl font-extrabold"
              style={{ color: 'var(--text-primary)' }}
            >
              Ready to start shopping?
            </h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              Browse thousands of products across 20+ categories.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-2 btn-navy rounded-lg px-8 py-3 text-sm font-bold"
            >
              Browse All Products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
