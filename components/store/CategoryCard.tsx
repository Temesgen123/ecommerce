'use client';

import Link from 'next/link';
import Image from 'next/image';

interface CategoryCardProps {
  name: string;
  slug: string;
  image: string;
  count: number;
}

export default function CategoryCard({
  name,
  slug,
  image,
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
      <div className="relative h-16 w-16 overflow-hidden rounded-lg">
        <Image
          src={image}
          alt={name}
          fill
          sizes="64px"
          className="object-cover transition-transform group-hover:scale-105"
        />
      </div>
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
