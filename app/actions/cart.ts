'use server';

import { prisma } from '@/lib/prisma';
import { getCustomer } from '@/lib/customer-auth';
import { revalidatePath } from 'next/cache';

async function getOrCreateCart(customerId: string) {
  return prisma.cart.upsert({
    where: { customerId },
    update: {},
    create: { customerId },
  });
}

/**
 * Add a specific variant to the logged-in customer's DB cart.
 * variantId is now required since CartItem.variantId is non-nullable.
 * Guests (not logged in) are silently ignored — their cart stays
 * client-side only (Zustand/localStorage).
 */
export async function addToCart(
  productId: string,
  quantity: number = 1,
  variantId?: string,
) {
  const customer = await getCustomer();
  if (!customer) return { success: false };

  // variantId is required for the new schema.
  // If not provided (legacy call without variant selection),
  // look up the default variant for this product (color: null, size: null).
  let resolvedVariantId = variantId;
  if (!resolvedVariantId) {
    const defaultVariant = await prisma.productVariant.findFirst({
      where: { productId, color: null, size: null },
      select: { id: true },
    });
    if (!defaultVariant) {
      console.error(
        `No variant found for product ${productId} — cannot add to cart`,
      );
      return { success: false };
    }
    resolvedVariantId = defaultVariant.id;
  }

  const cart = await getOrCreateCart(customer.id);

  await prisma.cartItem.upsert({
    where: {
      cartId_variantId: { cartId: cart.id, variantId: resolvedVariantId },
    },
    update: { quantity: { increment: quantity } },
    create: {
      cartId: cart.id,
      productId,
      variantId: resolvedVariantId,
      quantity,
    },
  });

  // Bump cart.updatedAt so abandonment is measured from the latest activity
  await prisma.cart.update({
    where: { id: cart.id },
    data: { updatedAt: new Date(), reminderSentAt: null },
  });

  revalidatePath('/cart');
  return { success: true };
}

export async function updateCartItem(variantId: string, quantity: number) {
  const customer = await getCustomer();
  if (!customer) return { success: false };

  const cart = await getOrCreateCart(customer.id);

  if (quantity <= 0) {
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, variantId },
    });
  } else {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { productId: true },
    });
    if (!variant) return { success: false };

    await prisma.cartItem.upsert({
      where: { cartId_variantId: { cartId: cart.id, variantId } },
      update: { quantity },
      create: {
        cartId: cart.id,
        productId: variant.productId,
        variantId,
        quantity,
      },
    });
  }

  await prisma.cart.update({
    where: { id: cart.id },
    data: { updatedAt: new Date(), reminderSentAt: null },
  });

  revalidatePath('/cart');
  return { success: true };
}

export async function removeFromCart(variantId: string) {
  const customer = await getCustomer();
  if (!customer) return { success: false };

  const cart = await getOrCreateCart(customer.id);

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id, variantId },
  });

  revalidatePath('/cart');
  return { success: true };
}

/**
 * Called after a successful Stripe order to clear the customer's cart.
 */
export async function clearCart(customerEmail: string) {
  const customer = await prisma.customer.findUnique({
    where: { email: customerEmail.toLowerCase() },
  });
  if (!customer) return;

  await prisma.cart.deleteMany({ where: { customerId: customer.id } });
}

/**
 * Load the logged-in customer's cart with product + variant details.
 */
export async function getCustomerCart() {
  const customer = await getCustomer();
  if (!customer) return null;

  return prisma.cart.findUnique({
    where: { customerId: customer.id },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
  });
}
