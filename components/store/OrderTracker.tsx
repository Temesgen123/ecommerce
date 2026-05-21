'use client';

import { useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { lookupOrder, type TrackedOrder } from '@/app/actions/track-order';
import { Search, Package, Loader2 } from 'lucide-react';

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

function formatDateTime(date: Date) {
  return new Date(date).toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
}

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: string; color: string; bg: string }
> = {
  PENDING: { label: 'Pending', icon: '🕐', color: '#854D0E', bg: '#FEF9C3' },
  PAID: { label: 'Paid', icon: '💳', color: '#1D4ED8', bg: '#DBEAFE' },
  PROCESSING: {
    label: 'Processing',
    icon: '📦',
    color: '#6D28D9',
    bg: '#EDE9FE',
  },
  SHIPPED: { label: 'Shipped', icon: '🚚', color: '#4338CA', bg: '#E0E7FF' },
  DELIVERED: {
    label: 'Delivered',
    icon: '✅',
    color: '#15803D',
    bg: '#DCFCE7',
  },
  CANCELLED: {
    label: 'Cancelled',
    icon: '❌',
    color: '#DC2626',
    bg: '#FEE2E2',
  },
  REFUNDED: { label: 'Refunded', icon: '↩️', color: '#475569', bg: '#F1F5F9' },
};

const FLOW = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

