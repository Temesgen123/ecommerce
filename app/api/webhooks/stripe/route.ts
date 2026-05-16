import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { sendOrderConfirmationEmail } from '@/lib/email';

export const runtime = 'nodejs';

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

  // Parse cart metadata
  type CartMeta = {
    id: string;
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

  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingCost = (session as any).shipping_cost?.amount_total ?? 0;
  const tax = session.total_details?.amount_tax ?? 0;
  const total = subtotal + shippingCost + tax;

  const addr = (session as any).shipping_details?.address;
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
        shippingAddress: shippingAddress ?? Prisma.JsonNull,
        subtotal,
        shippingCost,
        tax,
        total,
        items: {
          create: cartItems.map((item) => ({
            quantity: item.quantity,
            unitPrice: item.price,
            total: item.price * item.quantity,
            productId: item.id,
            productName: item.name,
            productSlug: item.slug,
          })),
        },
      },
      include: { items: true },
    });

    console.log('✅ Order created:', order.id);

    // Decrement stock
    await Promise.all(
      cartItems.map((item) =>
        prisma.product.update({
          where: { id: item.id },
          data: { stock: { decrement: item.quantity } },
        }),
      ),
    );

    console.log('✅ Stock decremented');
  } catch (err) {
    console.error('❌ Failed to create order:', err);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 },
    );
  }

  // Increment discount code usage count
  const discountCodeUsed = session.metadata?.discountCode;
  if (discountCodeUsed) {
    await prisma.discountCode.update({
      where: { code: discountCodeUsed },
      data: { usedCount: { increment: 1 } },
    });
    console.log(`✅ Discount code usage incremented: ${discountCodeUsed}`);
  }

  // Send confirmation email — never let this block the webhook response
  await sendOrderConfirmationEmail({
    orderId: order.id,
    customerEmail: order.customerEmail,
    customerName: order.customerName,
    items: order.items.map((item) => ({
      productName: item.productName,
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

  return NextResponse.json({ received: true });
}
