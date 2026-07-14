import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import OrderStatusBadge from '@/components/admin/OrderStatusBadge';
import OrderStatusUpdater from '@/components/admin/OrderStatusUpdater';
import ShippingAssignment from '@/components/admin/ShippingAssignment';
import { formatPrice, formatDateTime } from '@/lib/order-utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Order Detail' };

interface Props {
  params: Promise<{ id: string }>;
}

const STATUS_ICON: Record<string, string> = {
  PENDING: '🕐',
  PAID: '💳',
  PROCESSING: '📦',
  SHIPPED: '🚚',
  OUT_FOR_DELIVERY: '🚚',
  DELIVERED: '✅',
  CANCELLED: '❌',
  REFUNDED: '↩️',
};

const STATUS_COLOR: Record<
  string,
  { bg: string; border: string; text: string }
> = {
  PENDING: { bg: '#FEF9C3', border: '#FDE047', text: '#854D0E' },
  PAID: { bg: '#DBEAFE', border: '#93C5FD', text: '#1D4ED8' },
  PROCESSING: { bg: '#EDE9FE', border: '#C4B5FD', text: '#6D28D9' },
  SHIPPED: { bg: '#E0E7FF', border: '#A5B4FC', text: '#4338CA' },
  OUT_FOR_DELIVERY: { bg: '#f8d9ad', border: '#A5B4FC', text: '#4338CA' },
  DELIVERED: { bg: '#DCFCE7', border: '#86EFAC', text: '#15803D' },
  CANCELLED: { bg: '#FEE2E2', border: '#FCA5A5', text: '#DC2626' },
  REFUNDED: { bg: '#F1F5F9', border: '#CBD5E1', text: '#475569' },
};

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;

  const [order, drivers] = await Promise.all([
    prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: { select: { slug: true, images: true } } },
        },
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
      },
    }),
    prisma.user.findMany({
      where: { role: 'DRIVER' },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  if (!order) notFound();

  const address = order.shippingAddress as Record<string, string> | null;
  const allStatuses = [
    'PENDING',
    'PAID',
    'PROCESSING',
    'SHIPPED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
  ];

  return (
    <div className="mx-auto mt-12 w-full max-w-[75%] space-y-6">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/orders"
          className="text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1
            className="text-2xl font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            Order{' '}
            <span className="font-mono text-lg">
              #{order.id.slice(0, 8).toUpperCase()}
            </span>
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Placed {formatDateTime(order.createdAt)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Status Timeline */}
      <div
        className="rounded-xl border bg-white p-5"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <p
          className="text-sm font-semibold mb-5"
          style={{ color: 'var(--text-primary)' }}
        >
          Order Timeline
        </p>

        {/* Progress bar for normal flow */}
        {!['CANCELLED', 'REFUNDED'].includes(order.status) && (
          <div className="flex items-center mb-6 overflow-x-auto pb-2">
            {allStatuses.map((s, i) => {
              const historyEntry = order.statusHistory.find(
                (h) => h.status === s,
              );
              const isReached = order.statusHistory.some((h) => h.status === s);
              const isCurrent = order.status === s;
              const colors = STATUS_COLOR[s];

              return (
                <div key={s} className="flex items-center flex-shrink-0">
                  {/* Step */}
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-lg border-2 transition-all"
                      style={{
                        background: isReached
                          ? colors.bg
                          : 'var(--bg-elevated)',
                        borderColor: isReached
                          ? colors.border
                          : 'var(--border-base)',
                        boxShadow: isCurrent
                          ? `0 0 0 3px ${colors.border}`
                          : 'none',
                      }}
                    >
                      {STATUS_ICON[s]}
                    </div>
                    <span
                      className="text-xs font-medium text-center whitespace-nowrap"
                      style={{
                        color: isReached ? colors.text : 'var(--text-muted)',
                      }}
                    >
                      {s.charAt(0) + s.slice(1).toLowerCase()}
                    </span>
                    {historyEntry && (
                      <span
                        className="text-xs text-center"
                        style={{ color: 'var(--text-muted)', fontSize: '10px' }}
                      >
                        {formatDateTime(historyEntry.createdAt).split(' ')[0]}
                      </span>
                    )}
                  </div>

                  {/* Connector line */}
                  {i < allStatuses.length - 1 && (
                    <div
                      className="h-0.5 w-8 mx-1 flex-shrink-0 transition-all"
                      style={{
                        background: order.statusHistory.some(
                          (h) => h.status === allStatuses[i + 1],
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
        )}

        {/* History log */}
        <div className="space-y-3">
          <p
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: 'var(--text-muted)' }}
          >
            Status History
          </p>
          {order.statusHistory.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No history recorded yet.
            </p>
          ) : (
            <div className="space-y-2">
              {[...order.statusHistory].reverse().map((entry) => {
                const colors =
                  STATUS_COLOR[entry.status] ?? STATUS_COLOR.PENDING;
                return (
                  <div
                    key={entry.id}
                    className="flex items-start gap-3 rounded-lg p-3"
                    style={{
                      background: colors.bg,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <span className="text-lg flex-shrink-0">
                      {STATUS_ICON[entry.status]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="text-sm font-semibold"
                          style={{ color: colors.text }}
                        >
                          {entry.status.charAt(0) +
                            entry.status.slice(1).toLowerCase()}
                        </span>
                        <span
                          className="text-xs flex-shrink-0"
                          style={{ color: colors.text, opacity: 0.7 }}
                        >
                          {formatDateTime(entry.createdAt)}
                        </span>
                      </div>
                      {entry.note && (
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: colors.text, opacity: 0.8 }}
                        >
                          {entry.note}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Status updater */}
      <div
        className="rounded-xl border bg-white p-5"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <p
          className="mb-3 text-sm font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Update Status
        </p>
        <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
      </div>

      {/* Shipping & Delivery assignment */}
      <div
        className="rounded-xl border bg-white p-5"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <p
          className="mb-3 text-sm font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Shipping &amp; Delivery
        </p>
        <ShippingAssignment
          orderId={order.id}
          drivers={drivers}
          currentValues={{
            carrier: order.carrier ?? null,
            carrierCompanyName: order.carrierCompanyName ?? null,
            trackingNumber: order.trackingNumber ?? null,
            driverId: order.driverId ?? null,
          }}
        />
      </div>

      {/* Two-col layout */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Customer */}
        <div
          className="rounded-xl border bg-white p-5 space-y-1"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-wide mb-3"
            style={{ color: 'var(--text-muted)' }}
          >
            Customer
          </p>
          {order.customerName && (
            <p
              className="text-sm font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              {order.customerName}
            </p>
          )}
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {order.customerEmail}
          </p>
        </div>

        {/* Shipping */}
        <div
          className="rounded-xl border bg-white p-5"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-wide mb-3"
            style={{ color: 'var(--text-muted)' }}
          >
            Shipping Address
          </p>
          {address ? (
            <address
              className="not-italic text-sm space-y-0.5"
              style={{ color: 'var(--text-secondary)' }}
            >
              {address.line1 && <p>{address.line1}</p>}
              {address.line2 && <p>{address.line2}</p>}
              {(address.city || address.state || address.postal_code) && (
                <p>
                  {[address.city, address.state, address.postal_code]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              )}
              {address.country && <p>{address.country}</p>}
            </address>
          ) : (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No address provided.
            </p>
          )}
        </div>
      </div>

      {/* Order items */}
      <div
        className="rounded-xl border bg-white overflow-hidden"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div
          className="px-5 py-4"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <p
            className="text-sm font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            Items
          </p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr
              className="text-left text-xs"
              style={{
                borderBottom: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
              }}
            >
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 font-medium text-right">Unit Price</th>
              <th className="px-5 py-3 font-medium text-right">Qty</th>
              <th className="px-5 py-3 font-medium text-right">Total</th>
            </tr>
          </thead>
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
                  {(item as any).variantLabel && (
                    <p
                      className="text-xs mt-0.5 font-medium"
                      style={{ color: 'var(--navy-600)' }}
                    >
                      {(item as any).variantLabel}
                    </p>
                  )}
                  <p
                    className="text-xs font-mono mt-0.5"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {item.productSlug}
                  </p>
                </td>
                <td
                  className="px-5 py-3 text-right"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {formatPrice(item.unitPrice)}
                </td>
                <td
                  className="px-5 py-3 text-right"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {item.quantity}
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

        {/* Totals */}
        <div
          className="px-5 py-4 space-y-2"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          <Row label="Subtotal" value={formatPrice(order.subtotal)} />
          {order.shippingCost > 0 && (
            <Row label="Shipping" value={formatPrice(order.shippingCost)} />
          )}
          {order.tax > 0 && <Row label="Tax" value={formatPrice(order.tax)} />}
          <Row label="Total" value={formatPrice(order.total)} bold />
        </div>
      </div>

      {/* Stripe refs */}
      {(order.stripeSessionId || order.stripePaymentIntent) && (
        <div
          className="rounded-xl border bg-white p-5 space-y-2"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-wide mb-3"
            style={{ color: 'var(--text-muted)' }}
          >
            Stripe References
          </p>
          {order.stripeSessionId && (
            <div className="flex items-center gap-2">
              <span
                className="text-xs w-36 flex-shrink-0"
                style={{ color: 'var(--text-muted)' }}
              >
                Session ID
              </span>
              <span
                className="font-mono text-xs truncate"
                style={{ color: 'var(--text-secondary)' }}
              >
                {order.stripeSessionId}
              </span>
            </div>
          )}
          {order.stripePaymentIntent && (
            <div className="flex items-center gap-2">
              <span
                className="text-xs w-36 flex-shrink-0"
                style={{ color: 'var(--text-muted)' }}
              >
                Payment Intent
              </span>
              <span
                className="font-mono text-xs truncate"
                style={{ color: 'var(--text-secondary)' }}
              >
                {order.stripePaymentIntent}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div
      className={`flex justify-between text-sm ${bold ? 'font-bold' : ''}`}
      style={{ color: bold ? 'var(--text-primary)' : 'var(--text-secondary)' }}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
