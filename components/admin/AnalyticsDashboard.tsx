'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Package,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Receipt,
} from 'lucide-react';
import Link from 'next/link';

interface AnalyticsData {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
    recentRevenue: number;
    recentOrders: number;
    prevPeriodRevenue: number;
    prevPeriodOrders: number;
    revenueChange: number;
    ordersChange: number;
    avgOrderValue: number;
  };
  ordersByStatus: { status: string; count: number }[];
  dailyRevenue: {
    date: string;
    total: number;
    orders: number;
    label: string;
  }[];
  topProducts: {
    productId: string;
    productName: string;
    revenue: number;
    quantity: number;
  }[];
  categoryRevenue: { name: string; total: number }[];
  recentOrders: {
    id: string;
    customerName: string | null;
    customerEmail: string;
    total: number;
    status: string;
    createdAt: string;
    itemCount: number;
  }[];
  days: number;
}

function formatPrice(cents: number) {
  if (cents >= 10000000) return `$${(cents / 10000000).toFixed(1)}M`;
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
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

const CATEGORY_COLORS = [
  '#1E3A5F',
  '#3B74C0',
  '#F97316',
  '#34D399',
  '#A78BFA',
  '#F87171',
];

export default function AnalyticsDashboard({ data }: { data: AnalyticsData }) {
  const router = useRouter();
  const {
    stats,
    ordersByStatus,
    dailyRevenue,
    topProducts,
    categoryRevenue,
    recentOrders,
    days,
  } = data;

  return (
    <div className="space-y-8">
      {/* Header + date range */}
      <div className="flex items-center justify-between flex-wrap gap-4">
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

        {/* Date range selector */}
        <div
          className="flex rounded-lg overflow-hidden"
          style={{ border: '1px solid var(--border-subtle)' }}
        >
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => router.push(`/admin/analytics?days=${d}`)}
              className="px-4 py-2 text-sm font-medium transition-colors"
              style={{
                background: days === d ? 'var(--navy-900)' : '#fff',
                color: days === d ? '#fff' : 'var(--text-muted)',
                borderRight:
                  d !== 90 ? '1px solid var(--border-subtle)' : 'none',
              }}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Revenue"
          value={formatPriceFull(stats.totalRevenue)}
          sub={`${formatPrice(stats.recentRevenue)} last ${days}d`}
          change={stats.revenueChange}
          icon={<DollarSign className="h-5 w-5" />}
          accent="var(--accent)"
        />
        <StatCard
          label="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          sub={`${stats.recentOrders} last ${days}d`}
          change={stats.ordersChange}
          icon={<ShoppingBag className="h-5 w-5" />}
          accent="var(--navy-500)"
        />
        <StatCard
          label="Avg Order Value"
          value={formatPriceFull(stats.avgOrderValue)}
          sub="per paid order"
          icon={<Receipt className="h-5 w-5" />}
          accent="#34D399"
        />
        <StatCard
          label="Customers"
          value={stats.totalCustomers.toLocaleString()}
          sub="unique emails"
          icon={<Users className="h-5 w-5" />}
          accent="#A78BFA"
        />
      </div>

      {/* Revenue + Orders chart (combined) */}
      <div
        className="rounded-xl border bg-white p-6"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <div>
            <h2
              className="text-base font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              Revenue & Orders — Last {days} Days
            </h2>
            <p
              className="text-xs mt-0.5"
              style={{ color: 'var(--text-muted)' }}
            >
              Daily revenue and order volume
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: 'var(--accent)' }}
              />
              <span style={{ color: 'var(--text-muted)' }}>Revenue</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: 'var(--navy-500)' }}
              />
              <span style={{ color: 'var(--text-muted)' }}>Orders</span>
            </span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={260}>
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
              <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B74C0" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3B74C0" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border-subtle)"
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              tickFormatter={(v, i) => (i % Math.ceil(days / 7) === 0 ? v : '')}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="revenue"
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              tickFormatter={(v) => `$${(v / 100).toFixed(0)}`}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="orders"
              orientation="right"
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value: any, name: any) => [
                name === 'total' ? formatPriceFull(value) : value,
                name === 'total' ? 'Revenue' : 'Orders',
              ]}
              contentStyle={{
                background: '#fff',
                border: '1px solid var(--border-base)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Area
              yAxisId="revenue"
              type="monotone"
              dataKey="total"
              stroke="var(--accent)"
              strokeWidth={2}
              fill="url(#revenueGrad)"
            />
            <Area
              yAxisId="orders"
              type="monotone"
              dataKey="orders"
              stroke="#3B74C0"
              strokeWidth={2}
              fill="url(#ordersGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Period comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ComparisonCard
          label={`Revenue vs Previous ${days}d`}
          current={formatPriceFull(stats.recentRevenue)}
          previous={formatPriceFull(stats.prevPeriodRevenue)}
          change={stats.revenueChange}
        />
        <ComparisonCard
          label={`Orders vs Previous ${days}d`}
          current={stats.recentOrders.toString()}
          previous={stats.prevPeriodOrders.toString()}
          change={stats.ordersChange}
        />
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
            <>
              <ResponsiveContainer width="100%" height={200}>
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
                    {ordersByStatus.map((entry) => (
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
                </PieChart>
              </ResponsiveContainer>

              {/* Status legend with counts */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                {ordersByStatus.map((s) => (
                  <div key={s.status} className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                      style={{
                        background: STATUS_COLORS[s.status] ?? '#94A3B8',
                      }}
                    />
                    <span
                      className="text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {s.status.charAt(0) + s.status.slice(1).toLowerCase()}
                    </span>
                    <span
                      className="ml-auto text-xs font-semibold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {s.count}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Revenue by category */}
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
            <ResponsiveContainer width="100%" height={260}>
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

      {/* Recent orders */}
      <div
        className="rounded-xl border bg-white overflow-hidden"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <h2
            className="text-base font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            Recent Orders
          </h2>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold hover:underline"
            style={{ color: 'var(--navy-600)' }}
          >
            View all →
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p
            className="text-sm text-center py-12"
            style={{ color: 'var(--text-muted)' }}
          >
            No orders yet.
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
                <th className="px-6 py-3">Order</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3 text-right">Total</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody
              className="divide-y"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              {recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td
                    className="px-6 py-3 font-mono text-xs"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="hover:underline font-semibold"
                      style={{ color: 'var(--navy-700)' }}
                    >
                      #{order.id.slice(0, 8).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-6 py-3">
                    <p
                      className="font-medium text-xs"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {order.customerName ?? order.customerEmail}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {order.itemCount} item{order.itemCount !== 1 ? 's' : ''}
                    </p>
                  </td>
                  <td
                    className="px-6 py-3 text-right font-semibold text-xs"
                    style={{ color: 'var(--accent)' }}
                  >
                    {formatPriceFull(order.total)}
                  </td>
                  <td className="px-6 py-3">
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
                  <td
                    className="px-6 py-3 text-xs"
                    style={{ color: 'var(--text-muted)' }}
                  >
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

// Stat card with change indicator
function StatCard({
  label,
  value,
  sub,
  change,
  icon,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  change?: number;
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
      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {sub}
        </p>
        {change !== undefined && (
          <span
            className="inline-flex items-center gap-0.5 text-xs font-semibold rounded-full px-1.5 py-0.5"
            style={{
              background:
                change > 0 ? '#D1FAE5' : change < 0 ? '#FEE2E2' : '#F1F5F9',
              color:
                change > 0 ? '#059669' : change < 0 ? '#DC2626' : '#6B7280',
            }}
          >
            {change > 0 ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : change < 0 ? (
              <ArrowDownRight className="h-3 w-3" />
            ) : (
              <Minus className="h-3 w-3" />
            )}
            {Math.abs(change)}%
          </span>
        )}
      </div>
    </div>
  );
}

// Period comparison card
function ComparisonCard({
  label,
  current,
  previous,
  change,
}: {
  label: string;
  current: string;
  previous: string;
  change: number;
}) {
  const isUp = change > 0;
  const isFlat = change === 0;

  return (
    <div
      className="rounded-xl border bg-white p-5"
      style={{ borderColor: 'var(--border-subtle)' }}
    >
      <p
        className="text-xs font-semibold uppercase tracking-wide mb-3"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </p>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>
            Current
          </p>
          <p
            className="text-xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            {current}
          </p>
        </div>
        <div
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
          style={{
            background: isFlat ? '#F1F5F9' : isUp ? '#D1FAE5' : '#FEE2E2',
            color: isFlat ? '#6B7280' : isUp ? '#059669' : '#DC2626',
          }}
        >
          {isFlat ? (
            <Minus className="h-4 w-4" />
          ) : isUp ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          <span className="text-sm font-bold">{Math.abs(change)}%</span>
        </div>
        <div className="text-right">
          <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>
            Previous
          </p>
          <p
            className="text-xl font-bold"
            style={{ color: 'var(--text-muted)' }}
          >
            {previous}
          </p>
        </div>
      </div>
    </div>
  );
}
