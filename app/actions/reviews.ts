'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCustomer } from '@/lib/customer-auth';
import { contactLimiter } from '@/lib/ratelimit';
import { sanitizeText, sanitizeEmail } from '@/lib/sanitize';

const ReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  title: z
    .string()
    .max(100)
    .optional()
    .transform((v) => (v ? sanitizeText(v) : v)),
  body: z
    .string()
    .min(10, 'Review must be at least 10 characters')
    .max(1000)
    .transform(sanitizeText),
  authorName: z
    .string()
    .min(1, 'Name is required')
    .max(64)
    .transform(sanitizeText),
  authorEmail: z
    .string()
    .email('Valid email required')
    .transform(sanitizeEmail),
});

export type ReviewFormState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
};

async function getClientIP(): Promise<string> {
  const headersList = await headers();
  const forwarded = headersList.get('x-forwarded-for');
  const realIp = headersList.get('x-real-ip');
  return forwarded?.split(',')[0].trim() ?? realIp ?? '127.0.0.1';
}

export async function submitReview(
  productId: string,
  _prev: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  // ── Rate limit check ────────────────────────────────────
  // Reuses contactLimiter (3/hour) — reviews don't need their own
  // bucket, and this stops review-spam from a single IP regardless
  // of how many different emails are used.
  try {
    const ip = await getClientIP();
    const { success } = await contactLimiter.limit(ip);
    if (!success) {
      return { message: 'Too many submissions. Please try again in an hour.' };
    }
  } catch (error) {
    console.error('Rate limit check failed:', error);
  }
  // ─────────────────────────────────────────────────────────

  const parsed = ReviewSchema.safeParse({
    rating: formData.get('rating'),
    title: formData.get('title') || undefined,
    body: formData.get('body'),
    authorName: formData.get('authorName'),
    authorEmail: formData.get('authorEmail'),
  });

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  // Check for duplicate review
  const existing = await prisma.productReview.findFirst({
    where: { productId, authorEmail: parsed.data.authorEmail },
  });
  if (existing)
    return {
      errors: { authorEmail: ['You have already reviewed this product.'] },
    };

  // Check if customer is logged in and has purchased this product
  const customer = await getCustomer();
  let verifiedPurchase = false;

  if (
    customer &&
    customer.email.toLowerCase() === parsed.data.authorEmail.toLowerCase()
  ) {
    const purchase = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          customerEmail: { equals: customer.email, mode: 'insensitive' },
          status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
        },
      },
    });
    verifiedPurchase = !!purchase;
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { slug: true },
  });

  await prisma.productReview.create({
    data: {
      productId,
      ...parsed.data,
      approved: false,
      verifiedPurchase,
    },
  });

  revalidatePath('/products');
  if (product) revalidatePath(`/products/${product.slug}`);
  return {
    success: true,
    message: verifiedPurchase
      ? 'Thank you! Your verified review will appear after approval.'
      : 'Thank you! Your review will appear after approval.',
  };
}

export async function approveReview(id: string): Promise<void> {
  const review = await prisma.productReview.update({
    where: { id },
    data: { approved: true },
    include: { product: { select: { slug: true } } },
  });
  revalidatePath(`/products/${review.product.slug}`);
  revalidatePath('/admin/reviews');
}

export async function deleteReview(id: string): Promise<void> {
  const review = await prisma.productReview.findUnique({
    where: { id },
    include: { product: { select: { slug: true } } },
  });
  await prisma.productReview.delete({ where: { id } });
  if (review) revalidatePath(`/products/${review.product.slug}`);
  revalidatePath('/admin/reviews');
}
