import { Suspense } from 'react';
import OrderTracker from '@/components/store/OrderTracker';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Track Your Order' };

export default function OrderTrackingPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 md:py-16">
      <div className="text-center mb-10">
        <h1
          className="text-3xl font-extrabold"
          style={{ color: 'var(--text-primary)' }}
        >
          Track Your Order
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          Enter your order reference and email address to check your order
          status.
        </p>
      </div>
      <Suspense>
        <OrderTracker />
      </Suspense>
    </div>
  );
}
