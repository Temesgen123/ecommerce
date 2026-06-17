'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { sanitizedString } from '@/lib/sanitize';

// ─── Validation ───────────────────────────────────────────────
const CategorySchema = z.object({
  name: sanitizedString({ min: 1, max: 64, message: 'Name is required' }),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(64)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must be lowercase with hyphens only',
    ),
  // slug intentionally NOT sanitized via sanitizedString — the regex
  // above already restricts it to a safe character set
  description: sanitizedString({ min: 0, max: 256 }).optional(),
});

export type CategoryFormState = {
  errors?: Record<string, string[]>;
  message?: string;
};

// ─── Create ───────────────────────────────────────────────────
export async function createCategory(
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const parsed = CategorySchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description') || undefined,
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await prisma.category.create({ data: parsed.data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes('Unique constraint')) {
      const field = msg.includes('slug') ? 'slug' : 'name';
      return { errors: { [field]: [`This ${field} is already taken.`] } };
    }
    return { message: 'Database error: failed to create category.' };
  }

  revalidatePath('/admin/categories');
  return { message: 'ok' };
}

// ─── Update ───────────────────────────────────────────────────
export async function updateCategory(
  id: string,
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const parsed = CategorySchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description') || undefined,
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await prisma.category.update({ where: { id }, data: parsed.data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes('Unique constraint')) {
      const field = msg.includes('slug') ? 'slug' : 'name';
      return { errors: { [field]: [`This ${field} is already taken.`] } };
    }
    return { message: 'Database error: failed to update category.' };
  }

  revalidatePath('/admin/categories');
  return { message: 'ok' };
}

// ─── Delete ───────────────────────────────────────────────────
export async function deleteCategory(id: string): Promise<void> {
  // Products with this category will have categoryId set to null (onDelete: SetNull)
  await prisma.category.delete({ where: { id } });
  revalidatePath('/admin/categories');
}
