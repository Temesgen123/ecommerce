'use server';

import { redirect } from 'next/navigation';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import type { CartItem } from '@/lib/cart-store';

export async function createCheckoutSession(
  items: CartItem[],
  giftCardCode?: string,
  giftCardDiscount?: number,
  discountCode?: string,
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

  // Calculate subtotal from DB prices
  const subtotalCents = products.reduce((sum, product) => {
    const item = items.find((i) => i.id === product.id)!;
    return sum + product.price * item.quantity;
  }, 0);

  // ── Build single combined discount coupon ──
  const discounts: { coupon: string }[] = [];
  let totalDiscountCents = 0;
  const couponParts: string[] = [];

  // Add discount code amount
  if (discountCode) {
    const dc = await prisma.discountCode.findUnique({
      where: { code: discountCode.toUpperCase().trim() },
    });

    if (dc && dc.active) {
      const dcAmount =
        dc.type === 'PERCENTAGE'
          ? Math.round(subtotalCents * (dc.value / 100))
          : dc.value;
      totalDiscountCents += dcAmount;
      couponParts.push(dc.code);
    }
  }

  // Add gift card amount
  if (giftCardCode && giftCardDiscount && giftCardDiscount > 0) {
    totalDiscountCents += giftCardDiscount;
    couponParts.push(`Gift Card: ${giftCardCode}`);
  }

  // Create a single combined coupon if any discount applies
  if (totalDiscountCents > 0) {
    // Cap discount at subtotal to avoid negative totals
    const cappedDiscount = Math.min(totalDiscountCents, subtotalCents);
    const coupon = await stripe.coupons.create({
      amount_off: cappedDiscount,
      currency: 'usd',
      name: couponParts.join(' + '),
      duration: 'once',
    });
    discounts.push({ coupon: coupon.id });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    ...(discounts.length > 0 ? { discounts } : {}),
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
          price: products.find((p: any) => p.id === i.id)!.price,
          name: i.name,
          slug: i.slug,
        })),
      ),
      discountCode: discountCode ?? '',
      giftCardCode: giftCardCode ?? '',
      giftCardDiscount: giftCardDiscount?.toString() ?? '0',
    },
  });

  if (!session.url)
    throw new Error('Failed to create Stripe checkout session.');
  redirect(session.url);
}
