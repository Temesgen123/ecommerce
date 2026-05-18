'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const StatusSchema = z.enum([
  'PENDING',
  'PAID',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
]);

export type OrderActionState = {
  error?: string;
  success?: boolean;
};

export async function updateOrderStatus(
  id: string,
  _prev: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const parsed = StatusSchema.safeParse(formData.get('status'));
  if (!parsed.success) return { error: 'Invalid status.' };

  try {
    // Update status and record history in a transaction
    await prisma.$transaction([
      prisma.order.update({
        where: { id },
        data: { status: parsed.data },
      }),
      prisma.orderStatusHistory.create({
        data: {
          orderId: id,
          status: parsed.data,
          note: (formData.get('note') as string) || null,
        },
      }),
    ]);
  } catch {
    return { error: 'Failed to update order status.' };
  }

  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${id}`);
  return { success: true };
}

// Called from webhook when order is first created as PAID
export async function recordInitialOrderStatus(
  orderId: string,
  status: 'PAID' | 'PENDING',
) {
  await prisma.orderStatusHistory.create({
    data: { orderId, status },
  });
}
