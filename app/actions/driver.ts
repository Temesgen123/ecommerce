'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const DRIVER_EDITABLE_STATUSES = [
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'RETURNED',
] as const;
type DriverEditableStatus = (typeof DRIVER_EDITABLE_STATUSES)[number];

const ALLOWED_TRANSITIONS: Record<string, DriverEditableStatus[]> = {
  SHIPPED: ['OUT_FOR_DELIVERY', 'RETURNED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'RETURNED'],
};

/**
 * Accepts both DRIVER and ADMIN roles — matches the access already
 * granted by middleware.ts, which lets admins into /driver/* for
 * oversight. Returns the fresh user record plus a flag so callers
 * can branch behavior (e.g. "show all drivers' orders" for admins
 * vs. "show only mine" for drivers).
 *
 * Always re-checks the database rather than trusting the JWT claim
 * alone — see prior fix for the stale-session/revoked-account gap.
 */
async function requireDriverOrAdmin() {
  const session = await getServerSession(authOptions);
  const claimedRole = (session?.user as any)?.role;

  if (!session?.user || (claimedRole !== 'DRIVER' && claimedRole !== 'ADMIN')) {
    throw new Error('Unauthorized — driver or admin account required.');
  }

  const freshUser = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    select: { id: true, email: true, name: true, role: true },
  });

  if (
    !freshUser ||
    (freshUser.role !== 'DRIVER' && freshUser.role !== 'ADMIN')
  ) {
    throw new Error('Unauthorized — driver or admin account required.');
  }

  return { ...freshUser, isAdmin: freshUser.role === 'ADMIN' };
}

/**
 * Drivers see only their own assigned orders.
 * Admins see every order assigned to any driver (oversight view),
 * each tagged with the responsible driver's name so the admin can
 * tell whose deliveries they're looking at.
 */
export async function getDriverOrders() {
  const user = await requireDriverOrAdmin();

  const driverFilter = user.isAdmin
    ? { driverId: { not: null } } // any assigned order, regardless of which driver
    : { driverId: user.id }; // only this driver's own orders

  const [active, completed] = await Promise.all([
    prisma.order.findMany({
      where: {
        ...driverFilter,
        status: { in: ['SHIPPED', 'OUT_FOR_DELIVERY'] },
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        items: true,
        driver: user.isAdmin ? { select: { name: true, email: true } } : false,
      },
    }),
    prisma.order.findMany({
      where: {
        ...driverFilter,
        status: { in: ['DELIVERED', 'RETURNED'] },
      },
      orderBy: { updatedAt: 'desc' },
      take: user.isAdmin ? 50 : 20, // a bit more headroom for the admin combined view
      include: {
        items: true,
        driver: user.isAdmin ? { select: { name: true, email: true } } : false,
      },
    }),
  ]);

  return { active, completed, isAdmin: user.isAdmin };
}

/**
 * Updates an order's status. A driver may only update orders
 * assigned to themselves. An admin may update ANY assigned order
 * (full parity, per confirmed policy) — this is the actual fix for
 * the admin-oversight gap: admins were previously rejected outright
 * by a driver-only check, despite middleware already letting them
 * into /driver/*.
 */
export async function updateDeliveryStatus(
  orderId: string,
  newStatus: DriverEditableStatus,
) {
  const user = await requireDriverOrAdmin();

  if (!DRIVER_EDITABLE_STATUSES.includes(newStatus)) {
    return { success: false, error: 'Invalid status for driver update.' };
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order) {
    return { success: false, error: 'Order not found.' };
  }

  // Drivers are restricted to their own assigned orders.
  // Admins may act on any order (oversight parity).
  if (!user.isAdmin && order.driverId !== user.id) {
    return { success: false, error: 'This order is not assigned to you.' };
  }

  const allowedNextStatuses = ALLOWED_TRANSITIONS[order.status] ?? [];

  if (!allowedNextStatuses.includes(newStatus)) {
    return {
      success: false,
      error: `Cannot change status from ${order.status} to ${newStatus}. This order may have already been updated by someone else — refresh and try again.`,
    };
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus },
  });

  await prisma.orderStatusHistory.create({
    data: {
      orderId,
      status: newStatus,
      note: user.isAdmin
        ? `Updated by admin ${user.name ?? user.email} (oversight)`
        : `Updated by driver ${user.name ?? user.email}`,
    },
  });

  revalidatePath('/driver');
  revalidatePath('/track-order');

  return { success: true };
}
