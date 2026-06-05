import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import ProductCard from '@/components/store/ProductCard';
import SearchBar from '@/components/store/SearchBar';
import Pagination from '@/components/store/Pagination';
import { Search } from 'lucide-react';

export const dynamic = 'force-dynamic';
const PER_PAGE = 12;

interface Props {
  searchParams: Promise<{
    category?: string;
    q?: string;
    page?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { category, q } = await searchParams;
  let title = 'All Products';
  let description = 'Browse thousands of products at MyStore.';
  if (category) {
    const cat = await prisma.category.findUnique({ where: { slug: category } });
    if (cat) {
      title = cat.name;
      description = cat.description ?? `Shop ${cat.name} at MyStore.`;
    }
  }
  if (q) {
    title = `Search: "${q}"`;
    description = `Search results for "${q}" at MyStore.`;
  }
  return {
    title,
    description,
    openGraph: { title: `${title} | MyStore`, description },
  };
}

export default async function ProductsPage({ searchParams }: Props) {
  const {
    category,
    q,
    page: pageParam,
    sort,
    minPrice,
    maxPrice,
  } = await searchParams;

  const searchTerm = q?.trim() ?? '';
  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10));
  const skip = (currentPage - 1) * PER_PAGE;

  // Build orderBy from sort param
  const orderBy: any =
    sort === 'price-asc'
      ? { price: 'asc' }
      : sort === 'price-desc'
        ? { price: 'desc' }
        : sort === 'name-asc'
          ? { name: 'asc' }
          : sort === 'name-desc'
            ? { name: 'desc' }
            : { createdAt: 'desc' };

  // Build price filter
  const priceFilter: any = {};
  if (minPrice) priceFilter.gte = Math.round(parseFloat(minPrice) * 100);
  if (maxPrice) priceFilter.lte = Math.round(parseFloat(maxPrice) * 100);

  const where: any = {
    published: true,
    ...(category ? { category: { slug: category } } : {}),
    ...(Object.keys(priceFilter).length ? { price: priceFilter } : {}),
    ...(searchTerm
      ? {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [products, totalCount, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: PER_PAGE,
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

  const totalPages = Math.ceil(totalCount / PER_PAGE);
  const activeCategory = categories.find((c: any) => c.slug === category);
  const rangeStart = totalCount === 0 ? 0 : skip + 1;
  const rangeEnd = Math.min(skip + PER_PAGE, totalCount);

  let heading = 'All Products';
  if (searchTerm && activeCategory)
    heading = `"${searchTerm}" in ${(activeCategory as any).name}`;
  else if (searchTerm) heading = `Results for "${searchTerm}"`;
  else if (activeCategory) heading = (activeCategory as any).name;

  // Active filter tags
  const activeFilters = [];
  if (minPrice) activeFilters.push(`Min $${minPrice}`);
  if (maxPrice) activeFilters.push(`Max $${maxPrice}`);
  if (sort)
    activeFilters.push(
      {
        'price-asc': 'Price ↑',
        'price-desc': 'Price ↓',
        'name-asc': 'A–Z',
        'name-desc': 'Z–A',
      }[sort] ?? sort,
    );

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <Suspense>
            <SearchBar />
          </Suspense>
        </div>

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
            </p>
          </div>
          {/* Active filter badges */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((f) => (
                <span
                  key={f}
                  className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  style={{
                    background: 'var(--navy-50)',
                    color: 'var(--navy-700)',
                  }}
                >
                  {f}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-8 sm:flex-row">
          {/* Sidebar */}
          {categories.length > 0 && (
            <aside className="w-full sm:w-48 flex-shrink-0 bg-violet-700 p-2">
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
                      href={`/products?category=${cat.slug}${searchTerm ? `&q=${encodeURIComponent(searchTerm)}` : ''}${sort ? `&sort=${sort}` : ''}`}
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

          {/* Grid */}
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
                <Search
                  className="h-12 w-12 opacity-20"
                  style={{ color: 'var(--text-muted)' }}
                />
                <p
                  className="text-base font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  No products found
                </p>
                <Link
                  href="/products"
                  className="btn-navy rounded-lg px-5 py-2 text-sm font-semibold"
                >
                  Clear all filters
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
                <Suspense>
                  <Pagination
                    totalPages={totalPages}
                    currentPage={currentPage}
                  />
                </Suspense>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
