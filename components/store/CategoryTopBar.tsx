'use client';

import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
}

interface Props {
  categories: Category[];
  category?: string;
  searchTerm?: string;
  sort?: string;
}

export default function CategoryTopBar({
  categories,
  category,
  searchTerm,
  sort,
}: Props) {
  return (
    <div className="mb-6 -mx-4 sm:-mx-6 px-4 sm:px-6">
      <p
        className="mb-3 text-xs font-bold uppercase tracking-widest"
        style={{ color: 'var(--text-muted)' }}
      >
        Category
      </p>

      {/* Horizontal scroll container — no wrap, scrollbar hidden */}
      <div
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
        style={{ scrollbarWidth: 'none' }}
      >
        <Link
          href={
            searchTerm
              ? `/products?q=${encodeURIComponent(searchTerm)}`
              : '/products'
          }
          className="flex-shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors"
          style={
            !category
              ? { background: 'var(--navy-900)', color: '#fff' }
              : {
                  color: 'var(--text-secondary)',
                  background: 'var(--bg-elevated)',
                }
          }
        >
          All Products
        </Link>

        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.slug}${searchTerm ? `&q=${encodeURIComponent(searchTerm)}` : ''}${sort ? `&sort=${sort}` : ''}`}
            className="flex-shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors"
            style={
              category === cat.slug
                ? {
                    background: 'var(--navy-900)',
                    color: '#fff',
                    fontWeight: 600,
                  }
                : {
                    color: 'var(--text-secondary)',
                    background: 'var(--bg-elevated)',
                  }
            }
          >
            {cat.name}
            <span className="ml-1.5 text-xs opacity-60">
              ({cat._count.products})
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
