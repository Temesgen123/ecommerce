'use client';

import { useState, useTransition } from 'react';
import { validateDiscountCode } from '@/app/actions/discounts';

interface AppliedDiscount {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  savings: number;
}

interface DiscountInputProps {
  cartTotal: number;
  appliedCode: string | null;
  onApply: (discount: AppliedDiscount | null) => void;
}

export default function DiscountInput({
  cartTotal,
  appliedCode,
  onApply,
}: DiscountInputProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleApply() {
    if (!code.trim()) return;
    setError('');
    startTransition(async () => {
      const result = await validateDiscountCode(code, cartTotal);
      if (result.valid && result.discount) {
        onApply(result.discount);
        setCode('');
      } else {
        setError(result.message ?? 'Invalid code.');
      }
    });
  }

  function handleRemove() {
    onApply(null);
    setCode('');
    setError('');
  }

  if (appliedCode) {
    return (
      <div
        className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm"
        style={{
          background: 'var(--success-bg)',
          border: '1px solid rgba(22,163,74,0.2)',
        }}
      >
        <span style={{ color: 'var(--success-text)' }}>
          ✓ <strong>{appliedCode}</strong> applied
        </span>
        <button
          onClick={handleRemove}
          className="text-xs underline ml-2"
          style={{ color: 'var(--success-text)' }}
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError('');
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          placeholder="Discount code"
          className="input-theme flex-1 px-3 py-2 text-sm font-mono"
          disabled={isPending}
        />
        <button
          onClick={handleApply}
          disabled={isPending || !code.trim()}
          className="btn-navy rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
          {isPending ? '…' : 'Apply'}
        </button>
      </div>
      {error && (
        <p className="text-xs" style={{ color: 'var(--error-text)' }}>
          {error}
        </p>
      )}
    </div>
  );
}
