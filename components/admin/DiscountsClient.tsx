'use client';

import { useState, useTransition, useActionState } from 'react';
import { Plus, X, Trash2, ToggleLeft, ToggleRight, Tag } from 'lucide-react';
import {
  createDiscountCode,
  toggleDiscountCode,
  deleteDiscountCode,
  type DiscountFormState,
} from '@/app/actions/discounts';
interface DiscountCode {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  minOrderValue: number | null;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface DiscountsClientProps {
  codes: DiscountCode[];
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

function formatDate(date: Date) {
  return new Date(date).toISOString().slice(0, 10);
}

export default function DiscountsClient({ codes }: DiscountsClientProps) {
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [state, formAction, isSubmitting] = useActionState<
    DiscountFormState,
    FormData
  >(createDiscountCode, {});

  // Close form on success
  if (state.message === 'ok' && showForm) setShowForm(false);

  const err = state.errors ?? {};

  function handleToggle(id: string, current: boolean) {
    startTransition(async () => {
      await toggleDiscountCode(id, !current);
    });
  }

  function handleDelete(id: string, code: string) {
    if (!confirm(`Delete code "${code}"?`)) return;
    startTransition(async () => {
      await deleteDiscountCode(id);
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1
          className="text-2xl font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Discount Codes
        </h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="btn-navy inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm"
        >
          {showForm ? (
            <>
              <X className="h-4 w-4" /> Cancel
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" /> New Code
            </>
          )}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div
          className="rounded-xl border bg-white p-6"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <h2
            className="text-sm font-semibold mb-5"
            style={{ color: 'var(--text-primary)' }}
          >
            Create Discount Code
          </h2>
          <form action={formAction} className="space-y-4">
            {state.message && state.message !== 'ok' && (
              <p
                className="text-sm rounded-lg px-3 py-2"
                style={{
                  background: 'var(--error-bg)',
                  color: 'var(--error-text)',
                }}
              >
                {state.message}
              </p>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Code */}
              <div className="space-y-1">
                <label
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Code
                </label>
                <input
                  name="code"
                  placeholder="SUMMER20"
                  required
                  className="input-theme w-full px-3 py-2 text-sm font-mono uppercase"
                  style={{ textTransform: 'uppercase' }}
                />
                {err.code && (
                  <p className="text-xs" style={{ color: 'var(--error-text)' }}>
                    {err.code[0]}
                  </p>
                )}
              </div>

              {/* Type */}
              <div className="space-y-1">
                <label
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Type
                </label>
                <select
                  name="type"
                  className="input-theme w-full px-3 py-2 text-sm"
                >
                  <option value="PERCENTAGE">Percentage off (%)</option>
                  <option value="FIXED">Fixed amount off ($)</option>
                </select>
              </div>

              {/* Value */}
              <div className="space-y-1">
                <label
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Value
                </label>
                <input
                  name="value"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="20"
                  required
                  className="input-theme w-full px-3 py-2 text-sm"
                />
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  For percentage: enter 20 for 20% off. For fixed: enter 10 for
                  $10 off.
                </p>
                {err.value && (
                  <p className="text-xs" style={{ color: 'var(--error-text)' }}>
                    {err.value[0]}
                  </p>
                )}
              </div>

              {/* Min order */}
              <div className="space-y-1">
                <label
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Minimum Order ($){' '}
                  <span style={{ color: 'var(--text-muted)' }}>optional</span>
                </label>
                <input
                  name="minOrderValue"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="50.00"
                  className="input-theme w-full px-3 py-2 text-sm"
                />
              </div>

              {/* Max uses */}
              <div className="space-y-1">
                <label
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Max Uses{' '}
                  <span style={{ color: 'var(--text-muted)' }}>optional</span>
                </label>
                <input
                  name="maxUses"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Unlimited"
                  className="input-theme w-full px-3 py-2 text-sm"
                />
              </div>

              {/* Expiry */}
              <div className="space-y-1">
                <label
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Expires At{' '}
                  <span style={{ color: 'var(--text-muted)' }}>optional</span>
                </label>
                <input
                  name="expiresAt"
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  className="input-theme w-full px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Active toggle */}
            <label className="flex items-center gap-3 cursor-pointer pt-1">
              <input
                type="checkbox"
                name="active"
                defaultChecked
                className="h-4 w-4 rounded"
              />
              <span
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Active — code can be used immediately
              </span>
            </label>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-navy rounded-lg px-5 py-2 text-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Creating…' : 'Create Code'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Codes table */}
      <div
        className="rounded-xl border bg-white overflow-hidden"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        {codes.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center gap-3 py-20"
            style={{ color: 'var(--text-muted)' }}
          >
            <Tag className="h-10 w-10 opacity-30" />
            <p className="text-sm">No discount codes yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr
                className="text-left text-xs font-semibold uppercase tracking-wide"
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)',
                }}
              >
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Discount</th>
                <th className="px-5 py-3">Min Order</th>
                <th className="px-5 py-3">Uses</th>
                <th className="px-5 py-3">Expires</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody
              className="divide-y"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              {codes.map((dc) => {
                const isExpired = dc.expiresAt
                  ? dc.expiresAt < new Date()
                  : false;
                const isExhausted =
                  dc.maxUses !== null && dc.usedCount >= dc.maxUses;

                return (
                  <tr
                    key={dc.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Code */}
                    <td className="px-5 py-3">
                      <span
                        className="font-mono font-bold text-sm px-2 py-1 rounded"
                        style={{
                          background: 'var(--navy-50)',
                          color: 'var(--navy-900)',
                        }}
                      >
                        {dc.code}
                      </span>
                    </td>

                    {/* Discount value */}
                    <td
                      className="px-5 py-3 font-semibold"
                      style={{ color: 'var(--accent)' }}
                    >
                      {dc.type === 'PERCENTAGE'
                        ? `${dc.value}% off`
                        : `${formatPrice(dc.value)} off`}
                    </td>

                    {/* Min order */}
                    <td
                      className="px-5 py-3"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {dc.minOrderValue ? (
                        formatPrice(dc.minOrderValue)
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>

                    {/* Uses */}
                    <td
                      className="px-5 py-3"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {dc.usedCount}
                      {dc.maxUses !== null && (
                        <span style={{ color: 'var(--text-muted)' }}>
                          {' '}
                          / {dc.maxUses}
                        </span>
                      )}
                    </td>

                    {/* Expiry */}
                    <td
                      className="px-5 py-3 text-xs"
                      style={{
                        color: isExpired
                          ? 'var(--error-text)'
                          : 'var(--text-secondary)',
                      }}
                    >
                      {dc.expiresAt ? (
                        formatDate(dc.expiresAt)
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>
                          Never
                        </span>
                      )}
                    </td>

                    {/* Status badge */}
                    <td className="px-5 py-3">
                      <span
                        className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        style={
                          !dc.active || isExpired || isExhausted
                            ? {
                                background: 'var(--bg-elevated)',
                                color: 'var(--text-muted)',
                              }
                            : {
                                background: 'var(--success-bg)',
                                color: 'var(--success-text)',
                              }
                        }
                      >
                        {!dc.active
                          ? 'Inactive'
                          : isExpired
                            ? 'Expired'
                            : isExhausted
                              ? 'Exhausted'
                              : 'Active'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggle(dc.id, dc.active)}
                          disabled={isPending}
                          className="rounded-lg p-1.5 transition-colors hover:bg-gray-100"
                          style={{
                            color: dc.active
                              ? 'var(--success-text)'
                              : 'var(--text-muted)',
                          }}
                          title={dc.active ? 'Deactivate' : 'Activate'}
                        >
                          {dc.active ? (
                            <ToggleRight className="h-5 w-5" />
                          ) : (
                            <ToggleLeft className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(dc.id, dc.code)}
                          disabled={isPending}
                          className="rounded-lg p-1.5 transition-colors hover:bg-red-50"
                          style={{ color: 'var(--text-muted)' }}
                          onMouseEnter={(e) =>
                            ((e.currentTarget as HTMLElement).style.color =
                              'var(--error-text)')
                          }
                          onMouseLeave={(e) =>
                            ((e.currentTarget as HTMLElement).style.color =
                              'var(--text-muted)')
                          }
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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
