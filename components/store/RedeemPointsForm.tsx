'use client';

import { useState, useTransition } from 'react';
import { redeemPoints } from '@/app/actions/loyalty';
import {
  POINTS_PER_REDEMPTION,
  formatPoints,
  calculateDiscountFromPoints,
} from '@/lib/loyalty';
import { Gift, Minus, Plus } from 'lucide-react';

interface Props {
  points: number;
}

export default function RedeemPointsForm({ points }: Props) {
  const maxRedeemable =
    Math.floor(points / POINTS_PER_REDEMPTION) * POINTS_PER_REDEMPTION;
  const [toRedeem, setToRedeem] = useState(
    Math.min(POINTS_PER_REDEMPTION, maxRedeemable),
  );
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    success?: boolean;
    error?: string;
    discount?: number;
  }>({});

  const discount = calculateDiscountFromPoints(toRedeem);

  const adjust = (delta: number) => {
    const next = toRedeem + delta * POINTS_PER_REDEMPTION;
    if (next >= POINTS_PER_REDEMPTION && next <= maxRedeemable) {
      setToRedeem(next);
    }
  };

  const handleRedeem = () => {
    startTransition(async () => {
      const res = await redeemPoints(toRedeem);
      if (res.success) {
        setResult({ success: true, discount: res.discountCents });
      } else {
        setResult({ error: res.error });
      }
    });
  };

  if (result.success) {
    return (
      <div
        className="rounded-xl p-4 text-center"
        style={{ background: '#D1FAE5', border: '1px solid #A7F3D0' }}
      >
        <Gift className="h-8 w-8 mx-auto mb-2" style={{ color: '#059669' }} />
        <p className="font-bold text-sm" style={{ color: '#059669' }}>
          Successfully redeemed {formatPoints(toRedeem)} points!
        </p>
        <p className="text-sm mt-1" style={{ color: '#065F46' }}>
          ${((result.discount ?? 0) / 100).toFixed(2)} discount applied to your
          next order.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        You have{' '}
        <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
          {formatPoints(points)} points
        </span>{' '}
        available. Select how many to redeem:
      </p>

      {/* Points selector */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => adjust(-1)}
          disabled={toRedeem <= POINTS_PER_REDEMPTION}
          className="rounded-lg p-2 border transition-colors disabled:opacity-40"
          style={{ borderColor: 'var(--border-base)' }}
        >
          <Minus className="h-4 w-4" />
        </button>

        <div className="flex-1 text-center">
          <p
            className="text-2xl font-extrabold"
            style={{ color: 'var(--text-primary)' }}
          >
            {formatPoints(toRedeem)}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            points = ${(discount / 100).toFixed(2)} off
          </p>
        </div>

        <button
          onClick={() => adjust(1)}
          disabled={toRedeem >= maxRedeemable}
          className="rounded-lg p-2 border transition-colors disabled:opacity-40"
          style={{ borderColor: 'var(--border-base)' }}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Redeem button */}
      <button
        onClick={handleRedeem}
        disabled={isPending || toRedeem < POINTS_PER_REDEMPTION}
        className="w-full rounded-lg py-3 text-sm font-bold text-white disabled:opacity-60"
        style={{ background: 'var(--navy-900)' }}
      >
        {isPending
          ? 'Redeeming...'
          : `Redeem ${formatPoints(toRedeem)} Points for $${(discount / 100).toFixed(2)} Off`}
      </button>

      {result.error && (
        <p
          className="text-sm text-center"
          style={{ color: 'var(--error-text)' }}
        >
          {result.error}
        </p>
      )}
    </div>
  );
}
