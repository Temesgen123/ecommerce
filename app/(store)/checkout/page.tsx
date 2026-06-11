'use client';

import { useState, useTransition } from 'react';
import { useCartStore } from '@/lib/cart-store';
import { createCheckoutSession } from '@/app/actions/checkout';
import { Loader2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import GiftCardInput from '@/components/store/GiftyCardInput';

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const [isPending, startTransition] = useTransition();

  const [appliedGiftCard, setAppliedGiftCard] = useState<{
    code: string;
    discount: number;
  } | null>(null);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const giftCardDiscount = appliedGiftCard?.discount ?? 0;
  const total = Math.max(0, subtotal - giftCardDiscount);

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <ShoppingBag
          className="h-12 w-12 opacity-20"
          style={{ color: 'var(--text-muted)' }}
        />
        <p
          className="text-lg font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Your cart is empty.
        </p>
        <Link
          href="/products"
          className="btn-navy rounded-lg px-6 py-2.5 text-sm"
        >
          Shop Products
        </Link>
      </div>
    );
  }

  function handleCheckout() {
    startTransition(async () => {
      await createCheckoutSession(
        items,
        appliedGiftCard?.code ?? undefined,
        appliedGiftCard?.discount ?? undefined,
      );
    });
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
      {isPending ? (
        <div className="flex flex-col items-center justify-center gap-4 min-h-[40vh]">
          <Loader2
            className="h-10 w-10 animate-spin"
            style={{ color: 'var(--navy-700)' }}
          />
          <p
            className="text-base font-medium"
            style={{ color: 'var(--text-secondary)' }}
          >
            Redirecting to secure checkout…
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            Checkout
          </h1>

          {/* Order summary */}
          <div
            className="rounded-xl p-5 space-y-3"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <h2
              className="text-sm font-semibold mb-3"
              style={{ color: 'var(--text-primary)' }}
            >
              Order Summary
            </h2>

            {/* Items */}
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {item.name}{' '}
                    <span style={{ color: 'var(--text-muted)' }}>
                      × {item.quantity}
                    </span>
                  </span>
                  <span style={{ color: 'var(--text-primary)' }}>
                    ${((item.price * item.quantity) / 100).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div
              className="pt-2 mt-2"
              style={{ borderTop: '1px solid var(--border-subtle)' }}
            >
              {/* Subtotal */}
              <div className="flex justify-between text-sm mb-1">
                <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                <span style={{ color: 'var(--text-primary)' }}>
                  ${(subtotal / 100).toFixed(2)}
                </span>
              </div>

              {/* Gift card discount */}
              {giftCardDiscount > 0 && (
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ color: '#059669' }}>Gift Card</span>
                  <span style={{ color: '#059669' }}>
                    -${(giftCardDiscount / 100).toFixed(2)}
                  </span>
                </div>
              )}

              {/* Total */}
              <div
                className="flex justify-between font-bold text-base mt-2 pt-2"
                style={{ borderTop: '1px solid var(--border-subtle)' }}
              >
                <span style={{ color: 'var(--text-primary)' }}>Total</span>
                <span style={{ color: 'var(--accent)' }}>
                  ${(total / 100).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Gift card input */}
          <div
            className="rounded-xl p-5"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <h2
              className="text-sm font-semibold mb-3"
              style={{ color: 'var(--text-primary)' }}
            >
              Gift Card
            </h2>
            <GiftCardInput
              orderTotal={subtotal}
              onApply={(code, discount) =>
                setAppliedGiftCard({ code, discount })
              }
              onRemove={() => setAppliedGiftCard(null)}
              appliedCode={appliedGiftCard?.code}
              appliedDiscount={appliedGiftCard?.discount}
            />
          </div>

          {/* Checkout button */}
          <div className="space-y-3">
            <button
              onClick={handleCheckout}
              className="btn-primary w-full rounded-lg py-3.5 text-sm font-bold"
            >
              {total === 0
                ? 'Complete Order (Free)'
                : `Proceed to Payment → $${(total / 100).toFixed(2)}`}
            </button>
            <Link
              href="/cart"
              className="block text-center text-sm underline"
              style={{ color: 'var(--text-muted)' }}
            >
              ← Back to cart
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
