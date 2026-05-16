'use client';

import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { createCheckoutSession } from '@/app/actions/checkout';
import { useTransition, useState } from 'react';
import DiscountInput from '@/components/store/DiscountInput';

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

interface AppliedDiscount {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  savings: number;
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } =
    useCartStore();
  const [isPending, startTransition] = useTransition();
  const [appliedDiscount, setAppliedDiscount] =
    useState<AppliedDiscount | null>(null);

  const subtotal = totalPrice();
  const savings = appliedDiscount?.savings ?? 0;
  const total = Math.max(0, subtotal - savings);

  function handleCheckout() {
    startTransition(async () => {
      await createCheckoutSession(items, appliedDiscount?.code ?? null);
    });
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <ShoppingBag
          className="mx-auto h-16 w-16 mb-4 opacity-20"
          style={{ color: 'var(--text-muted)' }}
        />
        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          Your cart is empty
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
          Add some products to get started.
        </p>
        <Link
          href="/products"
          className="btn-navy rounded-lg px-6 py-3 text-sm font-semibold"
        >
          Shop Products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1
        className="text-2xl font-bold mb-8"
        style={{ color: 'var(--text-primary)' }}
      >
        Your Cart{' '}
        <span
          className="text-base font-normal"
          style={{ color: 'var(--text-muted)' }}
        >
          ({totalItems()} items)
        </span>
      </h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 rounded-xl p-4"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div
                className="h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden"
                style={{ background: 'var(--bg-elevated)' }}
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <ShoppingBag className="h-8 w-8 opacity-30" />
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-start justify-between">
                  <Link
                    href={`/products/${item.slug}`}
                    className="text-sm font-semibold hover:underline"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {item.name}
                  </Link>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="rounded p-1 transition-colors hover:bg-red-50"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.color =
                        'var(--error-text)')
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.color =
                        'var(--text-muted)')
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p
                  className="text-sm font-bold"
                  style={{ color: 'var(--accent)' }}
                >
                  {formatPrice(item.price)}
                </p>
                <div className="mt-auto flex items-center gap-3">
                  <div
                    className="flex items-center rounded-lg overflow-hidden"
                    style={{ border: '1px solid var(--border-base)' }}
                  >
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-3 py-1.5 text-sm transition-colors hover:bg-gray-100"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span
                      className="px-3 py-1.5 text-sm font-semibold tabular-nums"
                      style={{
                        color: 'var(--text-primary)',
                        borderLeft: '1px solid var(--border-subtle)',
                        borderRight: '1px solid var(--border-subtle)',
                      }}
                    >
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-1.5 text-sm transition-colors hover:bg-gray-100"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <span
                    className="text-sm"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    = {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div
            className="sticky top-24 rounded-xl p-6 space-y-4"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <h2
              className="text-base font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              Order Summary
            </h2>

            <div style={{ borderTop: '1px solid var(--border-subtle)' }} />

            {/* Discount code input */}
            <DiscountInput
              cartTotal={subtotal}
              appliedCode={appliedDiscount?.code ?? null}
              onApply={(discount) => setAppliedDiscount(discount)}
            />

            <div style={{ borderTop: '1px solid var(--border-subtle)' }} />

            {/* Totals */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>
                  Subtotal ({totalItems()} items)
                </span>
                <span style={{ color: 'var(--text-primary)' }}>
                  {formatPrice(subtotal)}
                </span>
              </div>

              {appliedDiscount && (
                <div
                  className="flex justify-between font-semibold"
                  style={{ color: 'var(--success-text)' }}
                >
                  <span>Discount ({appliedDiscount.code})</span>
                  <span>−{formatPrice(savings)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Shipping</span>
                <span style={{ color: 'var(--success-text)' }}>
                  Calculated at checkout
                </span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)' }} />

            <div className="flex justify-between font-bold">
              <span style={{ color: 'var(--text-primary)' }}>Total</span>
              <span className="text-lg" style={{ color: 'var(--accent)' }}>
                {formatPrice(total)}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isPending}
              className="btn-primary w-full py-3 text-sm font-bold disabled:opacity-60"
            >
              {isPending ? 'Redirecting…' : 'Proceed to Checkout →'}
            </button>

            <Link
              href="/products"
              className="block text-center text-xs font-medium hover:underline"
              style={{ color: 'var(--text-muted)' }}
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
