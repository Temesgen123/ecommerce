'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import WishlistButton from '@/components/store/WishlistButton';
import CompareButton from '@/components/store/CompareButton';

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAt?: number | null;
  image?: string | null;
  category?: string | null;
  priority?: boolean; // pass true for above-the-fold cards
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
}: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="card group relative flex flex-col overflow-hidden">
      {/* Image */}
      <Link
        href={`/products/${slug}`}
        className="block aspect-square overflow-hidden relative"
        style={{ background: 'var(--bg-elevated)' }}
      >
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            loading={priority ? 'eager' : 'lazy'}
            priority={priority}
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+"
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

      {/* Sale badge */}
      {compareAt && compareAt > price && (
        <span
          className="absolute left-3 top-3 rounded-full px-2 py-0.5 text-xs font-bold"
          style={{ background: 'var(--error-bg)', color: 'var(--error-text)' }}
        >
          Sale
        </span>
      )}

      {/* Wishlist button */}
      <div className="absolute right-3 top-3">
        <div
          className="rounded-full p-1.5 shadow-sm"
          style={{ background: 'rgba(255,255,255,0.9)' }}
        >
          <WishlistButton productId={id} size="sm" />
        </div>
      </div>

      {/* Info */}
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

        {/* Price row */}
        <div className="mt-auto flex items-baseline gap-1.5 pt-2">
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

        {/* Button */}
        <button
          onClick={() =>
            addItem({ id, name, slug, price, image: image ?? null })
          }
          className="btn-primary w-full rounded-lg py-2 text-xs font-semibold sm:w-auto sm:px-3 sm:py-1.5"
        >
          Add to cart
        </button>
        <div className="flex justify-center pt-1">
          <CompareButton
            item={{
              id,
              name,
              slug,
              price,
              compareAt,
              image: image ?? null,
              category: category ?? null,
            }}
          />
        </div>
      </div>
    </div>
  );
}
