'use server';

import { prisma } from '@/lib/prisma';
import { getCustomer } from '@/lib/customer-auth';
import { revalidatePath } from 'next/cache';

// ─────────────────────────────────────────────
// These actions sync the logged-in customer's cart to the DB.
// Call addToCart / updateCartItem / removeFromCart from your
// existing client-side cart logic (e.g. right after updating
// local/context state) so the DB always reflects what's in
// the customer's cart for abandoned-cart detection.
//
// If the customer is a guest (not logged in), these no-op —
// guest carts stay client-side only, as agreed.
// ─────────────────────────────────────────────

async function getOrCreateCart(customerId: string) {
  return prisma.cart.upsert({
    where: { customerId },
    update: {}, // touching updatedAt happens via the item write, not here
    create: { customerId },
  });
}

export async function addToCart(productId: string, quantity: number = 1) {
  const customer = await getCustomer();
  if (!customer) return { success: false };

  const cart = await getOrCreateCart(customer.id);

  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    update: { quantity: { increment: quantity } },
    create: { cartId: cart.id, productId, quantity },
  });

  // Bump cart.updatedAt so abandonment is measured from the latest activity
  await prisma.cart.update({
    where: { id: cart.id },
    data: { updatedAt: new Date(), reminderSentAt: null }, // reset reminder flag on new activity
  });

  revalidatePath('/cart');
  return { success: true };
}

export async function updateCartItem(productId: string, quantity: number) {
  const customer = await getCustomer();
  if (!customer) return { success: false };

  const cart = await getOrCreateCart(customer.id);

  if (quantity <= 0) {
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId },
    });
  } else {
    await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      update: { quantity },
      create: { cartId: cart.id, productId, quantity },
    });
  }

  await prisma.cart.update({
    where: { id: cart.id },
    data: { updatedAt: new Date(), reminderSentAt: null },
  });

  revalidatePath('/cart');
  return { success: true };
}

export async function removeFromCart(productId: string) {
  const customer = await getCustomer();
  if (!customer) return { success: false };

  const cart = await getOrCreateCart(customer.id);

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id, productId },
  });

  revalidatePath('/cart');
  return { success: true };
}

/**
 * Call this after a successful order is created (in your Stripe webhook)
 * to clear the cart — this also prevents an abandoned cart email going
 * out for a cart that actually converted.
 */
export async function clearCart(customerEmail: string) {
  const customer = await prisma.customer.findUnique({
    where: { email: customerEmail.toLowerCase() },
  });
  if (!customer) return;

  await prisma.cart.deleteMany({ where: { customerId: customer.id } });
}

/**
 * Load the logged-in customer's cart with product details —
 * use this on your /cart page or wherever you currently read
 * cart state, to hydrate from DB instead of/alongside local state.
 */
export async function getCustomerCart() {
  const customer = await getCustomer();
  if (!customer) return null;

  return prisma.cart.findUnique({
    where: { customerId: customer.id },
    include: {
      items: {
        include: { product: true },
      },
    },
  });
}
