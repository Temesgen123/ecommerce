import { prisma } from '@/lib/prisma';

export async function getAnalyticsData() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    totalRevenue,
    totalOrders,
    totalProducts,
    totalCustomers,
    recentRevenue,
    recentOrders,
    ordersByStatus,
    revenueByDay,
    topProducts,
    ordersByCategory,
  ] = await Promise.all([
    // Total revenue (all time)
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } },
    }),

    // Total orders
    prisma.order.count(),

    // Total published products
    prisma.product.count({ where: { published: true } }),

    // Unique customers (by email)
    prisma.order.findMany({
      select: { customerEmail: true },
      distinct: ['customerEmail'],
    }),

    // Revenue last 7 days
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
        createdAt: { gte: sevenDaysAgo },
      },
    }),

    // Orders last 7 days
    prisma.order.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    }),

    // Orders by status
    prisma.order.groupBy({
      by: ['status'],
      _count: true,
    }),

    // Revenue per day (last 30 days)
    prisma.order.findMany({
      where: {
        status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { total: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),

    // Top 5 products by revenue
    prisma.orderItem.groupBy({
      by: ['productId', 'productName'],
      _sum: { total: true, quantity: true },
      orderBy: { _sum: { total: 'desc' } },
      take: 5,
    }),

    // Orders by category
    prisma.orderItem.findMany({
      include: {
        product: { include: { category: { select: { name: true } } } },
      },
    }),
  ]);

  // Process daily revenue into chart data
  const dailyMap: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dailyMap[d.toISOString().slice(0, 10)] = 0;
  }
  revenueByDay.forEach((order) => {
    const day = order.createdAt.toISOString().slice(0, 10);
    if (day in dailyMap) dailyMap[day] += order.total;
  });
  const dailyRevenue = Object.entries(dailyMap).map(([date, total]) => ({
    date,
    total,
    label: new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  // Process category revenue
  const categoryMap: Record<string, number> = {};
  ordersByCategory.forEach((item: any) => {
    const name = item.product?.category?.name ?? 'Uncategorised';
    categoryMap[name] = (categoryMap[name] ?? 0) + item.total;
  });
  const categoryRevenue = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, total]) => ({ name, total }));

  return {
    stats: {
      totalRevenue: totalRevenue._sum.total ?? 0,
      totalOrders,
      totalProducts,
      totalCustomers: totalCustomers.length,
      recentRevenue: recentRevenue._sum.total ?? 0,
      recentOrders,
    },
    ordersByStatus: ordersByStatus.map((o: any) => ({
      status: o.status,
      count: o._count,
    })),
    dailyRevenue,
    topProducts: topProducts.map((p: any) => ({
      productId: p.productId,
      productName: p.productName,
      revenue: p._sum.total ?? 0,
      quantity: p._sum.quantity ?? 0,
    })),
    categoryRevenue,
  };
}
