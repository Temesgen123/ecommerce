'use client';

import { useState, useTransition } from 'react';
import { adminAdjustPoints } from '@/app/actions/loyalty';

interface Props {
  customerId: string;
  currentPoints: number;
}

export default function AdminLoyaltyAdjust({
  customerId,
  currentPoints,
}: Props) {
  const [points, setPoints] = useState('');
  const [reason, setReason] = useState('');
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pts = parseInt(points);
    if (!pts || !reason.trim()) return;

    startTransition(async () => {
      await adminAdjustPoints(customerId, pts, reason);
      setPoints('');
      setReason('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">
          Adjust Points (use negative to deduct)
        </label>
        <input
          type="number"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          placeholder="e.g. 500 or -100"
          className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
          style={{ borderColor: 'var(--border-base)' }}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">
          Reason
        </label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Compensation for delayed order"
          className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
          style={{ borderColor: 'var(--border-base)' }}
        />
      </div>
      <button
        type="submit"
        disabled={isPending || !points || !reason}
        className="w-full rounded-lg py-2 text-sm font-semibold text-white disabled:opacity-60"
        style={{ background: 'var(--navy-900)' }}
      >
        {isPending ? 'Saving...' : 'Apply Adjustment'}
      </button>
      {success && (
        <p className="text-xs text-center" style={{ color: '#059669' }}>
          Points updated successfully!
        </p>
      )}
    </form>
  );
}
