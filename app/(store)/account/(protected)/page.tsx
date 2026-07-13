import { getCustomer } from '@/lib/customer-auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ShoppingBag, MapPin, Star, Coins } from 'lucide-react';
import ProfileForm from '@/components/store/ProfileForm';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'My Account' };
function fmt(c: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(c / 100);
}
const S: Record<string, { bg: string; color: string }> = {
  PAID: { bg: '#DBEAFE', color: '#1D4ED8' },
  DELIVERED: { bg: '#DCFCE7', color: '#15803D' },
  SHIPPED: { bg: '#E0E7FF', color: '#4338CA' },
  PENDING: { bg: '#FEF9C3', color: '#854D0E' },
  CANCELLED: { bg: '#FEE2E2', color: '#DC2626' },
  PROCESSING: { bg: '#EDE9FE', color: '#6D28D9' },
  REFUNDED: { bg: '#F1F5F9', color: '#475569' },
};
export default async function AccountPage() {
  const customer = await getCustomer();
  if (!customer) return null;
  const [orders, addressCount, reviewCount, loyaltyAccount] = await Promise.all(
    [
      prisma.order.findMany({
        where: { customerEmail: customer.email },
        orderBy: { createdAt: 'desc' },
        take: 3,
      }),
      prisma.customerAddress.count({ where: { customerId: customer.id } }),
      prisma.productReview.count({ where: { authorEmail: customer.email } }),
      prisma.loyaltyAccount.findUnique({ where: { customerId: customer.id } }),
    ],
  );

  const loyaltyPoints = loyaltyAccount?.points ?? 0;
  return (
    <div className="space-y-6">
      <h1
        className="text-2xl font-bold"
        style={{ color: 'var(--text-primary)' }}
      >
        Welcome back, {customer.name?.split(' ')[0] ?? 'there'}!
      </h1>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            icon: <ShoppingBag className="h-5 w-5" />,
            label: 'Orders',
            value: orders.length,
            href: '/account/orders',
          },
          {
            icon: <MapPin className="h-5 w-5" />,
            label: 'Addresses',
            value: addressCount,
            href: '/account/addresses',
          },
          {
            icon: <Star className="h-5 w-5" />,
            label: 'Reviews',
            value: reviewCount,
            href: '/account/orders',
          },
          {
            icon: <Coins className="h-5 w-5" />,
            label: 'Loyalty Points',
            value: loyaltyPoints.toLocaleString(),
            href: '/account/loyalty',
          },
        ].map(({ icon, label, value, href }) => (
          <Link
            key={label}
            href={href}
            className="rounded-xl border p-4 text-center transition-all hover:shadow-md"
            style={{
              background: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <div
              className="flex justify-center mb-2"
              style={{ color: 'var(--navy-600)' }}
            >
              {icon}
            </div>
            <p
              className="text-2xl font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              {value}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {label}
            </p>
          </Link>
        ))}
      </div>
      <div
        className="rounded-xl border overflow-hidden"
        style={{
          background: 'var(--bg-surface)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <h2
            className="text-sm font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            Recent Orders
          </h2>
          <Link
            href="/account/orders"
            className="text-xs font-semibold"
            style={{ color: 'var(--navy-700)' }}
          >
            View all →
          </Link>
        </div>
        {orders.length === 0 ? (
          <p
            className="px-5 py-8 text-sm text-center"
            style={{ color: 'var(--text-muted)' }}
          >
            No orders yet.{' '}
            <Link
              href="/products"
              className="underline"
              style={{ color: 'var(--navy-700)' }}
            >
              Start shopping
            </Link>
          </p>
        ) : (
          <div
            className="divide-y"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            {orders.map((o) => {
              const s = S[o.status] ?? S.PENDING;
              return (
                <div
                  key={o.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div>
                    <p
                      className="text-sm font-semibold font-mono"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      #{o.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {o.createdAt.toISOString().slice(0, 10)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-sm font-bold"
                      style={{ color: 'var(--accent)' }}
                    >
                      {fmt(o.total)}
                    </p>
                    <span
                      className="text-xs rounded-full px-2 py-0.5"
                      style={{ background: s.bg, color: s.color }}
                    >
                      {o.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <ProfileForm customer={customer} />
    </div>
  );
}
