import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCustomer } from '@/lib/customer-auth';
import { getLoyaltyAccount } from '@/app/actions/loyalty';
import {
  POINTS_PER_DOLLAR,
  POINTS_PER_REDEMPTION,
  formatPoints,
  calculateDiscountFromPoints,
} from '@/lib/loyalty';
import { Star, TrendingUp, Gift, Clock } from 'lucide-react';
import RedeemPointsForm from '@/components/store/RedeemPointsForm';

export const metadata: Metadata = { title: 'My Loyalty Points' };

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const TYPE_STYLES: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  EARNED: { label: 'Earned', color: '#059669', bg: '#D1FAE5' },
  REDEEMED: { label: 'Redeemed', color: '#DC2626', bg: '#FEE2E2' },
  ADJUSTED: { label: 'Adjusted', color: '#2563EB', bg: '#DBEAFE' },
  EXPIRED: { label: 'Expired', color: '#9CA3AF', bg: '#F1F5F9' },
};

export default async function LoyaltyPage() {
  const customer = await getCustomer();
  if (!customer) redirect('/account/login?redirect=/account/loyalty');

  const account = await getLoyaltyAccount();
  const points = account?.points ?? 0;
  const history = account?.history ?? [];
  const discountValue = calculateDiscountFromPoints(points);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div
          className="rounded-xl p-3"
          style={{ background: 'var(--navy-50)', color: 'var(--navy-700)' }}
        >
          <Star className="h-6 w-6" />
        </div>
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            Loyalty Points
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Earn points on every purchase and redeem for discounts
          </p>
        </div>
      </div>

      {/* Points balance card */}
      <div
        className="rounded-2xl p-6 mb-6 text-center relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, var(--navy-700) 0%, var(--navy-900) 100%)',
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 70% 50%, var(--accent) 0%, transparent 60%)',
          }}
        />
        <div className="relative">
          <p
            className="text-sm font-medium mb-1"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            Your Points Balance
          </p>
          <p className="text-5xl font-extrabold text-white mb-2">
            {formatPoints(points)}
          </p>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Worth{' '}
            <span className="font-bold text-white">
              ${(discountValue / 100).toFixed(2)}
            </span>{' '}
            in discounts
          </p>
        </div>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          {
            icon: <TrendingUp className="h-5 w-5" />,
            title: `Earn ${POINTS_PER_DOLLAR} pts/$1`,
            desc: 'Points added automatically after each purchase',
          },
          {
            icon: <Gift className="h-5 w-5" />,
            title: `${POINTS_PER_REDEMPTION} pts = $1 off`,
            desc: 'Redeem your points for instant discounts',
          },
          {
            icon: <Star className="h-5 w-5" />,
            title: 'Never Expire',
            desc: 'Your points stay active as long as your account is active',
          },
        ].map(({ icon, title, desc }) => (
          <div
            key={title}
            className="rounded-xl p-4 flex items-start gap-3"
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

      {/* Redeem form */}
      {points >= 100 && (
        <div
          className="rounded-xl p-6 mb-6"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <h2
            className="text-base font-bold mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            Redeem Points
          </h2>
          <RedeemPointsForm points={points} />
        </div>
      )}

      {/* Points history */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: '1px solid var(--border-subtle)' }}
      >
        <div
          className="px-5 py-4 flex items-center gap-2"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <Clock className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
          <h2
            className="text-base font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            Points History
          </h2>
        </div>

        {history.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No points activity yet. Make a purchase to start earning!
            </p>
          </div>
        ) : (
          <div
            className="divide-y"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            {history.map((h: any) => {
              const style = TYPE_STYLES[h.type] ?? TYPE_STYLES.ADJUSTED;
              return (
                <div
                  key={h.id}
                  className="flex items-center justify-between px-5 py-4"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-semibold flex-shrink-0"
                      style={{ background: style.bg, color: style.color }}
                    >
                      {style.label}
                    </span>
                    <div>
                      <p
                        className="text-sm font-medium"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {h.description}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {formatDate(h.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span
                    className="text-sm font-bold flex-shrink-0"
                    style={{ color: h.points > 0 ? '#059669' : '#DC2626' }}
                  >
                    {h.points > 0 ? '+' : ''}
                    {formatPoints(h.points)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
