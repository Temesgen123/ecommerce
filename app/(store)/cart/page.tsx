'use client';

import { useCartStore } from '@/lib/cart-store';
import {
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } =
    useCartStore();

  const subtotal = totalPrice();
  const count = totalItems();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4 text-center">
        <ShoppingBag
          className="h-20 w-20 opacity-20"
          style={{ color: 'var(--text-muted)' }}
        />
        <div>
          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            Your cart is empty
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Looks like you haven&apos;t added anything yet.
          </p>
        </div>
        <Link
          href="/products"
          className="btn-primary px-8 py-3 rounded-xl text-sm font-bold"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div
      className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      style={{ overflowX: 'hidden' }}
    >
      {/* Page header */}
      <div className="mb-6">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm mb-3 transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Continue shopping
        </Link>
        <h1
          className="text-xl sm:text-2xl font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          Shopping cart{' '}
          <span
            className="text-base font-normal"
            style={{ color: 'var(--text-muted)' }}
          >
            ({count} {count === 1 ? 'item' : 'items'})
          </span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
        {/* ── Cart items ── */}
        <div
          className="rounded-2xl overflow-hidden w-full min-w-0"
          style={{ border: '1px solid var(--border-subtle)' }}
        >
          {/* Column headings — desktop only */}
          <div
            className="hidden sm:grid grid-cols-[1fr_auto_auto] gap-4 px-6 py-3 text-xs font-semibold uppercase tracking-wide"
            style={{
              color: 'var(--text-muted)',
              borderBottom: '1px solid var(--border-subtle)',
              background: 'var(--bg-elevated)',
            }}
          >
            <span>Product</span>
            <span className="w-28 text-center">Quantity</span>
            <span className="w-24 text-right">Total</span>
          </div>

          <ul>
            {items.map((item, idx) => (
              <li
                key={item.variantId}
                className="grid grid-cols-[auto_1fr] sm:grid-cols-[auto_1fr_auto_auto] gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 items-start sm:items-center"
                style={{
                  borderBottom:
                    idx < items.length - 1
                      ? '1px solid var(--border-subtle)'
                      : 'none',
                  background: 'var(--bg-surface)',
                }}
              >
                {/* Thumbnail */}
                <div
                  className="relative h-18 w-18 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-xl mt-1 sm:mt-0"
                  style={{
                    background: 'var(--bg-elevated)',
                    width: '72px',
                    height: '72px',
                  }}
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

                {/* Name + variant + price */}
                <div className="flex flex-col gap-0.5 min-w-0 overflow-hidden">
                  <Link
                    href={`/products/${item.slug}`}
                    className="text-sm font-semibold leading-snug hover:underline"
                    style={{
                      color: 'var(--text-primary)',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.name}
                  </Link>
                  {item.variantLabel && (
                    <p
                      className="text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {item.variantLabel}
                    </p>
                  )}
                  <p
                    className="text-sm font-semibold mt-1"
                    style={{ color: 'var(--navy-700)' }}
                  >
                    {formatPrice(item.price)}
                  </p>

                  {/* Qty + remove + line total — mobile only */}
                  <div className="flex items-center gap-2 mt-2 sm:hidden">
                    <QuantityControl
                      quantity={item.quantity}
                      onDecrement={() =>
                        updateQuantity(item.variantId, item.quantity - 1)
                      }
                      onIncrement={() =>
                        updateQuantity(item.variantId, item.quantity + 1)
                      }
                    />
                    <span
                      className="text-sm font-bold ml-2"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {formatPrice(item.price * item.quantity)}
                    </span>
                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="ml-auto p-1.5 rounded-lg transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Qty controls — desktop */}
                <div className="hidden sm:flex items-center gap-2 w-28 justify-center">
                  <QuantityControl
                    quantity={item.quantity}
                    onDecrement={() =>
                      updateQuantity(item.variantId, item.quantity - 1)
                    }
                    onIncrement={() =>
                      updateQuantity(item.variantId, item.quantity + 1)
                    }
                  />
                </div>

                {/* Line total + remove — desktop */}
                <div className="hidden sm:flex flex-col items-end gap-2 w-24">
                  <span
                    className="text-sm font-bold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {formatPrice(item.price * item.quantity)}
                  </span>
                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Order summary ── */}
        <div
          className="rounded-2xl p-5 sm:p-6 space-y-4 lg:sticky lg:top-24"
          style={{
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface)',
          }}
        >
          <h2
            className="text-base font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            Order summary
          </h2>

          <div className="space-y-2.5">
            <SummaryRow
              label={`Subtotal (${count} ${count === 1 ? 'item' : 'items'})`}
              value={formatPrice(subtotal)}
            />
            <SummaryRow label="Shipping" value="At checkout" muted />
            <SummaryRow label="Tax" value="At checkout" muted />
          </div>

          <div
            className="pt-4"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-base font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                Total
              </span>
              <span
                className="text-lg font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                {formatPrice(subtotal)}
              </span>
            </div>
            <p
              className="text-xs mt-1 leading-relaxed"
              style={{ color: 'var(--text-muted)' }}
            >
              Promo codes &amp; gift cards applied at checkout.
            </p>
          </div>

          <Link
            href="/checkout"
            className="btn-primary w-full py-3.5 rounded-xl text-sm font-bold block text-center transition-opacity hover:opacity-90"
          >
            Checkout · {formatPrice(subtotal)}
          </Link>

          <div
            className="flex items-center justify-center gap-1.5 text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure checkout
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────

function QuantityControl({
  quantity,
  onDecrement,
  onIncrement,
}: {
  quantity: number;
  onDecrement: () => void;
  onIncrement: () => void;
}) {
  return (
    <div
      className="flex items-center rounded-lg overflow-hidden"
      style={{ border: '1px solid var(--border-base)' }}
    >
      <button
        onClick={onDecrement}
        className="flex h-8 w-8 items-center justify-center transition-colors"
        style={{
          color: 'var(--text-secondary)',
          background: 'var(--bg-elevated)',
        }}
      >
        <Minus className="h-3 w-3" />
      </button>
      <span
        className="w-8 text-center text-sm font-semibold"
        style={{
          color: 'var(--text-primary)',
          borderLeft: '1px solid var(--border-base)',
          borderRight: '1px solid var(--border-base)',
          background: 'var(--bg-surface)',
          lineHeight: '2rem',
        }}
      >
        {quantity}
      </span>
      <button
        onClick={onIncrement}
        className="flex h-8 w-8 items-center justify-center transition-colors"
        style={{
          color: 'var(--text-secondary)',
          background: 'var(--bg-elevated)',
        }}
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-2 text-sm">
      <span className="shrink-0" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </span>
      <span
        className="text-right"
        style={{ color: muted ? 'var(--text-muted)' : 'var(--text-primary)' }}
      >
        {value}
      </span>
    </div>
  );
}
