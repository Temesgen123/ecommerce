import { prisma } from '@/lib/prisma';

export async function getAnalyticsData(days: number = 30) {
  const now = new Date();

  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);

  const prevStartDate = new Date(now);
  prevStartDate.setDate(prevStartDate.getDate() - days * 2);

  const [
    totalRevenue,
    totalOrders,
    totalProducts,
    totalCustomers,
    recentRevenue,
    recentOrders,
    prevPeriodRevenue,
    prevPeriodOrders,
    ordersByStatus,
    revenueByDay,
    ordersByDay,
    topProducts,
    ordersByCategory,
    recentOrdersList,
    avgOrderValue,
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

    // Unique customers
    prisma.order.findMany({
      select: { customerEmail: true },
      distinct: ['customerEmail'],
    }),

    // Revenue current period
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
        createdAt: { gte: startDate },
      },
    }),

    // Orders current period
    prisma.order.count({
      where: { createdAt: { gte: startDate } },
    }),

    // Revenue previous period (for comparison)
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
        createdAt: { gte: prevStartDate, lt: startDate },
      },
    }),

    // Orders previous period
    prisma.order.count({
      where: { createdAt: { gte: prevStartDate, lt: startDate } },
    }),

    // Orders by status
    prisma.order.groupBy({
      by: ['status'],
      _count: true,
    }),

    // Revenue per day
    prisma.order.findMany({
      where: {
        status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
        createdAt: { gte: startDate },
      },
      select: { total: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),

    // Orders per day (all statuses)
    prisma.order.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true },
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

    // Recent 5 orders
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        customerName: true,
        customerEmail: true,
        total: true,
        status: true,
        createdAt: true,
        _count: { select: { items: true } },
      },
    }),

    // Average order value
    prisma.order.aggregate({
      _avg: { total: true },
      where: { status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } },
    }),
  ]);

  // Build daily map
  const dailyMap: Record<string, { revenue: number; orders: number }> = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dailyMap[d.toISOString().slice(0, 10)] = { revenue: 0, orders: 0 };
  }

  revenueByDay.forEach((order) => {
    const day = order.createdAt.toISOString().slice(0, 10);
    if (day in dailyMap) dailyMap[day].revenue += order.total;
  });

  ordersByDay.forEach((order) => {
    const day = order.createdAt.toISOString().slice(0, 10);
    if (day in dailyMap) dailyMap[day].orders += 1;
  });

  const dailyData = Object.entries(dailyMap).map(([date, data]) => ({
    date,
    total: data.revenue,
    orders: data.orders,
    label: new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  // Category revenue
  const categoryMap: Record<string, number> = {};
  ordersByCategory.forEach((item: any) => {
    const name = item.product?.category?.name ?? 'Uncategorised';
    categoryMap[name] = (categoryMap[name] ?? 0) + item.total;
  });
  const categoryRevenue = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, total]) => ({ name, total }));

  // Period comparison
  const currentRevenue = recentRevenue._sum.total ?? 0;
  const previousRevenue = prevPeriodRevenue._sum.total ?? 0;
  const revenueChange =
    previousRevenue === 0
      ? 100
      : Math.round(
          ((currentRevenue - previousRevenue) / previousRevenue) * 100,
        );

  const ordersChange =
    prevPeriodOrders === 0
      ? 100
      : Math.round(
          ((recentOrders - prevPeriodOrders) / prevPeriodOrders) * 100,
        );

  return {
    stats: {
      totalRevenue: totalRevenue._sum.total ?? 0,
      totalOrders,
      totalProducts,
      totalCustomers: totalCustomers.length,
      recentRevenue: currentRevenue,
      recentOrders,
      prevPeriodRevenue: previousRevenue,
      prevPeriodOrders,
      revenueChange,
      ordersChange,
      avgOrderValue: Math.round(avgOrderValue._avg.total ?? 0),
    },
    ordersByStatus: ordersByStatus.map((o: any) => ({
      status: o.status,
      count: o._count,
    })),
    dailyRevenue: dailyData,
    topProducts: topProducts.map((p: any) => ({
      productId: p.productId,
      productName: p.productName,
      revenue: p._sum.total ?? 0,
      quantity: p._sum.quantity ?? 0,
    })),
    categoryRevenue,
    recentOrders: recentOrdersList.map((o: any) => ({
      id: o.id,
      customerName: o.customerName,
      customerEmail: o.customerEmail,
      total: o.total,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
      itemCount: o._count.items,
    })),
    days,
  };
}
