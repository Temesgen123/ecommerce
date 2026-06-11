'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { generateGiftCardCode, getTwoYearsFromNow } from '@/lib/gift-cards';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Check gift card balance (public)
export async function checkGiftCardBalance(code: string) {
  if (!code) return { success: false, error: 'Please enter a gift card code.' };

  const giftCard = await prisma.giftCard.findUnique({
    where: { code: code.toUpperCase().replace(/\s/g, '') },
  });

  if (!giftCard) return { success: false, error: 'Gift card not found.' };
  if (!giftCard.isActive)
    return { success: false, error: 'This gift card has been deactivated.' };
  if (new Date() > giftCard.expiresAt)
    return { success: false, error: 'This gift card has expired.' };

  return {
    success: true,
    balance: giftCard.balance,
    initialValue: giftCard.initialValue,
    expiresAt: giftCard.expiresAt.toISOString(),
  };
}

// Apply gift card at checkout
export async function applyGiftCard(code: string, orderTotal: number) {
  const result = await checkGiftCardBalance(code);
  if (!result.success) return result;

  const giftCard = await prisma.giftCard.findUnique({
    where: { code: code.toUpperCase().replace(/\s/g, '') },
  });

  if (!giftCard) return { success: false, error: 'Gift card not found.' };

  const discount = Math.min(giftCard.balance, orderTotal);

  return {
    success: true,
    discount,
    remainingBalance: giftCard.balance - discount,
    code: giftCard.code,
  };
}

// Redeem gift card on confirmed order
export async function redeemGiftCard(
  code: string,
  amountToRedeem: number,
  orderId: string,
) {
  const giftCard = await prisma.giftCard.findUnique({
    where: { code: code.toUpperCase().replace(/\s/g, '') },
  });

  if (!giftCard || !giftCard.isActive) return;

  const actualAmount = Math.min(giftCard.balance, amountToRedeem);

  await prisma.giftCard.update({
    where: { id: giftCard.id },
    data: {
      balance: { decrement: actualAmount },
      usages: {
        create: {
          orderId,
          amount: actualAmount,
        },
      },
    },
  });
}

// Admin: create gift card
export async function adminCreateGiftCard(data: {
  value: number;
  purchaserEmail?: string;
  recipientEmail?: string;
  note?: string;
  sendEmail?: boolean;
}) {
  const code = generateGiftCardCode();

  const giftCard = await prisma.giftCard.create({
    data: {
      code,
      initialValue: data.value,
      balance: data.value,
      expiresAt: getTwoYearsFromNow(),
      purchaserEmail: data.purchaserEmail || null,
      recipientEmail: data.recipientEmail || null,
      note: data.note || null,
    },
  });

  // Send email to recipient if provided
  if (data.sendEmail && data.recipientEmail) {
    await resend.emails.send({
      from: 'MyStore <hello@yourdomain.com>',
      to: data.recipientEmail,
      subject: 'You received a MyStore Gift Card! 🎁',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>You've received a gift card! 🎁</h2>
          <p>Someone special sent you a MyStore gift card worth <strong>$${(data.value / 100).toFixed(2)}</strong>.</p>
          ${data.note ? `<p style="font-style: italic; color: #666;">"${data.note}"</p>` : ''}
          <div style="background: #1E3A5F; color: #fff; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
            <p style="margin: 0 0 8px; font-size: 14px; opacity: 0.8;">Your Gift Card Code</p>
            <p style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: 4px; font-family: monospace;">${giftCard.code}</p>
          </div>
          <p>Valid until: <strong>${giftCard.expiresAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong></p>
          <a href="${process.env.NEXTAUTH_URL}/gift-cards" style="display: inline-block; background: #F97316; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Check Balance & Shop Now</a>
        </div>
      `,
    });
  }

  revalidatePath('/admin/gift-cards');
  return giftCard;
}

// Admin: toggle active status
export async function adminToggleGiftCard(id: string, isActive: boolean) {
  await prisma.giftCard.update({
    where: { id },
    data: { isActive },
  });
  revalidatePath('/admin/gift-cards');
}

// Admin: get all gift cards
export async function adminGetGiftCards() {
  return prisma.giftCard.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { usages: true } },
    },
  });
}
