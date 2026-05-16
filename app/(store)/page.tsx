import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import ProductCard from '@/components/store/ProductsCard';

export const dynamic = 'force-dynamic';

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
      {/* Hero — navy banner */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'var(--navy-900)' }}
      >
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 text-center animate-fade-up">
          <p
            className="mb-3 text-xs font-bold uppercase tracking-widest"
            style={{ color: 'var(--accent)' }}
          >
            Free shipping on orders over $50
          </p>
          <h1
            className="text-4xl font-extrabold tracking-tight sm:text-6xl"
            style={{ color: '#fff' }}
          >
            Everything you need,
            <br />
            <span style={{ color: 'var(--accent-light)' }}>
              delivered fast.
            </span>
          </h1>
          <p
            className="mx-auto mt-5 max-w-xl text-base"
            style={{ color: 'var(--navy-100)' }}
          >
            Thousands of products across every category. Great prices, fast
            shipping.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/products"
              className="btn-primary rounded-lg px-8 py-3.5 text-base"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        {featured.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-xl font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                Featured Products
              </h2>
              <Link
                href="/products"
                className="text-sm font-semibold transition-colors"
                style={{ color: 'var(--navy-700)' }}
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {featured.map((product: any) => (
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
          </>
        )}
        {featured.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No featured products yet.{' '}
              <Link
                href="/products"
                className="font-semibold underline"
                style={{ color: 'var(--navy-700)' }}
              >
                Browse all
              </Link>
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
