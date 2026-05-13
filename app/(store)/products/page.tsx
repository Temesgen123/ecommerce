import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import ProductCard from '@/components/store/ProductsCard';

export const metadata = { title: 'Products' };

interface Props {
  searchParams: Promise<{ category?: string }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const { category } = await searchParams;

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        published: true,
        ...(category ? { category: { slug: category } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: { category: { select: { name: true, slug: true } } },
    }),
    prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: { where: { published: true } } } },
      },
    }),
  ]);

  const activeCategory = categories.find((c) => c.slug === category);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1
          className="text-2xl font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          {activeCategory ? activeCategory.name : 'All Products'}
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          {products.length} product{products.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex flex-col gap-8 sm:flex-row">
        {categories.length > 0 && (
          <aside className="w-full sm:w-48 flex-shrink-0">
            <p
              className="mb-3 text-xs font-bold uppercase tracking-widest"
              style={{ color: 'var(--text-muted)' }}
            >
              Category
            </p>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/products"
                  className="block rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                  style={
                    !category
                      ? { background: 'var(--navy-900)', color: '#fff' }
                      : { color: 'var(--text-secondary)' }
                  }
                >
                  All Products
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/products?category=${cat.slug}`}
                    className="block rounded-lg px-3 py-2 text-sm transition-colors"
                    style={
                      category === cat.slug
                        ? {
                            background: 'var(--navy-900)',
                            color: '#fff',
                            fontWeight: 600,
                          }
                        : { color: 'var(--text-secondary)' }
                    }
                  >
                    {cat.name}
                    <span className="ml-1.5 text-xs opacity-60">
                      ({cat._count.products})
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}

        <div className="flex-1">
          {products.length === 0 ? (
            <div
              className="py-24 text-center text-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              No products found.{' '}
              <Link
                href="/products"
                className="font-semibold underline"
                style={{ color: 'var(--navy-700)' }}
              >
                Clear filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              {products.map((product) => (
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
          )}
        </div>
      </div>
    </div>
  );
}
