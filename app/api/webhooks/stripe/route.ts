import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { sendLowStockAlert, LOW_STOCK_THRESHOLD } from '@/lib/stock-alert';
import { awardPointsForOrder } from '@/app/actions/loyalty';
import { redeemGiftCard } from '@/app/actions/gift-cards';
import { clearCart } from '@/app/actions/cart';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  console.log('🔔 Webhook received');
  const body = await req.text();

  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    console.error('❌ Missing stripe-signature header');
    return NextResponse.json(
      { error: 'Missing stripe-signature' },
      { status: 400 },
    );
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('❌ STRIPE_WEBHOOK_SECRET not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 },
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
    console.log('✅ Signature verified. Event type:', event.type);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('❌ Signature verification failed:', msg);
    return NextResponse.json(
      { error: `Webhook error: ${msg}` },
      { status: 400 },
    );
  }

  if (event.type !== 'checkout.session.completed') {
    console.log('ℹ️ Ignoring event type:', event.type);
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  console.log('💳 Session ID:', session.id);
  console.log('📦 Metadata:', JSON.stringify(session.metadata));
  console.log('📧 Customer email:', session.customer_details?.email);

  // Guard against duplicate deliveries
  const existing = await prisma.order.findUnique({
    where: { stripeSessionId: session.id },
  });
  if (existing) {
    console.log('⚠️ Order already exists for session — skipping duplicate');
    return NextResponse.json({ received: true });
  }

  // Parse cart metadata — now includes variantId and variantLabel
  type CartMeta = {
    id: string;
    variantId: string;
    variantLabel: string | null;
    quantity: number;
    price: number;
    name: string;
    slug: string;
  };

  let cartItems: CartMeta[] = [];
  try {
    cartItems = JSON.parse(session.metadata?.cart ?? '[]');
    console.log('🛒 Cart items parsed:', cartItems.length);
  } catch (err) {
    console.error('❌ Failed to parse cart metadata:', err);
    return NextResponse.json(
      { error: 'Invalid cart metadata' },
      { status: 400 },
    );
  }

  if (cartItems.length === 0) {
    console.error('❌ Cart is empty in metadata');
    return NextResponse.json({ error: 'Empty cart' }, { status: 400 });
  }

  // Use Stripe's actual charged amounts
  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingCost = (session as any).shipping_cost?.amount_total ?? 0;
  const tax = session.total_details?.amount_tax ?? 0;
  const discountAmount = session.total_details?.amount_discount ?? 0;
  const total =
    session.amount_total ?? subtotal + shippingCost + tax - discountAmount;

  const discountCode = session.metadata?.discountCode ?? null;

  // Extract shipping address — check both old and new Stripe API field paths
  const addr =
    (session as any).collected_information?.shipping_details?.address ??
    (session as any).shipping_details?.address;

  const shippingAddress = addr
    ? {
        line1: addr.line1 ?? '',
        line2: addr.line2 ?? '',
        city: addr.city ?? '',
        state: addr.state ?? '',
        postal_code: addr.postal_code ?? '',
        country: addr.country ?? '',
      }
    : null;

  if (!addr) {
    console.warn('⚠️ No shipping address found on session');
  }

  let order;
  try {
    order = await prisma.order.create({
      data: {
        status: 'PAID',
        stripeSessionId: session.id,
        stripePaymentIntent:
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : null,
        customerEmail: session.customer_details?.email ?? 'unknown@example.com',
        customerName: session.customer_details?.name ?? null,
        shippingAddress: shippingAddress ?? undefined,
        subtotal,
        shippingCost,
        tax,
        discount: discountAmount,
        discountCode: discountCode,
        total,
        items: {
          create: cartItems.map((item) => ({
            quantity: item.quantity,
            unitPrice: item.price,
            total: item.price * item.quantity,
            productId: item.id,
            productName: item.name,
            productSlug: item.slug,
            // Variant fields — null for products without color/size options
            variantId: item.variantId ?? null,
            variantLabel: item.variantLabel ?? null,
          })),
        },
      },
      include: { items: true },
    });

    await clearCart(session.customer_details?.email ?? 'unknown@example.com');
    console.log('✅ Order created:', order.id);

    // Award loyalty points
    const customer = await prisma.customer.findFirst({
      where: { email: session.customer_details?.email ?? '' },
    });

    // Redeem gift card if used
    const giftCardCode = session.metadata?.giftCardCode;
    const giftCardDiscount = parseInt(
      session.metadata?.giftCardDiscount ?? '0',
    );
    if (giftCardCode && giftCardDiscount > 0) {
      await redeemGiftCard(giftCardCode, giftCardDiscount, order.id);
    }

    if (customer) {
      await awardPointsForOrder(customer.id, order.id, order.total);
    }

    // Record initial PAID status in history
    await prisma.orderStatusHistory.create({
      data: { orderId: order.id, status: 'PAID' },
    });

    // ── Decrement variant stock (not product.stock) ──────────
    // Stock now lives on ProductVariant, not Product.
    // Each cart item references a specific variantId.
    const updatedVariants = await Promise.all(
      cartItems.map((item) =>
        prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
          select: {
            id: true,
            stock: true,
            productId: true,
            color: true,
            size: true,
            product: { select: { name: true, slug: true } },
          },
        }),
      ),
    );
    console.log('✅ Variant stock decremented');

    // Increment discount code usage count
    if (discountCode) {
      await prisma.discountCode.update({
        where: { code: discountCode },
        data: { usedCount: { increment: 1 } },
      });
      console.log(`✅ Discount code usage incremented: ${discountCode}`);
    }

    // Check for low/out-of-stock variants and alert admin
    const alertProducts = updatedVariants
      .filter((v) => v.stock <= LOW_STOCK_THRESHOLD)
      .map((v) => {
        const label =
          v.color && v.size
            ? `${v.product.name} (${v.color} / ${v.size})`
            : v.color
              ? `${v.product.name} (${v.color})`
              : v.size
                ? `${v.product.name} (${v.size})`
                : v.product.name;
        return {
          id: v.productId,
          name: label,
          slug: v.product.slug,
          stock: v.stock,
        };
      });

    if (alertProducts.length > 0) {
      console.log(
        `⚠️ ${alertProducts.length} variant(s) low/out of stock — sending alert`,
      );
      await sendLowStockAlert(alertProducts);
    }
    // Send order confirmation email
    await sendOrderConfirmationEmail({
      orderId: order.id,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      items: order.items.map((item: any) => ({
        productName: item.variantLabel
          ? `${item.productName} — ${item.variantLabel}`
          : item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      })),
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      tax: order.tax,
      total: order.total,
      shippingAddress: shippingAddress,
    });
  } catch (err) {
    console.error('❌ Failed to create order:', err);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 },
    );
  }
  return NextResponse.json({ received: true });
}
