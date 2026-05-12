import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import OrderStatusBadge from '@/components/admin/OrderStatusBadge';
import OrderStatusUpdater from '@/components/admin/OrderStatusUpdater';
import { formatPrice, formatDateTime } from '@/lib/order-utils';

export const metadata = { title: 'Order Detail' };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: { product: { select: { slug: true, images: true } } },
      },
    },
  });

  if (!order) notFound();

  const address = order.shippingAddress as Record<string, string> | null;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/orders"
          className="text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-900">
            Order{' '}
            <span className="font-mono text-lg">
              #{order.id.slice(0, 8).toUpperCase()}
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Placed {formatDateTime(order.createdAt)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Status updater */}
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <p className="mb-3 text-sm font-medium text-gray-700">Update Status</p>
        <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
      </div>

      {/* Two-col layout */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Customer */}
        <div className="rounded-lg border border-gray-200 bg-white p-5 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
            Customer
          </p>
          {order.customerName && (
            <p className="text-sm font-medium text-gray-900">
              {order.customerName}
            </p>
          )}
          <p className="text-sm text-gray-600">{order.customerEmail}</p>
        </div>

        {/* Shipping address */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
            Shipping Address
          </p>
          {address ? (
            <address className="not-italic text-sm text-gray-600 space-y-0.5">
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
            <p className="text-sm text-gray-400">No address provided.</p>
          )}
        </div>
      </div>

      {/* Order items */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-4">
          <p className="text-sm font-medium text-gray-700">Items</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 font-medium text-right">Unit Price</th>
              <th className="px-5 py-3 font-medium text-right">Qty</th>
              <th className="px-5 py-3 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="px-5 py-3">
                  <p className="font-medium text-gray-900">
                    {item.productName}
                  </p>
                  <p className="text-xs text-gray-400 font-mono">
                    {item.productSlug}
                  </p>
                </td>
                <td className="px-5 py-3 text-right text-gray-600">
                  {formatPrice(item.unitPrice)}
                </td>
                <td className="px-5 py-3 text-right text-gray-600">
                  {item.quantity}
                </td>
                <td className="px-5 py-3 text-right font-medium text-gray-900">
                  {formatPrice(item.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="border-t border-gray-100 px-5 py-4 space-y-2">
          <Row label="Subtotal" value={formatPrice(order.subtotal)} />
          {order.shippingCost > 0 && (
            <Row label="Shipping" value={formatPrice(order.shippingCost)} />
          )}
          {order.tax > 0 && <Row label="Tax" value={formatPrice(order.tax)} />}
          <Row label="Total" value={formatPrice(order.total)} bold />
        </div>
      </div>

      {/* Stripe references */}
      {(order.stripeSessionId || order.stripePaymentIntent) && (
        <div className="rounded-lg border border-gray-200 bg-white p-5 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
            Stripe References
          </p>
          {order.stripeSessionId && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-32 flex-shrink-0">
                Session ID
              </span>
              <span className="font-mono text-xs text-gray-700 truncate">
                {order.stripeSessionId}
              </span>
            </div>
          )}
          {order.stripePaymentIntent && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-32 flex-shrink-0">
                Payment Intent
              </span>
              <span className="font-mono text-xs text-gray-700 truncate">
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
      className={`flex justify-between text-sm ${bold ? 'font-semibold text-gray-900' : 'text-gray-600'}`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
