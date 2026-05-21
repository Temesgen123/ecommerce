'use client';

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  ArrowUpRight,
  DollarSign,
} from 'lucide-react';

interface AnalyticsData {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
    recentRevenue: number;
    recentOrders: number;
  };
  ordersByStatus: { status: string; count: number }[];
  dailyRevenue: { date: string; total: number; label: string }[];
  topProducts: {
    productId: string;
    productName: string;
    revenue: number;
    quantity: number;
  }[];
  categoryRevenue: { name: string; total: number }[];
}

function formatPrice(cents: number) {
  if (cents >= 100000) return `$${(cents / 100000).toFixed(1)}k`;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

function formatPriceFull(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
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

const CATEGORY_COLORS = [
  '#1E3A5F',
  '#3B74C0',
  '#F97316',
  '#34D399',
  '#A78BFA',
  '#F87171',
];

export default function AnalyticsDashboard({ data }: { data: AnalyticsData }) {
  const { stats, ordersByStatus, dailyRevenue, topProducts, categoryRevenue } =
    data;

  const maxRevenue = Math.max(...dailyRevenue.map((d) => d.total), 1);

  // Show only every 5th label on x-axis to avoid crowding
  const xAxisTick = (value: string, index: number) =>
    index % 5 === 0 ? value : '';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Analytics
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Store performance overview
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Revenue"
          value={formatPriceFull(stats.totalRevenue)}
          sub={`${formatPriceFull(stats.recentRevenue)} last 7 days`}
          icon={<DollarSign className="h-5 w-5" />}
          accent="var(--accent)"
        />
        <StatCard
          label="Total Orders"
          value={stats.totalOrders.toString()}
          sub={`${stats.recentOrders} last 7 days`}
          icon={<ShoppingBag className="h-5 w-5" />}
          accent="var(--navy-500)"
        />
        <StatCard
          label="Products"
          value={stats.totalProducts.toString()}
          sub="published"
          icon={<Package className="h-5 w-5" />}
          accent="#34D399"
        />
        <StatCard
          label="Customers"
          value={stats.totalCustomers.toString()}
          sub="unique emails"
          icon={<Users className="h-5 w-5" />}
          accent="#A78BFA"
        />
      </div>

      {/* Revenue chart */}
      <div
        className="rounded-xl border bg-white p-6"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2
              className="text-base font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              Revenue — Last 30 Days
            </h2>
            <p
              className="text-xs mt-0.5"
              style={{ color: 'var(--text-muted)' }}
            >
              Daily revenue from paid orders
            </p>
          </div>
          <div
            className="flex items-center gap-1.5 text-sm font-semibold"
            style={{ color: 'var(--accent)' }}
          >
            <TrendingUp className="h-4 w-4" />
            {formatPriceFull(stats.totalRevenue)}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={240}>
          <AreaChart
            data={dailyRevenue}
            margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--accent)"
                  stopOpacity={0.15}
                />
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border-subtle)"
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              tickFormatter={(v, i) => (i % 5 === 0 ? v : '')}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              tickFormatter={(v) => `$${(v / 100).toFixed(0)}`}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value: any) => [formatPriceFull(value), 'Revenue']}
              labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
              contentStyle={{
                background: '#fff',
                border: '1px solid var(--border-base)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="var(--accent)"
              strokeWidth={2}
              fill="url(#revenueGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Orders by status + Category revenue */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Orders by status — pie */}
        <div
          className="rounded-xl border bg-white p-6"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <h2
            className="text-base font-semibold mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            Orders by Status
          </h2>
          {ordersByStatus.length === 0 ? (
            <p
              className="text-sm text-center py-12"
              style={{ color: 'var(--text-muted)' }}
            >
              No orders yet.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={ordersByStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                >
                  {ordersByStatus.map((entry, i) => (
                    <Cell
                      key={entry.status}
                      fill={STATUS_COLORS[entry.status] ?? '#94A3B8'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [value, name]}
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid var(--border-base)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  iconSize={10}
                  iconType="circle"
                  formatter={(value) => (
                    <span
                      style={{
                        fontSize: '11px',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {value.charAt(0) + value.slice(1).toLowerCase()}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Revenue by category — bar */}
        <div
          className="rounded-xl border bg-white p-6"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <h2
            className="text-base font-semibold mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            Revenue by Category
          </h2>
          {categoryRevenue.length === 0 ? (
            <p
              className="text-sm text-center py-12"
              style={{ color: 'var(--text-muted)' }}
            >
              No data yet.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={categoryRevenue}
                layout="vertical"
                margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border-subtle)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                  tickFormatter={(v) => `$${(v / 100).toFixed(0)}`}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={90}
                  tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value: any) => [
                    formatPriceFull(value),
                    'Revenue',
                  ]}
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid var(--border-base)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                  {categoryRevenue.map((_, i) => (
                    <Cell
                      key={i}
                      fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top products */}
      <div
        className="rounded-xl border bg-white overflow-hidden"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div
          className="px-6 py-4"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <h2
            className="text-base font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            Top Products by Revenue
          </h2>
        </div>
        {topProducts.length === 0 ? (
          <p
            className="text-sm text-center py-12"
            style={{ color: 'var(--text-muted)' }}
          >
            No sales yet.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr
                className="text-left text-xs font-semibold uppercase tracking-wide"
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)',
                }}
              >
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3 text-right">Units Sold</th>
                <th className="px-6 py-3 text-right">Revenue</th>
                <th className="px-6 py-3">Share</th>
              </tr>
            </thead>
            <tbody
              className="divide-y"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              {topProducts.map((product, i) => {
                const pct =
                  stats.totalRevenue > 0
                    ? Math.round((product.revenue / stats.totalRevenue) * 100)
                    : 0;
                return (
                  <tr
                    key={product.productId}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold flex-shrink-0"
                          style={{
                            background: 'var(--navy-50)',
                            color: 'var(--navy-900)',
                          }}
                        >
                          {i + 1}
                        </span>
                        <span
                          className="font-medium truncate max-w-xs"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {product.productName}
                        </span>
                      </div>
                    </td>
                    <td
                      className="px-6 py-3 text-right"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {product.quantity}
                    </td>
                    <td
                      className="px-6 py-3 text-right font-semibold"
                      style={{ color: 'var(--accent)' }}
                    >
                      {formatPriceFull(product.revenue)}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="flex-1 rounded-full overflow-hidden h-1.5"
                          style={{ background: 'var(--bg-elevated)' }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              background: 'var(--accent)',
                            }}
                          />
                        </div>
                        <span
                          className="text-xs w-8 text-right flex-shrink-0"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {pct}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div
      className="rounded-xl border bg-white p-5 space-y-3"
      style={{ borderColor: 'var(--border-subtle)' }}
    >
      <div className="flex items-center justify-between">
        <p
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: 'var(--text-muted)' }}
        >
          {label}
        </p>
        <div
          className="rounded-lg p-1.5"
          style={{ background: `${accent}18`, color: accent }}
        >
          {icon}
        </div>
      </div>
      <p
        className="text-2xl font-bold"
        style={{ color: 'var(--text-primary)' }}
      >
        {value}
      </p>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        {sub}
      </p>
    </div>
  );
}
