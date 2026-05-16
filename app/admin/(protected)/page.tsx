import { prisma } from '@/lib/prisma';

export const metadata = {
  title: 'Dashboard',
};

async function getStats() {
  const [totalOrders, totalProducts, totalRevenue, recentOrders] =
    await Promise.all([
      prisma.order.count(),
      prisma.product.count({ where: { published: true } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
        },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          customerEmail: true,
          total: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

  return {
    totalOrders,
    totalProducts,
    totalRevenue: totalRevenue._sum.total ?? 0,
    recentOrders,
  };
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

function formatDate(date: Date) {
  return new Date(date).toISOString().slice(0, 10); // "2025-08-21"
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
};

export default async function AdminDashboardPage() {
  const { totalOrders, totalProducts, totalRevenue, recentOrders } =
    await getStats();

  const stats = [
    { label: 'Total Revenue', value: formatPrice(totalRevenue) },
    { label: 'Total Orders', value: totalOrders.toString() },
    { label: 'Published Products', value: totalProducts.toString() },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ label, value }) => (
          <div
            key={label}
            className="rounded-lg border border-gray-200 bg-white p-6"
          >
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-base font-medium text-gray-900">Recent Orders</h2>
        </div>

        {recentOrders.length === 0 ? (
          <p className="px-6 py-8 text-sm text-gray-500">No orders yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                <th className="px-6 py-3 font-medium">Order ID</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Total</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.map((order: any) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-mono text-xs text-gray-500">
                    {order.id.slice(0, 8)}…
                  </td>
                  <td className="px-6 py-3 text-gray-700">
                    {order.customerEmail}
                  </td>
                  <td className="px-6 py-3 text-gray-700">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        STATUS_STYLES[order.status] ??
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-500">
                    {formatDate(order.createdAt)}
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
