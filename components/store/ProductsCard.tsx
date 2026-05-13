'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAt?: number | null;
  image?: string | null;
  category?: string | null;
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export default function ProductCard({
  id,
  name,
  slug,
  price,
  compareAt,
  image,
  category,
}: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="card group relative flex flex-col overflow-hidden">
      {/* Image */}
      <Link
        href={`/products/${slug}`}
        className="block aspect-square overflow-hidden"
        style={{ background: 'var(--bg-elevated)' }}
      >
        {image ? (
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ color: 'var(--text-muted)' }}
          >
            <ShoppingBag className="h-12 w-12 opacity-30" />
          </div>
        )}
      </Link>

      {compareAt && compareAt > price && (
        <span
          className="absolute left-3 top-3 rounded-full px-2 py-0.5 text-xs font-bold"
          style={{ background: 'var(--error-bg)', color: 'var(--error-text)' }}
        >
          Sale
        </span>
      )}

      <div className="flex flex-1 flex-col gap-2 p-4">
        {category && (
          <p
            className="text-xs uppercase tracking-widest font-medium"
            style={{ color: 'var(--navy-600)' }}
          >
            {category}
          </p>
        )}
        <Link
          href={`/products/${slug}`}
          className="text-sm font-semibold leading-snug line-clamp-2 hover:underline"
          style={{ color: 'var(--text-primary)' }}
        >
          {name}
        </Link>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <div className="flex items-baseline gap-1.5">
            <span
              className="text-base font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              {formatPrice(price)}
            </span>
            {compareAt && compareAt > price && (
              <span
                className="text-xs line-through"
                style={{ color: 'var(--text-muted)' }}
              >
                {formatPrice(compareAt)}
              </span>
            )}
          </div>
          <button
            onClick={() =>
              addItem({ id, name, slug, price, image: image ?? null })
            }
            className="btn-primary rounded-lg px-3 py-1.5 text-xs"
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
