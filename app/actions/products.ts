'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { sanitizedString } from '@/lib/sanitize';

const ProductSchema = z.object({
  name: sanitizedString({ min: 1, max: 200, message: 'Name is required' }),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must be lowercase with hyphens only',
    ),
  brand: sanitizedString({ min: 0, max: 100 }).optional(),
  description: sanitizedString({ min: 0, max: 5000 }).optional(),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  compareAt: z.coerce.number().min(0).optional().nullable(),
  stock: z.coerce.number().int().min(0),
  categoryId: z.string().optional().nullable(),
  published: z.coerce.boolean().optional(),
  featured: z.coerce.boolean().optional(),
});

export type ProductFormState = {
  errors?: Record<string, string[]>;
  message?: string;
};

function toCents(dollars: number) {
  return Math.round(dollars * 100);
}

function extractImages(formData: FormData): string[] {
  const images: string[] = [];
  let i = 0;
  while (formData.has(`images[${i}]`)) {
    const url = formData.get(`images[${i}]`) as string;
    if (url) images.push(url);
    i++;
  }
  return images;
}

// ─── Create ───────────────────────────────────────────────────
export async function createProduct(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const raw = {
    name: formData.get('name'),
    slug: formData.get('slug'),
    brand: formData.get('brand') || undefined,
    description: formData.get('description'),
    price: formData.get('price'),
    compareAt: formData.get('compareAt') || null,
    stock: formData.get('stock'),
    categoryId: formData.get('categoryId') || null,
    published: formData.get('published') === 'on',
    featured: formData.get('featured') === 'on',
  };

  const parsed = ProductSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const images = extractImages(formData);
  const { price, compareAt, ...rest } = parsed.data;

  let createdProduct;
  try {
    createdProduct = await prisma.product.create({
      data: {
        ...rest,
        price: toCents(price),
        compareAt: compareAt ? toCents(compareAt) : null,
        images,
      },
    });

    // Every product needs at least one variant to be purchasable —
    // create a default (no color/size options) variant automatically,
    // mirroring the product's own price/stock. Admins can later add
    // real color/size variants on the edit page, which replaces or
    // supplements this default as needed.
    await prisma.productVariant.create({
      data: {
        productId: createdProduct.id,
        color: null,
        size: null,
        price: null,
        stock: parsed.data.stock,
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes('Unique constraint') && msg.includes('slug')) {
      return { errors: { slug: ['This slug is already taken.'] } };
    }
    return { message: 'Database error: failed to create product.' };
  }

  revalidatePath('/admin/products');
  redirect(`/admin/products/${createdProduct.id}/edit`);
}

// ─── Update ───────────────────────────────────────────────────
export async function updateProduct(
  id: string,
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const raw = {
    name: formData.get('name'),
    slug: formData.get('slug'),
    brand: formData.get('brand') || undefined,
    description: formData.get('description'),
    price: formData.get('price'),
    compareAt: formData.get('compareAt') || null,
    stock: formData.get('stock'),
    categoryId: formData.get('categoryId') || null,
    published: formData.get('published') === 'on',
    featured: formData.get('featured') === 'on',
  };

  const parsed = ProductSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const images = extractImages(formData);
  const { price, compareAt, ...rest } = parsed.data;

  try {
    await prisma.product.update({
      where: { id },
      data: {
        ...rest,
        price: toCents(price),
        compareAt: compareAt ? toCents(compareAt) : null,
        images,
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes('Unique constraint') && msg.includes('slug')) {
      return { errors: { slug: ['This slug is already taken.'] } };
    }
    return { message: 'Database error: failed to update product.' };
  }

  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${id}`);
  redirect('/admin/products');
}

// ─── Delete ───────────────────────────────────────────────────
export async function deleteProduct(id: string): Promise<void> {
  await prisma.product.delete({ where: { id } });
  revalidatePath('/admin/products');
}

export async function checkSlugAvailable(
  slug: string,
  excludeId?: string,
): Promise<boolean> {
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (!existing) return true;
  if (excludeId && existing.id === excludeId) return true;
  return false;
}

// Update Stock
export async function updateStock(
  productId: string,
  stock: number,
  variantId?: string,
): Promise<void> {
  if (variantId) {
    // Update the specific variant's stock
    await prisma.productVariant.update({
      where: { id: variantId },
      data: { stock },
    });
  } else {
    // Legacy fallback — updates the base Product.stock field
    // (used before variants existed, kept for safety)
    await prisma.product.update({
      where: { id: productId },
      data: { stock },
    });
  }

  revalidatePath('/admin/products');
}
