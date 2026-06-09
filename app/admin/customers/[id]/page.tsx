import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Calendar,
} from 'lucide-react';

export const metadata: Metadata = { title: 'Customer Detail' };

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#FCD34D',
  PAID: '#60A5FA',
  PROCESSING: '#A78BFA',
  SHIPPED: '#818CF8',
  DELIVERED: '#34D399',
  CANCELLED: '#F87171',
  REFUNDED: '#94A3B8',
};

const STATUS_BG: Record<string, string> = {
  PENDING: '#FEF9C3',
  PAID: '#DBEAFE',
  PROCESSING: '#EDE9FE',
  SHIPPED: '#E0E7FF',
  DELIVERED: '#D1FAE5',
  CANCELLED: '#FEE2E2',
  REFUNDED: '#F1F5F9',
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: Props) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      addresses: true,
      sessions: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!customer) notFound();

  // Get orders by email
  const orders = await prisma.order.findMany({
    where: { customerEmail: customer.email },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { items: true } } },
  });

  const totalSpent = orders
    .filter((o) =>
      ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(o.status),
    )
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/customers"
          className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {customer.name ?? 'Unnamed Customer'}
          </h1>
          <p className="text-sm text-gray-500">{customer.email}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: orders.length.toString() },
          { label: 'Total Spent', value: formatPrice(totalSpent) },
          { label: 'Addresses', value: customer.addresses.length.toString() },
          { label: 'Member Since', value: formatDate(customer.createdAt) },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl border bg-white p-4"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-lg font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer info */}
        <div
          className="rounded-xl border bg-white p-5 space-y-4 lg:col-span-1"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <h2 className="text-sm font-semibold text-gray-900">Customer Info</h2>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900">
                  {customer.email}
                </p>
              </div>
            </div>

            {customer.phone && (
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-900">
                    {customer.phone}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Registered</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(customer.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Addresses */}
          {customer.addresses.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Addresses
              </p>
              <div className="space-y-2">
                {customer.addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="rounded-lg p-3 text-xs"
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span className="font-semibold text-gray-700">
                        {addr.name}
                      </span>
                      {addr.isDefault && (
                        <span className="ml-auto rounded-full px-1.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-600">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500">
                      {addr.line1}
                      {addr.line2 && `, ${addr.line2}`}
                    </p>
                    <p className="text-gray-500">
                      {addr.city}, {addr.state} {addr.postalCode}
                    </p>
                    <p className="text-gray-500">{addr.country}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Orders list */}
        <div
          className="rounded-xl border bg-white overflow-hidden lg:col-span-2"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: '1px solid var(--border-subtle)' }}
          >
            <h2 className="text-sm font-semibold text-gray-900">
              Order History
            </h2>
            <span className="text-xs text-gray-500">
              {orders.length} order{orders.length !== 1 ? 's' : ''}
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <ShoppingBag className="h-8 w-8 text-gray-200" />
              <p className="text-sm text-gray-400">No orders yet</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="text-left text-xs font-semibold uppercase tracking-wide text-gray-400"
                  style={{ borderBottom: '1px solid var(--border-subtle)' }}
                >
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Items</th>
                  <th className="px-5 py-3 text-right">Total</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody
                className="divide-y"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                {orders.map((order: any) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-mono text-xs font-semibold hover:underline"
                        style={{ color: 'var(--navy-700)' }}
                      >
                        #{order.id.slice(0, 8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500">
                      {order._count.items} item
                      {order._count.items !== 1 ? 's' : ''}
                    </td>
                    <td
                      className="px-5 py-3 text-right text-xs font-semibold"
                      style={{ color: 'var(--accent)' }}
                    >
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={{
                          background: STATUS_BG[order.status] ?? '#F1F5F9',
                          color: STATUS_COLORS[order.status] ?? '#94A3B8',
                        }}
                      >
                        {order.status.charAt(0) +
                          order.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
