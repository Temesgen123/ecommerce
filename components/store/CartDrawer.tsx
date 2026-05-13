'use client';

import Link from 'next/link';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { useRouter } from 'next/navigation';

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice } =
    useCartStore();
  const router = useRouter();

  function handleCheckout() {
    closeCart();
    router.push('/checkout');
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={closeCart} />
      )}

      <div
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <h2
            className="text-base font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            Cart{' '}
            {items.length > 0 && (
              <span
                className="text-sm font-normal"
                style={{ color: 'var(--text-muted)' }}
              >
                ({items.length})
              </span>
            )}
          </h2>
          <button
            onClick={closeCart}
            className="rounded-lg p-1.5 transition-colors hover:bg-gray-100"
            style={{ color: 'var(--text-muted)' }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center gap-3 py-20"
              style={{ color: 'var(--text-muted)' }}
            >
              <ShoppingBag className="h-12 w-12 opacity-30" />
              <p className="text-sm">Your cart is empty.</p>
              <button
                onClick={closeCart}
                className="text-sm font-semibold underline underline-offset-2"
                style={{ color: 'var(--navy-900)' }}
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <ul
              className="divide-y"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              {items.map((item) => (
                <li key={item.id} className="flex gap-4 py-4">
                  <div
                    className="h-18 w-16 flex-shrink-0 rounded-lg overflow-hidden"
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
                        <ShoppingBag className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={closeCart}
                        className="text-sm font-medium leading-snug hover:underline"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="transition-colors flex-shrink-0 hover:text-red-500"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: 'var(--accent)' }}
                    >
                      {formatPrice(item.price)}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="rounded border p-0.5 transition-colors hover:bg-gray-100"
                        style={{
                          borderColor: 'var(--border-base)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span
                        className="w-6 text-center text-sm font-medium tabular-nums"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="rounded border p-0.5 transition-colors hover:bg-gray-100"
                        style={{
                          borderColor: 'var(--border-base)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div
            className="px-5 py-5 space-y-4"
            style={{
              borderTop: '1px solid var(--border-subtle)',
              background: 'var(--bg-base)',
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                Subtotal
              </span>
              <span
                className="text-lg font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                {formatPrice(totalPrice())}
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Shipping and taxes calculated at checkout.
            </p>
            <button
              onClick={handleCheckout}
              className="btn-primary w-full py-3 text-sm"
            >
              Checkout →
            </button>
          </div>
        )}
      </div>
    </>
  );
}
