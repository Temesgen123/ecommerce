import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import OrderStatusBadge from '@/components/admin/OrderStatusBadge';
import {
  ORDER_STATUSES,
  STATUS_LABEL,
  formatPrice,
  formatDate,
  type OrderStatus,
} from '@/lib/order-utils';
import { ShoppingBag } from 'lucide-react';

export const metadata = { title: 'Orders' };

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const activeStatus = ORDER_STATUSES.includes(status as OrderStatus)
    ? (status as OrderStatus)
    : null;

  const orders = await prisma.order.findMany({
    where: activeStatus ? { status: activeStatus } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { items: true } },
    },
  });

  // Count per status for filter badges
  const counts = await prisma.order.groupBy({
    by: ['status'],
    _count: true,
  });
  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count]));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500">
          {orders.length} order{orders.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/orders"
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            !activeStatus
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
          <span
            className={`rounded-full px-1.5 py-0.5 text-xs ${!activeStatus ? 'bg-white/20 text-white' : 'bg-white text-gray-600'}`}
          >
            {counts.reduce((s, c) => s + c._count, 0)}
          </span>
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              activeStatus === s
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {STATUS_LABEL[s]}
            {countMap[s] ? (
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs ${activeStatus === s ? 'bg-white/20 text-white' : 'bg-white text-gray-600'}`}
              >
                {countMap[s]}
              </span>
            ) : null}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200 bg-white">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-400">
            <ShoppingBag className="h-10 w-10" />
            <p className="text-sm">
              {activeStatus
                ? `No ${STATUS_LABEL[activeStatus].toLowerCase()} orders.`
                : 'No orders yet.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                <th className="px-6 py-3 font-medium">Order</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Items</th>
                <th className="px-6 py-3 font-medium">Total</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-mono text-xs text-gray-500">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-6 py-3">
                    <div>
                      {order.customerName && (
                        <p className="font-medium text-gray-900">
                          {order.customerName}
                        </p>
                      )}
                      <p className="text-gray-500 text-xs">
                        {order.customerEmail}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-gray-500">
                    {order._count.items}
                  </td>
                  <td className="px-6 py-3 font-medium text-gray-900">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-6 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-3 text-gray-500 tabular-nums">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-xs font-medium text-gray-900 hover:underline"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
