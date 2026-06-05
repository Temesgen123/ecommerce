'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCustomer } from '@/lib/customer-auth';

const ReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  body: z.string().min(10, 'Review must be at least 10 characters').max(1000),
  authorName: z.string().min(1, 'Name is required').max(64),
  authorEmail: z.string().email('Valid email required'),
});

export type ReviewFormState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
};

export async function submitReview(
  productId: string,
  _prev: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
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

  await prisma.productReview.create({
    data: {
      productId,
      ...parsed.data,
      approved: false,
      verifiedPurchase,
    },
  });

  revalidatePath('/products');
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
