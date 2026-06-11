'use client';

import { useState, useTransition } from 'react';
import {
  Gift,
  Plus,
  X,
  ToggleLeft,
  ToggleRight,
  Copy,
  Check,
} from 'lucide-react';
import {
  adminCreateGiftCard,
  adminToggleGiftCard,
} from '@/app/actions/gift-cards';
import { FIXED_AMOUNTS } from '@/lib/gift-cards';

interface GiftCard {
  id: string;
  code: string;
  initialValue: number;
  balance: number;
  isActive: boolean;
  expiresAt: string;
  purchaserEmail: string | null;
  recipientEmail: string | null;
  note: string | null;
  usageCount: number;
  createdAt: string;
}

const emptyForm = {
  value: 5000,
  customValue: '',
  useCustom: false,
  purchaserEmail: '',
  recipientEmail: '',
  note: '',
  sendEmail: false,
};

export default function AdminGiftCardsClient({
  giftCards: initial,
}: {
  giftCards: GiftCard[];
}) {
  const [giftCards, setGiftCards] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isPending, startTransition] = useTransition();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const value = form.useCustom
      ? Math.round(parseFloat(form.customValue) * 100)
      : form.value;

    if (!value || value <= 0) return;

    startTransition(async () => {
      await adminCreateGiftCard({
        value,
        purchaserEmail: form.purchaserEmail || undefined,
        recipientEmail: form.recipientEmail || undefined,
        note: form.note || undefined,
        sendEmail: form.sendEmail,
      });
      setShowForm(false);
      setForm(emptyForm);
      window.location.reload();
    });
  };

  const handleToggle = (id: string, current: boolean) => {
    startTransition(async () => {
      await adminToggleGiftCard(id, !current);
      setGiftCards((prev) =>
        prev.map((g) => (g.id === id ? { ...g, isActive: !current } : g)),
      );
    });
  };

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalValue = giftCards.reduce((s, g) => s + g.initialValue, 0);
  const totalBalance = giftCards.reduce((s, g) => s + g.balance, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Gift className="h-6 w-6 text-gray-400" />
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Gift Cards</h1>
            <p className="text-sm text-gray-500">
              {giftCards.length} gift card{giftCards.length !== 1 ? 's' : ''}{' '}
              issued
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white"
          style={{ background: 'var(--navy-900)' }}
        >
          <Plus className="h-4 w-4" />
          Create Gift Card
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Issued', value: giftCards.length.toString() },
          {
            label: 'Total Value Issued',
            value: `$${(totalValue / 100).toFixed(2)}`,
          },
          {
            label: 'Outstanding Balance',
            value: `$${(totalBalance / 100).toFixed(2)}`,
          },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl border bg-white p-4"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Create form modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">Create Gift Card</h2>
              <button onClick={() => setShowForm(false)}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              {/* Fixed amounts */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  Value
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {FIXED_AMOUNTS.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() =>
                        setForm({ ...form, value: amount, useCustom: false })
                      }
                      className="rounded-lg py-2 text-sm font-semibold border transition-colors"
                      style={{
                        background:
                          !form.useCustom && form.value === amount
                            ? 'var(--navy-900)'
                            : '#fff',
                        color:
                          !form.useCustom && form.value === amount
                            ? '#fff'
                            : 'var(--text-primary)',
                        borderColor: 'var(--border-base)',
                      }}
                    >
                      ${amount / 100}
                    </button>
                  ))}
                </div>

                {/* Custom amount */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="useCustom"
                    checked={form.useCustom}
                    onChange={(e) =>
                      setForm({ ...form, useCustom: e.target.checked })
                    }
                  />
                  <label htmlFor="useCustom" className="text-sm text-gray-600">
                    Custom amount
                  </label>
                </div>
                {form.useCustom && (
                  <div className="relative mt-2">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={form.customValue}
                      onChange={(e) =>
                        setForm({ ...form, customValue: e.target.value })
                      }
                      placeholder="0.00"
                      className="w-full rounded-lg border pl-7 pr-3 py-2 text-sm outline-none"
                      style={{ borderColor: 'var(--border-base)' }}
                    />
                  </div>
                )}
              </div>

              {/* Emails */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                  Purchaser Email (optional)
                </label>
                <input
                  type="email"
                  value={form.purchaserEmail}
                  onChange={(e) =>
                    setForm({ ...form, purchaserEmail: e.target.value })
                  }
                  placeholder="buyer@example.com"
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                  style={{ borderColor: 'var(--border-base)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                  Recipient Email (optional)
                </label>
                <input
                  type="email"
                  value={form.recipientEmail}
                  onChange={(e) =>
                    setForm({ ...form, recipientEmail: e.target.value })
                  }
                  placeholder="recipient@example.com"
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                  style={{ borderColor: 'var(--border-base)' }}
                />
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                  Personal Note (optional)
                </label>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  placeholder="Happy Birthday!"
                  rows={2}
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none resize-none"
                  style={{ borderColor: 'var(--border-base)' }}
                />
              </div>

              {/* Send email toggle */}
              {form.recipientEmail && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.sendEmail}
                    onChange={(e) =>
                      setForm({ ...form, sendEmail: e.target.checked })
                    }
                  />
                  <span className="text-sm text-gray-600">
                    Send gift card email to recipient
                  </span>
                </label>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 rounded-lg py-2.5 text-sm font-bold text-white disabled:opacity-60"
                  style={{ background: 'var(--navy-900)' }}
                >
                  {isPending ? 'Creating...' : 'Create Gift Card'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg px-4 py-2.5 text-sm font-semibold border"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gift cards table */}
      <div
        className="rounded-xl border bg-white overflow-hidden"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        {giftCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
            <Gift className="h-10 w-10" />
            <p className="text-sm">No gift cards yet. Create one!</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr
                className="text-left text-xs font-semibold uppercase tracking-wide text-gray-400"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}
              >
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Value</th>
                <th className="px-5 py-3">Balance</th>
                <th className="px-5 py-3">Recipient</th>
                <th className="px-5 py-3">Expires</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody
              className="divide-y"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              {giftCards.map((gc) => {
                const isExpired = new Date() > new Date(gc.expiresAt);
                const pctUsed =
                  gc.initialValue > 0
                    ? Math.round(
                        ((gc.initialValue - gc.balance) / gc.initialValue) *
                          100,
                      )
                    : 0;

                return (
                  <tr
                    key={gc.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Code */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-gray-800">
                          {gc.code}
                        </span>
                        <button
                          onClick={() => handleCopy(gc.code, gc.id)}
                          className="rounded p-1 hover:bg-gray-100 transition-colors"
                        >
                          {copiedId === gc.id ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Value */}
                    <td className="px-5 py-3 text-gray-900 font-semibold">
                      ${(gc.initialValue / 100).toFixed(2)}
                    </td>

                    {/* Balance with progress */}
                    <td className="px-5 py-3">
                      <div>
                        <span
                          className="text-sm font-semibold"
                          style={{
                            color: gc.balance > 0 ? 'var(--accent)' : '#9CA3AF',
                          }}
                        >
                          ${(gc.balance / 100).toFixed(2)}
                        </span>
                        <div
                          className="mt-1 h-1 rounded-full overflow-hidden w-16"
                          style={{ background: 'var(--bg-elevated)' }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${100 - pctUsed}%`,
                              background: 'var(--accent)',
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Recipient */}
                    <td className="px-5 py-3 text-xs text-gray-500">
                      {gc.recipientEmail ?? '—'}
                    </td>

                    {/* Expires */}
                    <td className="px-5 py-3 text-xs text-gray-500">
                      <span
                        style={{ color: isExpired ? '#DC2626' : undefined }}
                      >
                        {new Date(gc.expiresAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3">
                      <span
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={{
                          background: isExpired
                            ? '#F1F5F9'
                            : gc.isActive
                              ? '#D1FAE5'
                              : '#FEE2E2',
                          color: isExpired
                            ? '#9CA3AF'
                            : gc.isActive
                              ? '#059669'
                              : '#DC2626',
                        }}
                      >
                        {isExpired
                          ? 'Expired'
                          : gc.isActive
                            ? 'Active'
                            : 'Inactive'}
                      </span>
                    </td>

                    {/* Toggle */}
                    <td className="px-5 py-3">
                      {!isExpired && (
                        <button
                          onClick={() => handleToggle(gc.id, gc.isActive)}
                          className="transition-colors"
                          title={gc.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {gc.isActive ? (
                            <ToggleRight
                              className="h-5 w-5"
                              style={{ color: '#059669' }}
                            />
                          ) : (
                            <ToggleLeft
                              className="h-5 w-5"
                              style={{ color: '#9CA3AF' }}
                            />
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
