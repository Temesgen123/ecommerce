'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { sanitizedString } from '@/lib/sanitize';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    throw new Error('Unauthorized — admin account required.');
  }
}

export type ShippingFormState = {
  errors?: Record<string, string[]>;
  message?: string;
};

const ShippingSchema = z
  .object({
    carrier: z.enum(['FEDEX', 'UPS', 'MYSTORE_DELIVERY', 'OTHER']),
    carrierCompanyName: sanitizedString({ min: 0, max: 100 }).optional(),
    trackingNumber: sanitizedString({ min: 0, max: 100 }).optional(),
    driverId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.carrier === 'OTHER' && !data.carrierCompanyName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Company name is required when carrier is "Other".',
        path: ['carrierCompanyName'],
      });
    }
    if (data.carrier === 'MYSTORE_DELIVERY' && !data.driverId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Select a driver for MyStore Delivery.',
        path: ['driverId'],
      });
    }
  });

export async function getAllDrivers() {
  await requireAdmin();
  return prisma.user.findMany({
    where: { role: 'DRIVER' },
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' },
  });
}

export async function updateShipping(
  orderId: string,
  _prev: ShippingFormState,
  formData: FormData,
): Promise<ShippingFormState> {
  await requireAdmin();

  const parsed = ShippingSchema.safeParse({
    carrier: formData.get('carrier'),
    carrierCompanyName: formData.get('carrierCompanyName') || undefined,
    trackingNumber: formData.get('trackingNumber') || undefined,
    driverId: formData.get('driverId') || undefined,
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { carrier, carrierCompanyName, trackingNumber, driverId } = parsed.data;

  // Clear fields that don't apply to the selected carrier, so stale
  // data from a previous selection never lingers (e.g. switching
  // from "Other" back to "FedEx" shouldn't keep the old company name).
  await prisma.order.update({
    where: { id: orderId },
    data: {
      carrier,
      carrierCompanyName: carrier === 'OTHER' ? carrierCompanyName : null,
      trackingNumber:
        carrier !== 'MYSTORE_DELIVERY' ? trackingNumber || null : null,
      driverId: carrier === 'MYSTORE_DELIVERY' ? driverId : null,
    },
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath('/admin/orders');

  return { message: 'ok' };
}
