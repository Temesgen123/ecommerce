'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import CompareButton from '@/components/store/CompareButton';

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAt?: number | null;
  image: string | null;
  category?: string | null;
  priority?: boolean;
  variants?: {
    id: string;
    color: string | null;
    size: string | null;
    price: number | null;
    stock: number;
  }[];
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
  priority = false,
  variants = [],
}: ProductCardProps) {
  const discount =
    compareAt && compareAt > price
      ? Math.round(((compareAt - price) / compareAt) * 100)
      : null;

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-xl border transition-shadow hover:shadow-md"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      {/* Image */}
      <Link
        href={`/products/${slug}`}
        className="relative block aspect-square overflow-hidden"
      >
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ background: 'var(--bg-elevated)' }}
          >
            <ShoppingBag
              className="h-10 w-10 opacity-20"
              style={{ color: 'var(--text-muted)' }}
            />
          </div>
        )}

        {/* Discount badge */}
        {discount && (
          <span
            className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-bold"
            style={{ background: '#ef4444', color: '#fff' }}
          >
            -{discount}%
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        {category && (
          <p
            className="text-xs font-medium uppercase tracking-wide"
            style={{ color: 'var(--text-muted)' }}
          >
            {category}
          </p>
        )}
        <Link
          href={`/products/${slug}`}
          className="text-sm font-semibold leading-snug hover:underline line-clamp-2"
          style={{ color: 'var(--text-primary)' }}
        >
          {name}
        </Link>
        <div className="flex items-baseline gap-2 mt-auto">
          <span
            className="text-sm font-bold"
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
        <Link
          href={`/products/${slug}`}
          className=" btn-primary flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-bold transition-all duration-200 hover:opacity-80"
        >
          View Details
        </Link>
        <CompareButton
          item={{
            id,
            name,
            slug,
            price,
            compareAt,
            image,
            category: category ?? null,
          }}
        />
      </div>
    </div>
  );
}
