'use client';

import { useActionState } from 'react';
import { updateOrderStatus } from '@/app/actions/orders';
import {
  ORDER_STATUSES,
  STATUS_LABEL,
  type OrderStatus,
} from '@/lib/order-utils';
import type { OrderActionState } from '@/app/actions/orders';

interface OrderStatusUpdaterProps {
  orderId: string;
  currentStatus: string;
}

export default function OrderStatusUpdater({
  orderId,
  currentStatus,
}: OrderStatusUpdaterProps) {
  const action = updateOrderStatus.bind(null, orderId);
  const [state, formAction, isPending] = useActionState<
    OrderActionState,
    FormData
  >(action, {});

  return (
    <form action={formAction} className="space-y-3">
      {state.error && (
        <p
          className="text-xs font-medium rounded-lg px-3 py-2"
          style={{ background: 'var(--error-bg)', color: 'var(--error-text)' }}
        >
          {state.error}
        </p>
      )}
      {state.success && (
        <p
          className="text-xs font-medium rounded-lg px-3 py-2"
          style={{
            background: 'var(--success-bg)',
            color: 'var(--success-text)',
          }}
        >
          ✓ Status updated successfully.
        </p>
      )}

      <div className="flex items-center gap-3">
        <select
          name="status"
          defaultValue={currentStatus}
          className="input-theme rounded-lg px-3 py-2 text-sm flex-1"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s as OrderStatus]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={isPending}
          className="btn-navy rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50 flex-shrink-0"
        >
          {isPending ? 'Saving…' : 'Update'}
        </button>
      </div>

      {/* Optional note */}
      <div className="space-y-1">
        <label className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Note{' '}
          <span style={{ color: 'var(--text-muted)' }}>
            (optional — e.g. tracking number)
          </span>
        </label>
        <input
          type="text"
          name="note"
          placeholder="e.g. Shipped via FedEx — tracking #123456"
          className="input-theme w-full px-3 py-2 text-sm"
        />
      </div>
    </form>
  );
}
