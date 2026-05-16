'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// ─── Validation ───────────────────────────────────────────────
const DiscountSchema = z.object({
  code: z
    .string()
    .min(3, 'Code must be at least 3 characters')
    .max(32, 'Code must be at most 32 characters')
    .regex(
      /^[A-Z0-9_-]+$/,
      'Code must be uppercase letters, numbers, hyphens or underscores',
    ),
  type: z.enum(['PERCENTAGE', 'FIXED']),
  value: z.coerce.number().min(1, 'Value must be at least 1'),
  minOrderValue: z.coerce.number().min(0).optional().nullable(),
  maxUses: z.coerce.number().int().min(1).optional().nullable(),
  active: z.coerce.boolean().optional(),
  expiresAt: z.string().optional().nullable(),
});

export type DiscountFormState = {
  errors?: Record<string, string[]>;
  message?: string;
};

// ─── Create ───────────────────────────────────────────────────
export async function createDiscountCode(
  _prev: DiscountFormState,
  formData: FormData,
): Promise<DiscountFormState> {
  const parsed = DiscountSchema.safeParse({
    code: formData.get('code'),
    type: formData.get('type'),
    value: formData.get('value'),
    minOrderValue: formData.get('minOrderValue') || null,
    maxUses: formData.get('maxUses') || null,
    active: formData.get('active') === 'on',
    expiresAt: formData.get('expiresAt') || null,
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { value, minOrderValue, expiresAt, ...rest } = parsed.data;

  // For FIXED type, convert dollars to cents
  const storedValue = rest.type === 'FIXED' ? Math.round(value * 100) : value; // percentage stays as-is (e.g. 20 = 20%)

  try {
    await prisma.discountCode.create({
      data: {
        ...rest,
        value: storedValue,
        minOrderValue: minOrderValue ? Math.round(minOrderValue * 100) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes('Unique constraint')) {
      return { errors: { code: ['This code is already taken.'] } };
    }
    return { message: 'Database error: failed to create discount code.' };
  }

  revalidatePath('/admin/discounts');
  return { message: 'ok' };
}

// ─── Toggle active ────────────────────────────────────────────
export async function toggleDiscountCode(id: string, active: boolean) {
  await prisma.discountCode.update({ where: { id }, data: { active } });
  revalidatePath('/admin/discounts');
}

// ─── Delete ───────────────────────────────────────────────────
export async function deleteDiscountCode(id: string) {
  await prisma.discountCode.delete({ where: { id } });
  revalidatePath('/admin/discounts');
}

// ─── Validate (called from cart/checkout) ────────────────────
export async function validateDiscountCode(
  code: string,
  cartTotal: number, // in cents
): Promise<{
  valid: boolean;
  message?: string;
  discount?: {
    id: string;
    code: string;
    type: 'PERCENTAGE' | 'FIXED';
    value: number;
    savings: number; // computed cents off
  };
}> {
  if (!code.trim()) return { valid: false, message: 'Please enter a code.' };

  const dc = await prisma.discountCode.findUnique({
    where: { code: code.toUpperCase().trim() },
  });

  if (!dc) return { valid: false, message: 'Invalid discount code.' };
  if (!dc.active)
    return { valid: false, message: 'This code is no longer active.' };
  if (dc.expiresAt && dc.expiresAt < new Date()) {
    return { valid: false, message: 'This code has expired.' };
  }
  if (dc.maxUses !== null && dc.usedCount >= dc.maxUses) {
    return { valid: false, message: 'This code has reached its usage limit.' };
  }
  if (dc.minOrderValue !== null && cartTotal < dc.minOrderValue) {
    const min = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(dc.minOrderValue / 100);
    return {
      valid: false,
      message: `Minimum order of ${min} required for this code.`,
    };
  }

  // Calculate savings
  const savings =
    dc.type === 'PERCENTAGE'
      ? Math.round(cartTotal * (dc.value / 100))
      : Math.min(dc.value, cartTotal); // fixed can't exceed cart total

  return {
    valid: true,
    discount: {
      id: dc.id,
      code: dc.code,
      type: dc.type as 'PERCENTAGE' | 'FIXED',
      value: dc.value,
      savings,
    },
  };
}
