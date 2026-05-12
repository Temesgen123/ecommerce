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
    <form action={formAction} className="flex items-center gap-3">
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      {state.success && (
        <p className="text-xs text-green-600">Status updated.</p>
      )}
      <select
        name="status"
        defaultValue={currentStatus}
        className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
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
        className="rounded-md bg-gray-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
      >
        {isPending ? 'Saving…' : 'Update Status'}
      </button>
    </form>
  );
}
