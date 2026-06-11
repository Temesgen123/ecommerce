import type { Metadata } from 'next';
import GiftCardChecker from '@/components/store/GiftyCardChecker';
import { Gift, Shield, Clock, CreditCard } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Gift Cards',
  description: 'Check your MyStore gift card balance or redeem at checkout.',
};

export default function GiftCardsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="text-center mb-10">
        <div
          className="inline-flex items-center justify-center rounded-2xl p-4 mb-4"
          style={{ background: 'var(--navy-50)', color: 'var(--navy-700)' }}
        >
          <Gift className="h-8 w-8" />
        </div>
        <h1
          className="text-3xl font-extrabold mb-3"
          style={{ color: 'var(--text-primary)' }}
        >
          Gift Cards
        </h1>
        <p className="text-base" style={{ color: 'var(--text-muted)' }}>
          The perfect gift for everyone. Check your balance or use at checkout.
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[
          {
            icon: <Gift className="h-5 w-5" />,
            title: 'Perfect Gift',
            desc: 'Let them choose what they love',
          },
          {
            icon: <Clock className="h-5 w-5" />,
            title: 'Valid 2 Years',
            desc: 'Plenty of time to use it',
          },
          {
            icon: <Shield className="h-5 w-5" />,
            title: 'Never Lost',
            desc: 'Code safely stored in email',
          },
        ].map(({ icon, title, desc }) => (
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
                className="text-sm font-semibold mb-0.5"
                style={{ color: 'var(--text-primary)' }}
              >
                {title}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Balance checker */}
      <div
        className="rounded-2xl p-6 sm:p-8"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <CreditCard
            className="h-5 w-5"
            style={{ color: 'var(--navy-700)' }}
          />
          <h2
            className="text-lg font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            Check Your Balance
          </h2>
        </div>
        <GiftCardChecker />
      </div>

      {/* How to use */}
      <div className="mt-8">
        <h2
          className="text-lg font-bold mb-4"
          style={{ color: 'var(--text-primary)' }}
        >
          How to Use Your Gift Card
        </h2>
        <div className="space-y-3">
          {[
            {
              step: '1',
              title: 'Shop',
              desc: 'Browse and add products to your cart',
            },
            {
              step: '2',
              title: 'Checkout',
              desc: 'Proceed to checkout when ready',
            },
            {
              step: '3',
              title: 'Apply Code',
              desc: 'Enter your gift card code in the gift card field',
            },
            {
              step: '4',
              title: 'Save',
              desc: 'The gift card value is deducted from your total',
            },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex items-start gap-4">
              <div
                className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ background: 'var(--navy-900)' }}
              >
                {step}
              </div>
              <div>
                <p
                  className="text-sm font-semibold"
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
      </div>
    </div>
  );
}
