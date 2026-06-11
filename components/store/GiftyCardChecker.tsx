'use client';

import { useState, useTransition } from 'react';
import { checkGiftCardBalance } from '@/app/actions/gift-cards';
import { Search, CheckCircle, XCircle } from 'lucide-react';

export default function GiftCardChecker() {
  const [code, setCode] = useState('');
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    success?: boolean;
    error?: string;
    balance?: number;
    initialValue?: number;
    expiresAt?: string;
  }>({});

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    startTransition(async () => {
      const res = await checkGiftCardBalance(code.trim());
      setResult(res);
    });
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleCheck} className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="XXXX-XXXX-XXXX-XXXX"
          maxLength={19}
          className="flex-1 rounded-lg px-4 py-3 text-sm font-mono outline-none tracking-widest"
          style={{
            border: '1px solid var(--border-base)',
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
          }}
        />
        <button
          type="submit"
          disabled={isPending || !code.trim()}
          className="rounded-lg px-5 py-3 text-sm font-bold text-white disabled:opacity-60 flex items-center gap-2"
          style={{ background: 'var(--navy-900)' }}
        >
          <Search className="h-4 w-4" />
          {isPending ? 'Checking...' : 'Check'}
        </button>
      </form>

      {/* Result */}
      {result.success === true && (
        <div
          className="rounded-xl p-5"
          style={{ background: '#D1FAE5', border: '1px solid #A7F3D0' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-5 w-5" style={{ color: '#059669' }} />
            <span className="font-bold text-sm" style={{ color: '#059669' }}>
              Valid Gift Card
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs mb-0.5" style={{ color: '#065F46' }}>
                Current Balance
              </p>
              <p
                className="text-2xl font-extrabold"
                style={{ color: '#059669' }}
              >
                ${((result.balance ?? 0) / 100).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs mb-0.5" style={{ color: '#065F46' }}>
                Original Value
              </p>
              <p
                className="text-2xl font-extrabold"
                style={{ color: '#065F46' }}
              >
                ${((result.initialValue ?? 0) / 100).toFixed(2)}
              </p>
            </div>
          </div>
          <p className="text-xs mt-3" style={{ color: '#065F46' }}>
            Expires:{' '}
            {new Date(result.expiresAt ?? '').toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
      )}

      {result.success === false && (
        <div
          className="rounded-xl p-4 flex items-center gap-3"
          style={{ background: '#FEE2E2', border: '1px solid #FECACA' }}
        >
          <XCircle
            className="h-5 w-5 flex-shrink-0"
            style={{ color: '#DC2626' }}
          />
          <p className="text-sm font-medium" style={{ color: '#DC2626' }}>
            {result.error}
          </p>
        </div>
      )}
    </div>
  );
}
