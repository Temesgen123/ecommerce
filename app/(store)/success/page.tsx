import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import ClearCartOnSuccess from '@/components/store/ClearCartOnSuccess';

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export const metadata = { title: 'Order Confirmed' };

export default async function SuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams;

  // If no session_id, just show a generic success
  if (!session_id) {
    return <GenericSuccess />;
  }

  // Fetch the Stripe session for display details
  let customerEmail = '';
  let total = 0;
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items'],
    });
    customerEmail = session.customer_details?.email ?? '';
    total = session.amount_total ?? 0;
  } catch {
    return <GenericSuccess />;
  }

  // Fetch our order record
  const order = await prisma.order.findUnique({
    where: { stripeSessionId: session_id },
    include: { items: true },
  });

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      {/* Clear the cart client-side */}
      <ClearCartOnSuccess />

      <div
        className="inline-flex h-20 w-20 items-center justify-center rounded-full mb-6"
        style={{ background: 'var(--success-bg)' }}
      >
        <CheckCircle
          className="h-10 w-10"
          style={{ color: 'var(--success-text)' }}
        />
      </div>

      <h1
        className="text-3xl font-extrabold mb-2"
        style={{ color: 'var(--text-primary)' }}
      >
        Order Confirmed!
      </h1>
      <p className="text-base mb-8" style={{ color: 'var(--text-secondary)' }}>
        Thanks for your purchase. We've sent a confirmation to{' '}
        <span
          className="font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          {customerEmail}
        </span>
        .
      </p>

      {/* Order summary card */}
      {order && (
        <div
          className="rounded-2xl p-6 mb-8 text-left space-y-4"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: 'var(--text-muted)' }}>Order reference</span>
            <span
              className="font-mono font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              #{order.id.slice(0, 8).toUpperCase()}
            </span>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)' }} />

          {order.items.map((item: any) => (
            <div
              key={item.id}
              className="flex items-center justify-between text-sm"
            >
              <span style={{ color: 'var(--text-secondary)' }}>
                {item.productName} × {item.quantity}
              </span>
              <span
                className="font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                {formatPrice(item.total)}
              </span>
            </div>
          ))}

          <div style={{ borderTop: '1px solid var(--border-subtle)' }} />

          <div className="flex items-center justify-between">
            <span
              className="font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              Total
            </span>
            <span
              className="text-lg font-bold"
              style={{ color: 'var(--accent)' }}
            >
              {formatPrice(order.total)}
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/products"
          className="btn-navy rounded-lg px-6 py-3 text-sm font-semibold"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

function GenericSuccess() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <ClearCartOnSuccess />
      <div
        className="inline-flex h-20 w-20 items-center justify-center rounded-full mb-6"
        style={{ background: 'var(--success-bg)' }}
      >
        <CheckCircle
          className="h-10 w-10"
          style={{ color: 'var(--success-text)' }}
        />
      </div>
      <h1
        className="text-3xl font-extrabold mb-2"
        style={{ color: 'var(--text-primary)' }}
      >
        Order Confirmed!
      </h1>
      <p className="text-base mb-8" style={{ color: 'var(--text-secondary)' }}>
        Your payment was successful. Thank you for shopping with us.
      </p>
      <Link
        href="/products"
        className="btn-navy rounded-lg px-6 py-3 text-sm font-semibold"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
