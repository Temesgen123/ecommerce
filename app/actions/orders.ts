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
    await prisma.order.update({
      where: { id },
      data: { status: parsed.data },
    });
  } catch {
    return { error: 'Failed to update order status.' };
  }

  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${id}`);
  return { success: true };
}
