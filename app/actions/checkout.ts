'use server';

import { redirect } from 'next/navigation';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import type { CartItem } from '@/lib/cart-store';

export async function createCheckoutSession(items: CartItem[]) {
  if (!items || items.length === 0) {
    throw new Error('Cart is empty.');
  }

  // Verify every product still exists and is published
  const productIds = items.map((i) => i.id);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, published: true },
  });

  if (products.length !== items.length) {
    throw new Error('One or more products are no longer available.');
  }

  // Build Stripe line items using DB prices (never trust client-side prices)
  const lineItems = items.map((item) => {
    const product = products.find((p) => p.id === item.id)!;
    return {
      price_data: {
        currency: 'usd',
        unit_amount: product.price, // already in cents
        product_data: {
          name: product.name,
          ...(product.images[0] ? { images: [product.images[0]] } : {}),
        },
      },
      quantity: item.quantity,
    };
  });

  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/cart`,
    shipping_address_collection: {
      allowed_countries: ['US', 'CA', 'GB', 'AU', 'ET'],
    },
    shipping_options: [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: 0, currency: 'usd' },
          display_name: 'Standard shipping',
          delivery_estimate: {
            minimum: { unit: 'business_day', value: 5 },
            maximum: { unit: 'business_day', value: 7 },
          },
        },
      },
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: 999, currency: 'usd' },
          display_name: 'Express shipping',
          delivery_estimate: {
            minimum: { unit: 'business_day', value: 1 },
            maximum: { unit: 'business_day', value: 2 },
          },
        },
      },
    ],
    // Store cart metadata so the webhook can create the order
    metadata: {
      cart: JSON.stringify(
        items.map((i) => ({
          id: i.id,
          quantity: i.quantity,
          price: products.find((p) => p.id === i.id)!.price,
          name: i.name,
          slug: i.slug,
        })),
      ),
    },
  });

  if (!session.url)
    throw new Error('Failed to create Stripe checkout session.');

  redirect(session.url);
}
