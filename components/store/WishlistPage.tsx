'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useWishlistStore } from '@/lib/wishlist-store';
import { useCartStore } from '@/lib/cart-store';

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export default function WishlistPage() {
  const { items, removeItem, clear } = useWishlistStore();
  const addToCart = useCartStore((s) => s.addItem);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <Heart
          className="mx-auto h-16 w-16 mb-4 opacity-20"
          style={{ color: 'var(--text-muted)' }}
        />
        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          Your wishlist is empty
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
          Save products you love by clicking the heart icon.
        </p>
        <Link
          href="/products"
          className="btn-navy rounded-lg px-6 py-3 text-sm font-semibold"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            My Wishlist
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {items.length} saved item{items.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => {
            if (confirm('Clear your entire wishlist?')) clear();
          }}
          className="text-xs font-medium transition-colors hover:underline"
          style={{ color: 'var(--text-muted)' }}
        >
          Clear all
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col rounded-xl border bg-white overflow-hidden"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            {/* Image */}
            <Link
              href={`/products/${item.slug}`}
              className="block aspect-square overflow-hidden"
              style={{ background: 'var(--bg-elevated)' }}
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
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

            {/* Info */}
            <div className="flex flex-1 flex-col gap-3 p-4">
              {item.category && (
                <p
                  className="text-xs uppercase tracking-widest font-medium"
                  style={{ color: 'var(--navy-600)' }}
                >
                  {item.category}
                </p>
              )}
              <Link
                href={`/products/${item.slug}`}
                className="text-sm font-semibold leading-snug hover:underline line-clamp-2"
                style={{ color: 'var(--text-primary)' }}
              >
                {item.name}
              </Link>
              <p
                className="text-base font-bold"
                style={{ color: 'var(--accent)' }}
              >
                {formatPrice(item.price)}
              </p>

              {/* Actions */}
              <div className="mt-auto flex gap-2 pt-1">
                <button
                  onClick={() => {
                    addToCart({
                      id: item.id,
                      name: item.name,
                      slug: item.slug,
                      price: item.price,
                      image: item.image,
                    });
                  }}
                  className="btn-primary flex-1 rounded-lg py-2 text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  Add to Cart
                </button>
                <button
                  onClick={() => removeItem(item.id)}
                  className="rounded-lg p-2 transition-colors hover:bg-red-50"
                  style={{
                    border: '1px solid var(--border-base)',
                    color: 'var(--text-muted)',
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.color =
                      'var(--error-text)')
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.color =
                      'var(--text-muted)')
                  }
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Move all to cart */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={() => {
            items.forEach((item) =>
              addToCart({
                id: item.id,
                name: item.name,
                slug: item.slug,
                price: item.price,
                image: item.image,
              }),
            );
          }}
          className="btn-navy rounded-lg px-8 py-3 text-sm font-semibold inline-flex items-center gap-2"
        >
          <ShoppingBag className="h-4 w-4" />
          Add All to Cart
        </button>
      </div>
    </div>
  );
}
