'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/lib/cart-store';

// Clears the Zustand cart after a successful Stripe payment.
// Must be a client component since useCartStore is client-only.
export default function ClearCartOnSuccess() {
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return null;
}
