'use server';

import { prisma } from '@/lib/prisma';
import { formatPrice, formatDate } from '@/lib/order-utils';

export async function exportOrdersToCSV(status?: string) {
  const orders = await prisma.order.findMany({
    where: status ? { status: status as any } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          product: { select: { name: true } },
        },
      },
    },
  });

  const rows = [
    // Header row
    [
      'Order ID',
      'Customer Name',
      'Customer Email',
      'Items',
      'Subtotal',
      'Discount',
      'Shipping',
      'Tax',
      'Total',
      'Status',
      'Discount Code',
      'Date',
    ].join(','),

    // Data rows
    ...orders.map((order) =>
      [
        `#${order.id.slice(0, 8).toUpperCase()}`,
        `"${order.customerName ?? ''}"`,
        `"${order.customerEmail}"`,
        order.items.length,
        formatPrice(order.subtotal),
        formatPrice(order.discount),
        formatPrice(order.shippingCost),
        formatPrice(order.tax),
        formatPrice(order.total),
        order.status,
        order.discountCode ?? '',
        formatDate(order.createdAt),
      ].join(','),
    ),
  ];

  return rows.join('\n');
}
