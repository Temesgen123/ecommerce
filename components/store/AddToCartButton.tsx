'use client';

import { useState } from 'react';
import { ShoppingBag, Check } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';

interface Props {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string | null;
    stock: number;
  };
}

export default function AddToCartButton({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.image,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  if (product.stock === 0) {
    return (
      <button
        disabled
        className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium cursor-not-allowed"
        style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
      >
        Out of Stock
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold transition-all duration-200"
      style={
        added
          ? {
              background: 'var(--success-bg)',
              color: 'var(--success-text)',
              border: '1px solid rgba(16,185,129,0.3)',
            }
          : { background: 'var(--accent)', color: '#fff' }
      }
    >
      {added ? (
        <>
          <Check className="h-4 w-4" /> Added to Cart
        </>
      ) : (
        <>
          <ShoppingBag className="h-4 w-4" /> Add to Cart
        </>
      )}
    </button>
  );
}
