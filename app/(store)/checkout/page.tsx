'use client';

import { useTransition } from 'react';
import { useCartStore } from '@/lib/cart-store';
import { createCheckoutSession } from '@/app/actions/checkout';
import { Loader2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const [isPending, startTransition] = useTransition();

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
      await createCheckoutSession(items);
    });
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      {isPending ? (
        <>
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
        </>
      ) : (
        <>
          <p
            className="text-lg font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            Ready to checkout?
          </p>
          <button
            onClick={handleCheckout}
            className="btn-primary rounded-lg px-8 py-3 text-sm font-bold"
          >
            Proceed to Stripe Checkout →
          </button>
          <Link
            href="/cart"
            className="text-sm underline"
            style={{ color: 'var(--text-muted)' }}
          >
            ← Back to cart
          </Link>
        </>
      )}
    </div>
  );
}
