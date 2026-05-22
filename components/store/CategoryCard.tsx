'use client';

import Link from 'next/link';

interface CategoryCardProps {
  name: string;
  slug: string;
  icon: string;
  count: number;
}

export default function CategoryCard({
  name,
  slug,
  icon,
  count,
}: CategoryCardProps) {
  return (
    <Link
      href={`/products?category=${slug}`}
      className="group flex flex-col items-center gap-3 rounded-xl p-5 text-center transition-all hover:shadow-md"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--navy-300)';
        (e.currentTarget as HTMLElement).style.background = 'var(--navy-50)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor =
          'var(--border-subtle)';
        (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface)';
      }}
    >
      <span className="text-3xl">{icon}</span>
      <div>
        <p
          className="text-sm font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          {name}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {count} products
        </p>
      </div>
    </Link>
  );
}
