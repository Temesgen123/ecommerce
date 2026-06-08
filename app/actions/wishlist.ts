'use server';

import { prisma } from '@/lib/prisma';
import { getCustomer } from '@/lib/customer-auth';
import { revalidatePath } from 'next/cache';

export async function getWishlistItems() {
  const customer = await getCustomer();
  if (!customer) return [];

  const items = await prisma.wishlist.findMany({
    where: { customerId: customer.id },
    include: {
      product: {
        include: { category: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return items.map((w) => ({
    id: w.product.id,
    name: w.product.name,
    slug: w.product.slug,
    price: w.product.price,
    image: w.product.images[0] ?? null,
    category: w.product.category?.name ?? null,
  }));
}

export async function toggleWishlistItem(productId: string) {
  const customer = await getCustomer();
  if (!customer) return { error: 'Not logged in' };

  const existing = await prisma.wishlist.findUnique({
    where: {
      customerId_productId: {
        customerId: customer.id,
        productId,
      },
    },
  });

  if (existing) {
    await prisma.wishlist.delete({
      where: {
        customerId_productId: {
          customerId: customer.id,
          productId,
        },
      },
    });
    revalidatePath('/account/wishlist');
    return { saved: false };
  } else {
    await prisma.wishlist.create({
      data: { customerId: customer.id, productId },
    });
    revalidatePath('/account/wishlist');
    return { saved: true };
  }
}

export async function isInWishlist(productId: string) {
  const customer = await getCustomer();
  if (!customer) return false;

  const item = await prisma.wishlist.findUnique({
    where: {
      customerId_productId: {
        customerId: customer.id,
        productId,
      },
    },
  });

  return !!item;
}

export async function clearWishlist() {
  const customer = await getCustomer();
  if (!customer) return;

  await prisma.wishlist.deleteMany({
    where: { customerId: customer.id },
  });

  revalidatePath('/account/wishlist');
}
