'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// ─── Validation schema ────────────────────────────────────────
const ProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must be lowercase with hyphens only',
    ),
  description: z.string().optional(),
  price: z.coerce
    .number({ invalid_type_error: 'Price must be a number' })
    .min(0, 'Price must be positive'),
  compareAt: z.coerce.number().min(0).optional().nullable(),
  stock: z.coerce.number().int().min(0, 'Stock must be 0 or more'),
  categoryId: z.string().optional().nullable(),
  published: z.coerce.boolean().optional(),
  featured: z.coerce.boolean().optional(),
  images: z.array(z.string().url()).optional(),
});

export type ProductFormState = {
  errors?: Record<string, string[]>;
  message?: string;
};

// ─── Helpers ──────────────────────────────────────────────────
function toCents(dollars: number) {
  return Math.round(dollars * 100);
}

// ─── Create ───────────────────────────────────────────────────
export async function createProduct(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const raw = {
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description'),
    price: formData.get('price'),
    compareAt: formData.get('compareAt') || null,
    stock: formData.get('stock'),
    categoryId: formData.get('categoryId') || null,
    published: formData.get('published') === 'on',
    featured: formData.get('featured') === 'on',
    images: [],
  };

  const parsed = ProductSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { price, compareAt, ...rest } = parsed.data;

  try {
    await prisma.product.create({
      data: {
        ...rest,
        price: toCents(price),
        compareAt: compareAt ? toCents(compareAt) : null,
        images: [],
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
  redirect('/admin/products');
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
    description: formData.get('description'),
    price: formData.get('price'),
    compareAt: formData.get('compareAt') || null,
    stock: formData.get('stock'),
    categoryId: formData.get('categoryId') || null,
    published: formData.get('published') === 'on',
    featured: formData.get('featured') === 'on',
    images: [],
  };

  const parsed = ProductSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { price, compareAt, ...rest } = parsed.data;

  try {
    await prisma.product.update({
      where: { id },
      data: {
        ...rest,
        price: toCents(price),
        compareAt: compareAt ? toCents(compareAt) : null,
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

// ─── Slug generator helper (called client-side via action) ────
export async function checkSlugAvailable(
  slug: string,
  excludeId?: string,
): Promise<boolean> {
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (!existing) return true;
  if (excludeId && existing.id === excludeId) return true;
  return false;
}
