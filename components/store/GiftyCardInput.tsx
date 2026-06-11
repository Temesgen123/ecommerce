'use client';

import { useState, useTransition } from 'react';
import { applyGiftCard } from '@/app/actions/gift-cards';
import { Gift, X, CheckCircle } from 'lucide-react';

interface Props {
  orderTotal: number;
  onApply: (code: string, discount: number) => void;
  onRemove: () => void;
  appliedCode?: string | null;
  appliedDiscount?: number;
}

export default function GiftCardInput({
  orderTotal,
  onApply,
  onRemove,
  appliedCode,
  appliedDiscount,
}: Props) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    startTransition(async () => {
      const result = await applyGiftCard(code.trim(), orderTotal);
      if (
        result.success &&
        'discount' in result &&
        result.discount !== undefined
      ) {
        onApply(code.trim().toUpperCase(), result.discount as number);
        setCode('');
      } else {
        setError(
          'error' in result
            ? (result.error ?? 'Invalid gift card')
            : 'Invalid gift card',
        );
      }
    });
  };

  if (appliedCode) {
    return (
      <div
        className="flex items-center justify-between rounded-lg p-3"
        style={{ background: '#D1FAE5', border: '1px solid #A7F3D0' }}
      >
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4" style={{ color: '#059669' }} />
          <div>
            <p className="text-xs font-bold" style={{ color: '#059669' }}>
              Gift Card Applied
            </p>
            <p className="text-xs font-mono" style={{ color: '#065F46' }}>
              {appliedCode}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold" style={{ color: '#059669' }}>
            -${((appliedDiscount ?? 0) / 100).toFixed(2)}
          </span>
          <button
            onClick={onRemove}
            className="rounded-full p-1 hover:bg-green-200 transition-colors"
          >
            <X className="h-3.5 w-3.5" style={{ color: '#059669' }} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <form onSubmit={handleApply} className="flex gap-2">
        <div className="relative flex-1">
          <Gift
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Gift card code"
            className="w-full rounded-lg pl-9 pr-3 py-2.5 text-sm font-mono outline-none tracking-wider"
            style={{
              border: '1px solid var(--border-base)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
        <button
          type="submit"
          disabled={isPending || !code.trim()}
          className="rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
          style={{ background: 'var(--navy-900)', color: '#fff' }}
        >
          {isPending ? '...' : 'Apply'}
        </button>
      </form>
      {error && (
        <p className="text-xs" style={{ color: 'var(--error-text)' }}>
          {error}
        </p>
      )}
    </div>
  );
}
