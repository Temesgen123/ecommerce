'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { toggleWishlistItem } from '@/app/actions/wishlist';

interface WishlistItem {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAt: number | null;
    images: string[];
    stock: number;
    variants: {
      id: string;
      color: string | null;
      size: string | null;
      price: number | null;
      stock: number;
    }[];
  };
}

interface Props {
  items: WishlistItem[];
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export default function WishlistPage({ items }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const [isPending, startTransition] = useTransition();
  const [removed, setRemoved] = useState<Set<string>>(new Set());

  function handleAddToCart(item: WishlistItem) {
    const product = item.product;
    // Use first in-stock variant, or just the first variant
    const defaultVariant =
      product.variants.find((v) => v.stock > 0) ?? product.variants[0];

    const effectivePrice = defaultVariant?.price ?? product.price;
    const variantLabel =
      defaultVariant?.color && defaultVariant?.size
        ? `${defaultVariant.color} / ${defaultVariant.size}`
        : (defaultVariant?.color ?? defaultVariant?.size ?? null);

    addItem({
      id: product.id,
      variantId: defaultVariant?.id ?? '',
      variantLabel,
      name: product.name,
      slug: product.slug,
      price: effectivePrice,
      image: product.images[0] ?? null,
    });
    openCart();
  }

  function handleRemove(productId: string) {
    startTransition(async () => {
      await toggleWishlistItem(productId);
      setRemoved((prev) => new Set([...prev, productId]));
    });
  }

  const visibleItems = items.filter((i) => !removed.has(i.product.id));

  if (visibleItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <Heart
          className="h-16 w-16 opacity-20"
          style={{ color: 'var(--text-muted)' }}
        />
        <p
          className="text-lg font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Your wishlist is empty
        </p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Save products you love and come back to them later.
        </p>
        <Link
          href="/products"
          className="btn-navy rounded-lg px-6 py-2.5 text-sm font-semibold"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {visibleItems.map((item) => {
        const product = item.product;
        const totalStock =
          product.variants.length > 0
            ? product.variants.reduce((sum, v) => sum + v.stock, 0)
            : product.stock;
        const inStock = totalStock > 0;

        return (
          <div
            key={item.id}
            className="group relative flex flex-col overflow-hidden rounded-xl border transition-shadow hover:shadow-md"
            style={{
              background: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            {/* Image */}
            <Link
              href={`/products/${product.slug}`}
              className="relative block aspect-square overflow-hidden"
            >
              {product.images[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
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
            </Link>

            {/* Remove button */}
            <button
              onClick={() => handleRemove(product.id)}
              disabled={isPending}
              className="absolute right-2 top-2 rounded-full p-1.5 transition-colors disabled:opacity-50"
              style={{ background: 'rgba(255,255,255,0.9)', color: '#ef4444' }}
              title="Remove from wishlist"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            {/* Info */}
            <div className="flex flex-1 flex-col gap-2 p-3">
              <Link
                href={`/products/${product.slug}`}
                className="text-sm font-semibold leading-snug hover:underline line-clamp-2"
                style={{ color: 'var(--text-primary)' }}
              >
                {product.name}
              </Link>
              <div className="flex items-baseline gap-2 mt-auto">
                <span
                  className="text-sm font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {formatPrice(product.price)}
                </span>
                {product.compareAt && product.compareAt > product.price && (
                  <span
                    className="text-xs line-through"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {formatPrice(product.compareAt)}
                  </span>
                )}
              </div>
              <button
                onClick={() => handleAddToCart(item)}
                disabled={!inStock}
                className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                <ShoppingBag className="h-4 w-4" />
                {inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
