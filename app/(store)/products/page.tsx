import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Suspense } from 'react';
import ProductCard from '@/components/store/ProductsCard';
import SearchBar from '@/components/store/SearchBar';
import Pagination from '@/components/store/Pagination';
import { Search } from 'lucide-react';

// export const dynamic = 'force-dynamic';

export const metadata = { title: 'Products' };

const PRODUCTS_PER_PAGE = 12;

interface Props {
  searchParams: Promise<{ category?: string; q?: string; page?: string }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const { category, q, page: pageParam } = await searchParams;

  const searchTerm = q?.trim() ?? '';
  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10));
  const skip = (currentPage - 1) * PRODUCTS_PER_PAGE;

  // Shared where clause
  const where = {
    published: true,
    ...(category ? { category: { slug: category } } : {}),
    ...(searchTerm
      ? {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' as const } },
            {
              description: {
                contains: searchTerm,
                mode: 'insensitive' as const,
              },
            },
          ],
        }
      : {}),
  };

  const [products, totalCount, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: PRODUCTS_PER_PAGE,
      include: { category: { select: { name: true, slug: true } } },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: { where: { published: true } } } },
      },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE);
  const activeCategory = categories.find((c: any) => c.slug === category);

  // Page heading
  let heading = 'All Products';
  if (searchTerm && activeCategory)
    heading = `"${searchTerm}" in ${activeCategory.name}`;
  else if (searchTerm) heading = `Results for "${searchTerm}"`;
  else if (activeCategory) heading = activeCategory.name;

  // Result range text e.g. "Showing 13–24 of 70 products"
  const rangeStart = totalCount === 0 ? 0 : skip + 1;
  const rangeEnd = Math.min(skip + PRODUCTS_PER_PAGE, totalCount);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Search bar */}
      <div className="mb-8">
        <Suspense>
          <SearchBar />
        </Suspense>
      </div>

      {/* Heading + result count */}
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            {heading}
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            {totalCount === 0
              ? 'No products found'
              : `Showing ${rangeStart}–${rangeEnd} of ${totalCount} product${totalCount !== 1 ? 's' : ''}`}
            {searchTerm && (
              <>
                {' — '}
                <Link
                  href={`/products${category ? `?category=${category}` : ''}`}
                  className="underline hover:no-underline"
                  style={{ color: 'var(--navy-700)' }}
                >
                  Clear search
                </Link>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-8 sm:flex-row">
        {/* Sidebar filters */}
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
                  href={
                    searchTerm
                      ? `/products?q=${encodeURIComponent(searchTerm)}`
                      : '/products'
                  }
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
              {categories.map((cat: any) => (
                <li key={cat.id}>
                  <Link
                    href={
                      searchTerm
                        ? `/products?category=${cat.slug}&q=${encodeURIComponent(searchTerm)}`
                        : `/products?category=${cat.slug}`
                    }
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

        {/* Grid + pagination */}
        <div className="flex-1">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
              <Search
                className="h-12 w-12 opacity-20"
                style={{ color: 'var(--text-muted)' }}
              />
              <div>
                <p
                  className="text-base font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  No products found
                </p>
                <p
                  className="mt-1 text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {searchTerm
                    ? `No results for "${searchTerm}". Try a different search term.`
                    : 'No products in this category yet.'}
                </p>
              </div>
              <Link
                href="/products"
                className="btn-navy rounded-lg px-5 py-2 text-sm font-semibold"
              >
                Browse all products
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                {products.map((product: any) => (
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

              {/* Pagination */}
              <Suspense>
                <Pagination totalPages={totalPages} currentPage={currentPage} />
              </Suspense>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