export default function OrderTracker() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('ref') ?? '');
  const [email, setEmail] = useState(searchParams.get('email') ?? '');
  const [error, setError] = useState('');
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setOrder(null);
    startTransition(async () => {
      const result = await lookupOrder(orderId, email);
      if (result.error) {
        setError(result.error);
      } else {
        setOrder(result.order);
      }
    });
  }

  const statusCfg = order
    ? (STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING)
    : null;
  const isNormalFlow =
    order && !['CANCELLED', 'REFUNDED'].includes(order.status);

  return (
    <div className="space-y-6">
      {/* Lookup form */}
      <div
        className="rounded-2xl border p-6"
        style={{
          background: 'var(--bg-surface)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: 'var(--text-secondary)' }}
              >
                Order Reference
              </label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                placeholder="e.g. CMPAVT1B"
                className="input-theme w-full px-3 py-2.5 text-sm font-mono uppercase"
                required
              />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Found in your order confirmation email
              </p>
            </div>
            <div className="space-y-1.5">
              <label
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: 'var(--text-secondary)' }}
              >
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="input-theme w-full px-3 py-2.5 text-sm"
                required
              />
            </div>
          </div>

          {error && (
            <div
              className="rounded-lg px-4 py-3 text-sm font-medium"
              style={{
                background: 'var(--error-bg)',
                color: 'var(--error-text)',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="btn-navy w-full rounded-lg py-2.5 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Looking up…
              </>
            ) : (
              <>
                <Search className="h-4 w-4" /> Track Order
              </>
            )}
          </button>
        </form>
      </div>

      {/* Order result */}
      {order && statusCfg && (
        <div className="space-y-5">
          {/* Status hero */}
          <div
            className="rounded-2xl p-6 text-center"
            style={{
              background: statusCfg.bg,
              border: `1px solid ${statusCfg.color}30`,
            }}
          >
            <p className="text-4xl mb-2">{statusCfg.icon}</p>
            <h2
              className="text-xl font-bold"
              style={{ color: statusCfg.color }}
            >
              {statusCfg.label}
            </h2>
            <p
              className="text-sm mt-1"
              style={{ color: statusCfg.color, opacity: 0.8 }}
            >
              Order #{order.id.slice(0, 8).toUpperCase()}
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: statusCfg.color, opacity: 0.6 }}
            >
              Placed {formatDateTime(order.createdAt)}
            </p>
          </div>

          {/* Progress bar */}
          {isNormalFlow && (
            <div
              className="rounded-2xl border p-5"
              style={{
                background: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-wide mb-4"
                style={{ color: 'var(--text-muted)' }}
              >
                Order Progress
              </p>
              <div className="flex items-center overflow-x-auto pb-1">
                {FLOW.map((s, i) => {
                  const cfg = STATUS_CONFIG[s];
                  const done = order.statusHistory.some((h) => h.status === s);
                  const active = order.status === s;
                  return (
                    <div key={s} className="flex items-center flex-shrink-0">
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-full text-lg border-2 transition-all"
                          style={{
                            background: done ? cfg.bg : 'var(--bg-elevated)',
                            borderColor: done
                              ? cfg.color
                              : 'var(--border-base)',
                            boxShadow: active ? `0 0 0 3px ${cfg.bg}` : 'none',
                          }}
                        >
                          {cfg.icon}
                        </div>
                        <span
                          className="text-xs font-medium whitespace-nowrap"
                          style={{
                            color: done ? cfg.color : 'var(--text-muted)',
                          }}
                        >
                          {cfg.label}
                        </span>
                      </div>
                      {i < FLOW.length - 1 && (
                        <div
                          className="h-0.5 w-8 mx-1 flex-shrink-0"
                          style={{
                            background: order.statusHistory.some(
                              (h) => h.status === FLOW[i + 1],
                            )
                              ? 'var(--navy-500)'
                              : 'var(--border-base)',
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Status history */}
          {order.statusHistory.length > 0 && (
            <div
              className="rounded-2xl border p-5"
              style={{
                background: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-wide mb-4"
                style={{ color: 'var(--text-muted)' }}
              >
                Status Updates
              </p>
              <div className="space-y-2">
                {[...order.statusHistory].reverse().map((entry) => {
                  const cfg =
                    STATUS_CONFIG[entry.status] ?? STATUS_CONFIG.PENDING;
                  return (
                    <div
                      key={entry.id}
                      className="flex items-start gap-3 rounded-lg p-3"
                      style={{
                        background: cfg.bg,
                        border: `1px solid ${cfg.color}30`,
                      }}
                    >
                      <span className="text-lg flex-shrink-0">{cfg.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className="text-sm font-semibold"
                            style={{ color: cfg.color }}
                          >
                            {cfg.label}
                          </span>
                          <span
                            className="text-xs flex-shrink-0"
                            style={{ color: cfg.color, opacity: 0.7 }}
                          >
                            {formatDateTime(entry.createdAt)}
                          </span>
                        </div>
                        {entry.note && (
                          <p
                            className="text-xs mt-0.5"
                            style={{ color: cfg.color, opacity: 0.8 }}
                          >
                            {entry.note}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Items */}
          <div
            className="rounded-2xl border overflow-hidden"
            style={{
              background: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <div
              className="px-5 py-4"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}
            >
              <p
                className="text-sm font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                Items Ordered
              </p>
            </div>
            <table className="w-full text-sm">
              <tbody
                className="divide-y"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-3">
                      <p
                        className="font-medium"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {item.productName}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {formatPrice(item.unitPrice)} × {item.quantity}
                      </p>
                    </td>
                    <td
                      className="px-5 py-3 text-right font-semibold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {formatPrice(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div
              className="px-5 py-4 space-y-1.5 text-sm"
              style={{ borderTop: '1px solid var(--border-subtle)' }}
            >
              <div
                className="flex justify-between"
                style={{ color: 'var(--text-secondary)' }}
              >
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.shippingCost > 0 && (
                <div
                  className="flex justify-between"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <span>Shipping</span>
                  <span>{formatPrice(order.shippingCost)}</span>
                </div>
              )}
              {order.tax > 0 && (
                <div
                  className="flex justify-between"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <span>Tax</span>
                  <span>{formatPrice(order.tax)}</span>
                </div>
              )}
              <div
                className="flex justify-between font-bold pt-1"
                style={{
                  color: 'var(--text-primary)',
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <span>Total</span>
                <span style={{ color: 'var(--accent)' }}>
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping address */}
          {order.shippingAddress && (
            <div
              className="rounded-2xl border p-5"
              style={{
                background: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-wide mb-3"
                style={{ color: 'var(--text-muted)' }}
              >
                Shipping Address
              </p>
              <address
                className="not-italic text-sm space-y-0.5"
                style={{ color: 'var(--text-secondary)' }}
              >
                {order.shippingAddress.line1 && (
                  <p>{order.shippingAddress.line1}</p>
                )}
                {order.shippingAddress.line2 && (
                  <p>{order.shippingAddress.line2}</p>
                )}
                {(order.shippingAddress.city ||
                  order.shippingAddress.state) && (
                  <p>
                    {[
                      order.shippingAddress.city,
                      order.shippingAddress.state,
                      order.shippingAddress.postal_code,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                )}
                {order.shippingAddress.country && (
                  <p>{order.shippingAddress.country}</p>
                )}
              </address>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
