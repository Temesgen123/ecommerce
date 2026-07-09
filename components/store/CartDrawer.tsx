'use client';

import { useCartStore } from '@/lib/cart-store';
import { X, ShoppingBag, Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    totalPrice,
    totalItems,
  } = useCartStore();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col shadow-2xl"
        style={{ background: 'var(--bg-surface)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-2">
            <ShoppingBag
              className="h-5 w-5"
              style={{ color: 'var(--text-primary)' }}
            />
            <h2
              className="text-base font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              Cart
            </h2>
            {totalItems() > 0 && (
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold"
                style={{ background: 'var(--navy-900)', color: '#fff' }}
              >
                {totalItems()}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="rounded-lg p-1.5 transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingBag
                className="h-16 w-16 opacity-20"
                style={{ color: 'var(--text-muted)' }}
              />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Your cart is empty.
              </p>
              <button
                onClick={closeCart}
                className="text-sm font-semibold underline underline-offset-2"
                style={{ color: 'var(--navy-700)' }}
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                // Key on variantId so two variants of the same product
                // render as distinct list items (e.g. Red/M and Blue/L)
                <li
                  key={item.variantId}
                  className="flex gap-4"
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    paddingBottom: '1rem',
                  }}
                >
                  {/* Thumbnail */}
                  <div
                    className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg"
                    style={{ background: 'var(--bg-elevated)' }}
                  >
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ShoppingBag
                          className="h-6 w-6 opacity-30"
                          style={{ color: 'var(--text-muted)' }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col gap-1 min-w-0">
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={closeCart}
                      className="text-sm font-semibold leading-snug truncate hover:underline"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {item.name}
                    </Link>

                    {/* Variant label — e.g. "Blue / Large" */}
                    {item.variantLabel && (
                      <p
                        className="text-xs"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {item.variantLabel}
                      </p>
                    )}

                    <p
                      className="text-sm font-semibold"
                      style={{ color: 'var(--navy-700)' }}
                    >
                      {formatPrice(item.price)}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() =>
                          updateQuantity(item.variantId, item.quantity - 1)
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-lg border transition-colors"
                        style={{
                          borderColor: 'var(--border-base)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span
                        className="w-6 text-center text-sm font-semibold"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.variantId, item.quantity + 1)
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-lg border transition-colors"
                        style={{
                          borderColor: 'var(--border-base)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => removeItem(item.variantId)}
                        className="ml-auto rounded-lg p-1.5 transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
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
            className="px-5 py-4 space-y-3"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                Subtotal
              </span>
              <span
                className="text-base font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                {formatPrice(totalPrice())}
              </span>
            </div>
            <p
              className="text-xs text-center"
              style={{ color: 'var(--text-muted)' }}
            >
              Shipping and taxes calculated at checkout.
            </p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="btn-primary w-full py-3 text-sm font-bold disabled:opacity-60  block  rounded-xl text-center transition-opacity hover:opacity-90 "
              // style={{ background: 'var(--navy-900)', color: '#fff' }}
            >
              Checkout · {formatPrice(totalPrice())}
            </Link>
            <button
              onClick={closeCart}
              className="btn-primary w-full py-3 text-sm   disabled:opacity-60  block  rounded-xl text-center transition-opacity hover:opacity-90 opacity-50"
              style={{ color: 'var(--text-primary)' }}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
