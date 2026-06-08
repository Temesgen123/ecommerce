import type { Metadata } from 'next';
import { Truck, Clock, MapPin, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Shipping Policy',
  description:
    'Learn about MyStore shipping options, delivery times, and costs.',
};

export default function ShippingPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-10">
        <h1
          className="text-3xl font-extrabold mb-3"
          style={{ color: 'var(--text-primary)' }}
        >
          Shipping Policy
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Last updated: January 1, 2026
        </p>
      </div>

      {/* Quick info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[
          {
            icon: <Truck className="h-5 w-5" />,
            title: 'Free Shipping',
            sub: 'On orders over $50',
          },
          {
            icon: <Clock className="h-5 w-5" />,
            title: '3–7 Business Days',
            sub: 'Standard delivery',
          },
          {
            icon: <MapPin className="h-5 w-5" />,
            title: 'Worldwide Shipping',
            sub: 'We ship internationally',
          },
        ].map(({ icon, title, sub }) => (
          <div
            key={title}
            className="flex items-start gap-3 rounded-xl p-4"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div
              className="flex-shrink-0 rounded-lg p-2"
              style={{ background: 'var(--navy-50)', color: 'var(--navy-700)' }}
            >
              {icon}
            </div>
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                {title}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-8" style={{ color: 'var(--text-primary)' }}>
        <section>
          <h2 className="text-lg font-bold mb-3">1. Processing Time</h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            All orders are processed within 1–2 business days after payment
            confirmation. Orders placed on weekends or public holidays will be
            processed on the next business day. You will receive an email
            confirmation once your order has shipped.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">
            2. Shipping Rates & Delivery Times
          </h2>
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: '1px solid var(--border-subtle)' }}
          >
            <table className="w-full text-sm">
              <thead style={{ background: 'var(--bg-elevated)' }}>
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">
                    Shipping Method
                  </th>
                  <th className="text-left px-4 py-3 font-semibold">
                    Delivery Time
                  </th>
                  <th className="text-left px-4 py-3 font-semibold">Cost</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    method: 'Standard Shipping',
                    time: '3–7 business days',
                    cost: '$5.99',
                  },
                  {
                    method: 'Express Shipping',
                    time: '1–3 business days',
                    cost: '$14.99',
                  },
                  {
                    method: 'Overnight Shipping',
                    time: '1 business day',
                    cost: '$29.99',
                  },
                  {
                    method: 'Free Shipping',
                    time: '5–7 business days',
                    cost: 'Free (orders over $50)',
                  },
                ].map((row, i) => (
                  <tr
                    key={row.method}
                    style={{
                      background:
                        i % 2 === 0
                          ? 'var(--bg-surface)'
                          : 'var(--bg-elevated)',
                      borderTop: '1px solid var(--border-subtle)',
                    }}
                  >
                    <td className="px-4 py-3">{row.method}</td>
                    <td
                      className="px-4 py-3"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {row.time}
                    </td>
                    <td
                      className="px-4 py-3"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {row.cost}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">3. International Shipping</h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            We ship to most countries worldwide. International delivery
            typically takes 7–21 business days depending on the destination.
            Please note that customers are responsible for any customs duties,
            taxes, or import fees charged by their country.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">4. Order Tracking</h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            Once your order ships, you will receive a tracking number via email.
            You can use this number to track your order on our{' '}
            <a
              href="/track-order"
              className="font-semibold hover:underline"
              style={{ color: 'var(--navy-600)' }}
            >
              order tracking page
            </a>
            . Please allow up to 24 hours for the tracking information to become
            available.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">
            5. Incorrect Shipping Address
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            Please ensure your shipping address is correct before placing your
            order. MyStore is not responsible for orders shipped to incorrect
            addresses provided by the customer. If you notice an error, contact
            us immediately at{' '}
            <a
              href="/contact"
              className="font-semibold hover:underline"
              style={{ color: 'var(--navy-600)' }}
            >
              support@mystore.com
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">
            6. Lost or Damaged Packages
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            If your package arrives damaged or is lost in transit, please
            contact us within 7 days of the expected delivery date. We will work
            with the carrier to resolve the issue and ensure you receive your
            order or a full refund.
          </p>
        </section>

        {/* Notice */}
        <div
          className="flex gap-3 rounded-xl p-4"
          style={{
            background: 'var(--navy-50)',
            border: '1px solid var(--navy-100)',
          }}
        >
          <AlertCircle
            className="h-5 w-5 flex-shrink-0 mt-0.5"
            style={{ color: 'var(--navy-700)' }}
          />
          <p className="text-sm" style={{ color: 'var(--navy-700)' }}>
            This is a placeholder shipping policy. Please update it with your
            actual shipping rates, carriers, and terms before going live.
          </p>
        </div>
      </div>

      {/* Footer note */}
      <div
        className="mt-10 pt-6"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Have questions about your shipment?{' '}
          <a
            href="/contact"
            className="font-semibold hover:underline"
            style={{ color: 'var(--navy-600)' }}
          >
            Contact our support team
          </a>
          .
        </p>
      </div>
    </div>
  );
}
