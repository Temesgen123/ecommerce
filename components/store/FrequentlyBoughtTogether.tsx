'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ShoppingBag, Plus, Check } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';

interface BundleProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAt: number | null;
  images: string[];
  variants: { id: string; stock: number; price: number | null }[];
}

interface Props {
  mainProduct: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: string[];
    variants: { id: string; stock: number; price: number | null }[];
  };
  bundleProducts: BundleProduct[];
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export default function FrequentlyBoughtTogether({
  mainProduct,
  bundleProducts,
}: Props) {
  if (bundleProducts.length === 0) return null;

  const allProducts = [mainProduct, ...bundleProducts];
  const [selected, setSelected] = useState<Set<string>>(
    new Set(allProducts.map((p) => p.id)),
  );
  const [addedAll, setAddedAll] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  function toggleProduct(id: string) {
    // main product can't be deselected
    if (id === mainProduct.id) return;
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const selectedProducts = allProducts.filter((p) => selected.has(p.id));
  const totalPrice = selectedProducts.reduce((sum, p) => {
    const cheapestVariant = p.variants
      .filter((v) => v.stock > 0)
      .sort((a, b) => (a.price ?? p.price) - (b.price ?? p.price))[0];
    return sum + (cheapestVariant?.price ?? p.price);
  }, 0);

  function handleAddAll() {
    let addedCount = 0;
    for (const p of selectedProducts) {
      const variant = p.variants.find((v) => v.stock > 0);
      if (!variant) continue;
      addItem({
        id: p.id,
        variantId: variant.id,
        variantLabel: null,
        name: p.name,
        slug: p.slug,
        price: variant.price ?? p.price,
        image: p.images[0] ?? null,
      });
      addedCount++;
    }
    if (addedCount > 0) {
      setAddedAll(true);
      setTimeout(() => setAddedAll(false), 2000);
      openCart();
    }
  }

  return (
    <div
      className="mt-12 rounded-2xl border p-6 space-y-5"
      style={{
        borderColor: 'var(--border-subtle)',
        background: 'var(--bg-surface)',
      }}
    >
      <h2 className="text-lg font-bold">Frequently Bought Together</h2>

      {/* Product row */}
      <div className="flex flex-wrap items-center gap-3">
        {allProducts.map((p, i) => {
          const isSelected = selected.has(p.id);
          const isMain = p.id === mainProduct.id;
          return (
            <div key={p.id} className="flex items-center gap-3">
              {i > 0 && (
                <Plus
                  className="h-4 w-4 flex-shrink-0"
                  style={{ color: 'var(--text-muted)' }}
                />
              )}
              <button
                type="button"
                onClick={() => toggleProduct(p.id)}
                className="relative flex-shrink-0 overflow-hidden rounded-xl transition-all"
                style={{
                  width: 80,
                  height: 80,
                  border: isSelected
                    ? '2px solid var(--accent)'
                    : '2px solid var(--border-base)',
                  opacity: isSelected ? 1 : 0.45,
                  cursor: isMain ? 'default' : 'pointer',
                }}
                title={isMain ? 'Main product (always included)' : p.name}
              >
                {p.images[0] ? (
                  <Image
                    src={p.images[0]}
                    alt={p.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <div
                    className="h-full w-full"
                    style={{ background: 'var(--bg-elevated)' }}
                  />
                )}
                {/* Checkmark overlay */}
                {isSelected && (
                  <div
                    className="absolute bottom-1 right-1 rounded-full p-0.5"
                    style={{ background: 'var(--accent)' }}
                  >
                    <Check className="h-2.5 w-2.5 text-white" />
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Product names list */}
      <div className="space-y-1">
        {allProducts.map((p) => {
          const isSelected = selected.has(p.id);
          const isMain = p.id === mainProduct.id;
          return (
            <div key={p.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isSelected}
                disabled={isMain}
                onChange={() => toggleProduct(p.id)}
                className="h-3.5 w-3.5 rounded accent-orange-500"
              />
              <Link
                href={`/products/${p.slug}`}
                className="text-sm hover:underline"
                style={{
                  color: isSelected
                    ? 'var(--text-primary)'
                    : 'var(--text-muted)',
                }}
              >
                {p.name}
              </Link>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {formatPrice(
                  p.variants.find((v) => v.stock > 0)?.price ?? p.price,
                )}
              </span>
            </div>
          );
        })}
      </div>

      {/* Total + CTA */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 border-t pt-4"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Total for {selectedProducts.length} item
            {selectedProducts.length !== 1 ? 's' : ''}
          </p>
          <p className="text-xl font-bold" style={{ color: 'var(--accent)' }}>
            {formatPrice(totalPrice)}
          </p>
        </div>
        <button
          onClick={handleAddAll}
          disabled={selectedProducts.length === 0}
          className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: addedAll ? '#16a34a' : 'var(--accent)',
            color: '#fff',
          }}
        >
          {addedAll ? (
            <>
              <Check className="h-4 w-4" /> Added to Cart!
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" /> Add All to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}
