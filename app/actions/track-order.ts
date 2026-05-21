'use server';

import { prisma } from '@/lib/prisma';

export interface TrackedOrder {
  id: string;
  status: string;
  customerName: string | null;
  customerEmail: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  createdAt: Date;
  shippingAddress: Record<string, string> | null;
  items: {
    id: string;
    productName: string;
    productSlug: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  statusHistory: {
    id: string;
    status: string;
    note: string | null;
    createdAt: Date;
  }[];
}

export async function lookupOrder(
  orderId: string,
  email: string,
): Promise<{ order: TrackedOrder | null; error?: string }> {
  if (!orderId.trim() || !email.trim()) {
    return {
      order: null,
      error: 'Please enter both order reference and email.',
    };
  }

  // Support both full ID and 8-char reference
  const order = await prisma.order.findFirst({
    where: {
      customerEmail: { equals: email.trim(), mode: 'insensitive' },
      OR: [
        { id: orderId.trim() },
        { id: { startsWith: orderId.trim().toLowerCase() } },
      ],
    },
    include: {
      items: { orderBy: { productName: 'asc' } },
      statusHistory: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!order) {
    return {
      order: null,
      error:
        'No order found. Please check your order reference and email address.',
    };
  }

  return {
    order: {
      ...order,
      shippingAddress: order.shippingAddress as Record<string, string> | null,
    },
  };
}
