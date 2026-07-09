'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { sanitizedString } from '@/lib/sanitize';

export type VariantFormState = {
  errors?: Record<string, string[]>;
  message?: string;
};

const VariantSchema = z.object({
  color: sanitizedString({ min: 0, max: 50 }).optional(),
  size: sanitizedString({ min: 0, max: 50 }).optional(),
  sku: sanitizedString({ min: 0, max: 100 }).optional(),
  price: z.coerce.number().min(0).optional().nullable(),
  stock: z.coerce.number().int().min(0),
});

function toCents(dollars: number | null | undefined): number | null {
  if (dollars == null) return null;
  return Math.round(dollars * 100);
}

export async function createVariant(
  productId: string,
  _prev: VariantFormState,
  formData: FormData,
): Promise<VariantFormState> {
  const parsed = VariantSchema.safeParse({
    color: formData.get('color') || undefined,
    size: formData.get('size') || undefined,
    sku: formData.get('sku') || undefined,
    price: formData.get('price') || null,
    stock: formData.get('stock'),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { color, size, sku, price, stock } = parsed.data;

  // Require at least one of color/size — a variant with neither
  // is the implicit "default" variant created automatically on
  // product creation; admins shouldn't create a second one of those.
  if (!color && !size) {
    return {
      errors: {
        color: ['Set at least a color or a size for this variant.'],
      },
    };
  }

  try {
    await prisma.productVariant.create({
      data: {
        productId,
        color: color || null,
        size: size || null,
        sku: sku || null,
        price: toCents(price),
        stock,
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes('Unique constraint')) {
      if (msg.includes('sku')) {
        return { errors: { sku: ['This SKU is already in use.'] } };
      }
      return {
        errors: {
          color: [
            'A variant with this exact color/size combination already exists.',
          ],
        },
      };
    }
    return { message: 'Database error: failed to create variant.' };
  }

  revalidatePath(`/admin/products/${productId}/edit`);
  return { message: 'ok' };
}

export async function updateVariant(
  variantId: string,
  productId: string,
  _prev: VariantFormState,
  formData: FormData,
): Promise<VariantFormState> {
  const parsed = VariantSchema.safeParse({
    color: formData.get('color') || undefined,
    size: formData.get('size') || undefined,
    sku: formData.get('sku') || undefined,
    price: formData.get('price') || null,
    stock: formData.get('stock'),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { color, size, sku, price, stock } = parsed.data;

  try {
    await prisma.productVariant.update({
      where: { id: variantId },
      data: {
        color: color || null,
        size: size || null,
        sku: sku || null,
        price: toCents(price),
        stock,
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes('Unique constraint')) {
      if (msg.includes('sku')) {
        return { errors: { sku: ['This SKU is already in use.'] } };
      }
      return {
        errors: {
          color: [
            'A variant with this exact color/size combination already exists.',
          ],
        },
      };
    }
    return { message: 'Database error: failed to update variant.' };
  }

  revalidatePath(`/admin/products/${productId}/edit`);
  return { message: 'ok' };
}

export async function deleteVariant(
  variantId: string,
  productId: string,
): Promise<void> {
  // Guard: don't allow deleting the last remaining variant — every
  // product must always have at least one, or it becomes unpurchasable.
  const count = await prisma.productVariant.count({ where: { productId } });
  if (count <= 1) {
    throw new Error(
      'Cannot delete the only variant — products must have at least one.',
    );
  }

  await prisma.productVariant.delete({ where: { id: variantId } });
  revalidatePath(`/admin/products/${productId}/edit`);
}
