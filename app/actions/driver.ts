'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Only these three statuses are editable by a driver — anything
// else (PENDING, PAID, PROCESSING, CANCELLED, REFUNDED) stays
// admin-only, since drivers shouldn't touch payment/processing state.
const DRIVER_EDITABLE_STATUSES = [
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'RETURNED',
] as const;
type DriverEditableStatus = (typeof DRIVER_EDITABLE_STATUSES)[number];

async function requireDriver() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'DRIVER') {
    throw new Error('Unauthorized — driver account required.');
  }
  return session.user as { id: string; email: string; name?: string };
}

/**
 * Returns orders assigned to the logged-in driver that are in a
 * state relevant to delivery (SHIPPED or OUT_FOR_DELIVERY) — i.e.
 * orders they still need to act on. Delivered/returned orders are
 * also fetched separately for a "completed" history view.
 */
export async function getDriverOrders() {
  const driver = await requireDriver();

  const [active, completed] = await Promise.all([
    prisma.order.findMany({
      where: {
        driverId: driver.id,
        status: { in: ['SHIPPED', 'OUT_FOR_DELIVERY'] },
      },
      orderBy: { updatedAt: 'desc' },
      include: { items: true },
    }),
    prisma.order.findMany({
      where: {
        driverId: driver.id,
        status: { in: ['DELIVERED', 'RETURNED'] },
      },
      orderBy: { updatedAt: 'desc' },
      take: 20, // recent history only, avoid unbounded growth
      include: { items: true },
    }),
  ]);

  return { active, completed };
}

/**
 * Updates an order's status. Restricted to:
 * - The order must be assigned to the calling driver
 * - The new status must be one of the three driver-editable values
 */
export async function updateDeliveryStatus(
  orderId: string,
  newStatus: DriverEditableStatus,
) {
  const driver = await requireDriver();

  if (!DRIVER_EDITABLE_STATUSES.includes(newStatus)) {
    return { success: false, error: 'Invalid status for driver update.' };
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order) {
    return { success: false, error: 'Order not found.' };
  }

  if (order.driverId !== driver.id) {
    return { success: false, error: 'This order is not assigned to you.' };
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus },
  });

  await prisma.orderStatusHistory.create({
    data: {
      orderId,
      status: newStatus,
      note: `Updated by driver ${driver.name ?? driver.email}`,
    },
  });

  revalidatePath('/driver');
  revalidatePath(`/track-order`); // customer-facing tracking page reflects new status too

  return { success: true };
}
