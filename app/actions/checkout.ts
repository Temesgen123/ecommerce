'use server';

import { redirect } from 'next/navigation';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import type { CartItem } from '@/lib/cart-store';

export async function createCheckoutSession(
  items: CartItem[],
  discountCode: string | null = null,
) {
  if (!items || items.length === 0) throw new Error('Cart is empty.');

  // Verify products still exist and are published
  const productIds = items.map((i) => i.id);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, published: true },
  });

  if (products.length !== items.length) {
    throw new Error('One or more products are no longer available.');
  }

  // Build line items using DB prices
  const lineItems = items.map((item) => {
    const product = products.find((p: any) => p.id === item.id)!;
    return {
      price_data: {
        currency: 'usd',
        unit_amount: product.price,
        product_data: {
          name: product.name,
          ...(product.images[0] ? { images: [product.images[0]] } : {}),
        },
      },
      quantity: item.quantity,
    };
  });

  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

  // ── Handle discount code ──────────────────────────────────
  let stripeDiscounts: { coupon: string }[] = [];

  if (discountCode) {
    const dc = await prisma.discountCode.findUnique({
      where: { code: discountCode.toUpperCase().trim() },
    });

    if (dc && dc.active) {
      // Create a one-time Stripe coupon matching our discount
      const coupon = await stripe.coupons.create({
        name: `${dc.code}`,
        duration: 'once',
        ...(dc.type === 'PERCENTAGE'
          ? { percent_off: dc.value }
          : { amount_off: dc.value, currency: 'usd' }),
      });
      stripeDiscounts = [{ coupon: coupon.id }];
    }
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    discounts: stripeDiscounts.length > 0 ? stripeDiscounts : undefined,
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
      discountCode: discountCode ?? '',
    },
  });

  if (!session.url)
    throw new Error('Failed to create Stripe checkout session.');
  redirect(session.url);
}
