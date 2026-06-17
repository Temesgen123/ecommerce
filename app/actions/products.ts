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
  // slug intentionally NOT sanitized via sanitizedString — the regex
  // above already restricts it to a safe character set
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

// Extract image URLs from FormData (images[0], images[1], ...)
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
    await prisma.product.create({
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
