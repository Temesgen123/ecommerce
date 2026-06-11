'use server';

import { prisma } from '@/lib/prisma';
import { getCustomer } from '@/lib/customer-auth';
import { revalidatePath } from 'next/cache';
import {
  calculatePointsEarned,
  calculateDiscountFromPoints,
  MIN_POINTS_TO_REDEEM,
  POINTS_PER_REDEMPTION,
} from '@/lib/loyalty';

// Get or create loyalty account for customer
export async function getLoyaltyAccount() {
  const customer = await getCustomer();
  if (!customer) return null;

  let account = await prisma.loyaltyAccount.findUnique({
    where: { customerId: customer.id },
    include: {
      history: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!account) {
    account = await prisma.loyaltyAccount.create({
      data: { customerId: customer.id },
      include: { history: true },
    });
  }

  return account;
}

// Award points after a successful order
export async function awardPointsForOrder(
  customerId: string,
  orderId: string,
  orderTotal: number,
) {
  const points = calculatePointsEarned(orderTotal);
  if (points <= 0) return;

  let account = await prisma.loyaltyAccount.findUnique({
    where: { customerId },
  });

  if (!account) {
    account = await prisma.loyaltyAccount.create({
      data: { customerId },
    });
  }

  await prisma.loyaltyAccount.update({
    where: { customerId },
    data: {
      points: { increment: points },
      history: {
        create: {
          points,
          type: 'EARNED',
          description: `Earned for order #${orderId.slice(0, 8).toUpperCase()}`,
          orderId,
        },
      },
    },
  });
}

// Redeem points for discount
export async function redeemPoints(pointsToRedeem: number) {
  const customer = await getCustomer();
  if (!customer) return { success: false, error: 'Not logged in' };

  if (pointsToRedeem < MIN_POINTS_TO_REDEEM) {
    return {
      success: false,
      error: `Minimum ${MIN_POINTS_TO_REDEEM} points required`,
    };
  }

  // Must be multiple of POINTS_PER_REDEMPTION
  const validPoints =
    Math.floor(pointsToRedeem / POINTS_PER_REDEMPTION) * POINTS_PER_REDEMPTION;

  const account = await prisma.loyaltyAccount.findUnique({
    where: { customerId: customer.id },
  });

  if (!account || account.points < validPoints) {
    return { success: false, error: 'Insufficient points' };
  }

  const discountCents = calculateDiscountFromPoints(validPoints);

  await prisma.loyaltyAccount.update({
    where: { customerId: customer.id },
    data: {
      points: { decrement: validPoints },
      history: {
        create: {
          points: -validPoints,
          type: 'REDEEMED',
          description: `Redeemed ${validPoints} points for $${(discountCents / 100).toFixed(2)} off`,
        },
      },
    },
  });

  revalidatePath('/account/loyalty');
  return { success: true, discountCents };
}

// Admin: adjust points manually
export async function adminAdjustPoints(
  customerId: string,
  points: number,
  reason: string,
) {
  let account = await prisma.loyaltyAccount.findUnique({
    where: { customerId },
  });

  if (!account) {
    account = await prisma.loyaltyAccount.create({
      data: { customerId },
    });
  }

  const newPoints = Math.max(0, account.points + points);

  await prisma.loyaltyAccount.update({
    where: { customerId },
    data: {
      points: newPoints,
      history: {
        create: {
          points,
          type: 'ADJUSTED',
          description: `Admin adjustment: ${reason}`,
        },
      },
    },
  });

  revalidatePath('/admin/customers');
}

// Get points balance
export async function getPointsBalance() {
  const customer = await getCustomer();
  if (!customer) return 0;

  const account = await prisma.loyaltyAccount.findUnique({
    where: { customerId: customer.id },
  });

  return account?.points ?? 0;
}
