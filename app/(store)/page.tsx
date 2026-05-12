import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import ProductCard from '@/components/store/ProductsCard';

export const metadata = { title: 'Home' };

export default async function HomePage() {
  const featured = await prisma.product.findMany({
    where: { published: true, featured: true },
    orderBy: { createdAt: 'desc' },
    take: 4,
    include: { category: { select: { name: true } } },
  });

  return (
    <div>
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, var(--navy-950) 0%, var(--navy-800) 50%, var(--navy-700) 100%)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {/* Background grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(var(--border-base) 1px, transparent 1px), linear-gradient(90deg, var(--border-base) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* Glow orb */}
        <div
          className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'var(--accent)' }}
        />

        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-36 text-center animate-fade-up">
          <p
            className="mb-4 text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'var(--accent-light)' }}
          >
            Free shipping over $50
          </p>
          <h1
            className="text-4xl font-bold tracking-tight sm:text-6xl"
            style={{ color: 'var(--text-primary)' }}
          >
            Quality products,
            <br />
            <span style={{ color: 'var(--accent-light)' }}>
              simply delivered.
            </span>
          </h1>
          <p
            className="mx-auto mt-5 max-w-xl text-base"
            style={{ color: 'var(--text-secondary)' }}
          >
            Handpicked items made to last. Explore our curated collection.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/products"
              className="btn-primary rounded-md px-7 py-3 text-sm font-semibold"
            >
              Shop All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2
              className="text-xl font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              Featured Products
            </h2>
            <Link
              href="/products"
              className="text-sm transition-colors"
              style={{ color: 'var(--accent-light)' }}
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                slug={product.slug}
                price={product.price}
                compareAt={product.compareAt}
                image={product.images[0] ?? null}
                category={product.category?.name}
              />
            ))}
          </div>
        </section>
      )}

      {featured.length === 0 && (
        <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6 text-center">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            No featured products yet.{' '}
            <Link
              href="/products"
              className="underline"
              style={{ color: 'var(--accent-light)' }}
            >
              Browse all products
            </Link>
          </p>
        </section>
      )}
    </div>
  );
}
