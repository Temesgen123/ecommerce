'use client';

import { useState } from 'react';
import { ShoppingBag, Check } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';

interface Variant {
  id: string;
  color: string | null;
  size: string | null;
  price: number | null;
  stock: number;
}

interface Props {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string | null;
    stock: number;
    variants: Variant[];
  };
}

export default function AddToCartButton({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  // Use the first in-stock variant, or just the first variant
  const defaultVariant =
    product.variants.find((v) => v.stock > 0) ?? product.variants[0];

  // Effective stock: sum of all variant stocks, or fall back to product.stock
  const totalStock =
    product.variants.length > 0
      ? product.variants.reduce((sum, v) => sum + v.stock, 0)
      : product.stock;

  // Effective price: variant override or base price
  const effectivePrice = defaultVariant?.price ?? product.price;

  // Variant label — null for default (no-option) variants
  const variantLabel =
    defaultVariant?.color && defaultVariant?.size
      ? `${defaultVariant.color} / ${defaultVariant.size}`
      : (defaultVariant?.color ?? defaultVariant?.size ?? null);

  function handleAdd() {
    if (!defaultVariant) return;
    addItem({
      id: product.id,
      variantId: defaultVariant.id,
      variantLabel,
      name: product.name,
      slug: product.slug,
      price: effectivePrice,
      image: product.image,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  if (totalStock === 0) {
    return (
      <button
        disabled
        className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold cursor-not-allowed"
        style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
      >
        Out of Stock
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold transition-all duration-200"
      style={
        added
          ? { background: 'var(--success-bg)', color: 'var(--success-text)' }
          : { background: 'var(--accent)', color: '#fff' }
      }
    >
      {added ? (
        <>
          <Check className="h-4 w-4" /> Added!
        </>
      ) : (
        <>
          <ShoppingBag className="h-4 w-4" /> Add to Cart
        </>
      )}
    </button>
  );
}
