'use client';

import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Props {
  categories: Category[];
  activeCategory?: string;
}

/**
 * Horizontal scrolling category bar, rendered inside the dark navy
 * navbar header — colors adjusted to sit on --navy-900 background
 * rather than a light page surface.
 */
export default function CategoryNavBar({ categories, activeCategory }: Props) {
  return (
    <div
      className="w-full overflow-x-auto scrollbar-hide border-t"
      style={{ borderColor: 'var(--navy-800)' }}
    >
      <div className="mx-auto flex max-w-6xl gap-2 px-4 py-2 sm:px-6">
        <Link
          href="/products"
          className="flex-shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors hover:opacity-80"
          style={
            !activeCategory
              ? { background: 'var(--accent)', color: '#fff' }
              : { color: 'var(--navy-100)' }
          }
          onMouseEnter={(e) => {
            if (activeCategory)
              (e.currentTarget as HTMLElement).style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            if (activeCategory)
              (e.currentTarget as HTMLElement).style.color = 'var(--navy-100)';
          }}
        >
          All Products
        </Link>

        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.slug}`}
            className="flex-shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition-colors hover:opacity-80"
            style={
              activeCategory === cat.slug
                ? {
                    background: 'var(--accent)',
                    color: '#fff',
                    fontWeight: 600,
                  }
                : { color: 'var(--navy-100)' }
            }
            onMouseEnter={(e) => {
              if (activeCategory !== cat.slug)
                (e.currentTarget as HTMLElement).style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              if (activeCategory !== cat.slug)
                (e.currentTarget as HTMLElement).style.color =
                  'var(--navy-100)';
            }}
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
