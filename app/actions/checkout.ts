'use server';

import { redirect } from 'next/navigation';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

// Cart item shape — variantId/variantLabel added for variant tracking
type CartItem = {
  id: string; // productId
  variantId: string; // productVariant.id
  variantLabel: string | null; // e.g. "Blue / Large"
  name: string;
  price: number; // cents
  quantity: number;
  image: string | null;
  slug: string;
};

type CheckoutInput = {
  items: CartItem[];
  discountCode?: string | null;
  discountAmount?: number;
  giftCardCode?: string | null;
  giftCardDiscount?: number;
};

export async function createCheckoutSession({
  items,
  discountCode,
  discountAmount = 0,
  giftCardCode,
  giftCardDiscount = 0,
}: CheckoutInput) {
  if (!items || items.length === 0) {
    throw new Error('Cart is empty.');
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

  // Validate stock for each variant before creating the session
  for (const item of items) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: item.variantId },
      select: { stock: true },
    });
    if (!variant || variant.stock < item.quantity) {
      throw new Error(
        `"${item.name}${item.variantLabel ? ` (${item.variantLabel})` : ''}" is out of stock or has insufficient quantity.`,
      );
    }
  }

  // Build Stripe line items
  const lineItems = items.map((item) => ({
    price_data: {
      currency: 'usd',
      unit_amount: item.price,
      product_data: {
        name: item.variantLabel
          ? `${item.name} — ${item.variantLabel}`
          : item.name,
        images: item.image ? [item.image] : [],
      },
    },
    quantity: item.quantity,
  }));

  // Handle discount code
  let stripeCouponId: string | undefined;
  if (discountCode && discountAmount > 0) {
    try {
      const coupon = await stripe.coupons.create({
        amount_off: discountAmount,
        currency: 'usd',
        duration: 'once',
        name: discountCode,
      });
      stripeCouponId = coupon.id;
    } catch (err) {
      console.error('Failed to create Stripe coupon:', err);
    }
  }

  // Handle gift card discount
  let stripeGiftCouponId: string | undefined;
  if (giftCardCode && giftCardDiscount > 0) {
    try {
      const coupon = await stripe.coupons.create({
        amount_off: giftCardDiscount,
        currency: 'usd',
        duration: 'once',
        name: `Gift Card: ${giftCardCode}`,
      });
      stripeGiftCouponId = coupon.id;
    } catch (err) {
      console.error('Failed to create Stripe gift card coupon:', err);
    }
  }

  // Combine coupons if both apply
  const discounts: any[] = [];
  if (stripeCouponId) discounts.push({ coupon: stripeCouponId });
  if (stripeGiftCouponId) discounts.push({ coupon: stripeGiftCouponId });

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    ...(discounts.length > 0 ? { discounts } : {}),
    shipping_address_collection: {
      allowed_countries: ['US', 'CA', 'GB', 'AU', 'ET'],
    },
    shipping_options: [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: 0, currency: 'usd' },
          display_name: 'Standard Shipping',
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
          display_name: 'Express Shipping',
          delivery_estimate: {
            minimum: { unit: 'business_day', value: 1 },
            maximum: { unit: 'business_day', value: 3 },
          },
        },
      },
    ],
    success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/checkout`,
    metadata: {
      // variantId and variantLabel are now included in the cart JSON
      // so the webhook can save them on each OrderItem
      cart: JSON.stringify(
        items.map((i) => ({
          id: i.id,
          variantId: i.variantId,
          variantLabel: i.variantLabel ?? null,
          quantity: i.quantity,
          price: i.price,
          name: i.name,
          slug: i.slug,
        })),
      ),
      discountCode: discountCode ?? '',
      giftCardCode: giftCardCode ?? '',
      giftCardDiscount: String(giftCardDiscount),
    },
  });

  if (!session.url) {
    throw new Error('Failed to create Stripe checkout session.');
  }

  redirect(session.url);
}
