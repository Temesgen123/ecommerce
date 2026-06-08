import type { Metadata } from 'next';
import {
  RotateCcw,
  CheckCircle,
  XCircle,
  AlertCircle,
  PackageOpen,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Returns Policy',
  description: 'Learn about MyStore returns, refunds, and exchange policy.',
};

export default function ReturnsPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-10">
        <h1
          className="text-3xl font-extrabold mb-3"
          style={{ color: 'var(--text-primary)' }}
        >
          Returns Policy
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Last updated: January 1, 2026
        </p>
      </div>

      {/* Quick info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[
          {
            icon: <RotateCcw className="h-5 w-5" />,
            title: '30-Day Returns',
            sub: 'Hassle-free returns',
          },
          {
            icon: <PackageOpen className="h-5 w-5" />,
            title: 'Easy Process',
            sub: 'Simple return steps',
          },
          {
            icon: <CheckCircle className="h-5 w-5" />,
            title: 'Full Refund',
            sub: 'On eligible items',
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
      <div className="space-y-8">
        <section>
          <h2
            className="text-lg font-bold mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            1. Return Eligibility
          </h2>
          <p
            className="text-sm leading-relaxed mb-4"
            style={{ color: 'var(--text-muted)' }}
          >
            We accept returns within 30 days of delivery. To be eligible for a
            return, your item must meet the following conditions:
          </p>
          <div className="space-y-2">
            {[
              'Item is unused and in the same condition as received',
              'Item is in its original packaging',
              'Item has all tags and labels attached',
              'You have proof of purchase or order number',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <CheckCircle
                  className="h-4 w-4 flex-shrink-0 mt-0.5"
                  style={{ color: '#22c55e' }}
                />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {item}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2
            className="text-lg font-bold mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            2. Non-Returnable Items
          </h2>
          <p
            className="text-sm leading-relaxed mb-4"
            style={{ color: 'var(--text-muted)' }}
          >
            The following items cannot be returned:
          </p>
          <div className="space-y-2">
            {[
              'Digital products or downloadable software',
              'Perishable goods such as food or flowers',
              'Intimate or sanitary goods for hygiene reasons',
              'Hazardous materials or flammable liquids',
              'Gift cards or store credit',
              'Items marked as final sale',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <XCircle
                  className="h-4 w-4 flex-shrink-0 mt-0.5"
                  style={{ color: '#ef4444' }}
                />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {item}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2
            className="text-lg font-bold mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            3. How to Return an Item
          </h2>
          <div className="space-y-4">
            {[
              {
                step: '1',
                title: 'Contact Us',
                desc: 'Email us at support@mystore.com with your order number and reason for return.',
              },
              {
                step: '2',
                title: 'Get Approval',
                desc: 'We will review your request and send you a Return Merchandise Authorization (RMA) number within 2 business days.',
              },
              {
                step: '3',
                title: 'Pack & Ship',
                desc: 'Pack the item securely with the RMA number clearly marked on the outside of the package and ship it to our returns address.',
              },
              {
                step: '4',
                title: 'Refund Issued',
                desc: 'Once we receive and inspect the item, we will process your refund within 5–7 business days.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-4">
                <div
                  className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: 'var(--navy-900)' }}
                >
                  {step}
                </div>
                <div>
                  <p
                    className="text-sm font-semibold mb-0.5"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {title}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2
            className="text-lg font-bold mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            4. Refunds
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            Once your return is received and inspected, we will notify you of
            the approval or rejection of your refund. If approved, your refund
            will be processed to your original payment method within 5–7
            business days. Please note that your bank or credit card company may
            take additional time to post the refund.
          </p>
        </section>

        <section>
          <h2
            className="text-lg font-bold mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            5. Exchanges
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            We only replace items if they are defective or damaged upon arrival.
            If you need to exchange an item for the same product, contact us at{' '}
            <a
              href="/contact"
              className="font-semibold hover:underline"
              style={{ color: 'var(--navy-600)' }}
            >
              support@mystore.com
            </a>{' '}
            within 7 days of receiving your order.
          </p>
        </section>

        <section>
          <h2
            className="text-lg font-bold mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            6. Return Shipping Costs
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            Customers are responsible for return shipping costs unless the item
            arrived damaged or we made an error with your order. In those cases,
            we will provide a prepaid return shipping label. We recommend using
            a trackable shipping service for returns as we cannot guarantee
            receipt of your returned item.
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
            This is a placeholder returns policy. Please update it with your
            actual return terms, conditions, and return address before going
            live.
          </p>
        </div>
      </div>

      {/* Footer note */}
      <div
        className="mt-10 pt-6"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Have questions about a return?{' '}
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
