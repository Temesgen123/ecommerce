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
  description: sanitizedString({ min: 0, max: 256 }).optional(),
  // parentId is optional — null means top-level category
  parentId: z.string().cuid().optional().nullable(),
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
  const rawParentId = formData.get('parentId');

  const parsed = CategorySchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description') || undefined,
    // Empty string means "no parent" — convert to null
    parentId: rawParentId && rawParentId !== '' ? rawParentId : null,
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  // Guard: a category cannot be its own parent (safety check)
  // Not needed on create since no id yet, but good to document intent.

  try {
    console.log('RAW parentId:', rawParentId);
    console.log('PARSED data:', JSON.stringify(parsed.data));
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
  revalidatePath('/');
  return { message: 'ok' };
}

// ─── Update ───────────────────────────────────────────────────
export async function updateCategory(
  id: string,
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const rawParentId = formData.get('parentId');

  const parsed = CategorySchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description') || undefined,
    parentId: rawParentId && rawParentId !== '' ? rawParentId : null,
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  // Guard: prevent a category from being set as a child of itself
  if (parsed.data.parentId === id) {
    return { errors: { parentId: ['A category cannot be its own parent.'] } };
  }

  // Guard: prevent circular references (a parent becoming a child of its own child)
  if (parsed.data.parentId) {
    const potentialParent = await prisma.category.findUnique({
      where: { id: parsed.data.parentId },
      select: { parentId: true },
    });
    if (potentialParent?.parentId === id) {
      return {
        errors: {
          parentId: [
            'Circular reference: that category is already a child of this one.',
          ],
        },
      };
    }
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
  revalidatePath('/');
  return { message: 'ok' };
}

// ─── Delete ───────────────────────────────────────────────────
export async function deleteCategory(id: string): Promise<void> {
  // Children of this category will have parentId set to null (onDelete: SetNull)
  // Products in this category will have categoryId set to null (onDelete: SetNull)
  await prisma.category.delete({ where: { id } });
  revalidatePath('/admin/categories');
  revalidatePath('/');
}
