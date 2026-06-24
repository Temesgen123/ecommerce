'use client';

import { useState, useTransition } from 'react';
import { updateDeliveryStatus } from '@/app/actions/driver';
import { MapPin, User } from 'lucide-react';

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
}

interface Order {
  id: string;
  status: string;
  customerName: string | null;
  customerEmail: string;
  shippingAddress: any;
  total: number;
  items: OrderItem[];
  driver?: { name: string | null; email: string } | null;
}

interface Props {
  order: Order;
  readOnly?: boolean;
  showDriver?: boolean; // true in admin oversight view
}

const STATUS_LABELS: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  SHIPPED: { label: 'Shipped', color: 'var(--navy-700)', bg: 'var(--navy-50)' },
  OUT_FOR_DELIVERY: {
    label: 'Out for Delivery',
    color: '#92400e',
    bg: '#fef3c7',
  },
  DELIVERED: { label: 'Delivered', color: '#166534', bg: '#dcfce7' },
  RETURNED: { label: 'Returned', color: '#991b1b', bg: '#fee2e2' },
};

const NEXT_ACTIONS: Record<
  string,
  {
    status: 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'RETURNED';
    label: string;
    bg: string;
    color: string;
  }[]
> = {
  SHIPPED: [
    {
      status: 'OUT_FOR_DELIVERY',
      label: 'Mark Out for Delivery',
      bg: '#fef3c7',
      color: '#92400e',
    },
    {
      status: 'RETURNED',
      label: 'Mark Returned',
      bg: '#fee2e2',
      color: '#991b1b',
    },
  ],
  OUT_FOR_DELIVERY: [
    {
      status: 'DELIVERED',
      label: 'Mark Delivered',
      bg: '#dcfce7',
      color: '#166534',
    },
    {
      status: 'RETURNED',
      label: 'Mark Returned',
      bg: '#fee2e2',
      color: '#991b1b',
    },
  ],
};

export default function DriverOrderCard({
  order,
  readOnly = false,
  showDriver = false,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [localStatus, setLocalStatus] = useState(order.status);
  const [error, setError] = useState<string | null>(null);

  function handleUpdate(
    newStatus: 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'RETURNED',
  ) {
    setError(null);
    startTransition(async () => {
      const result = await updateDeliveryStatus(order.id, newStatus);
      if (result.success) {
        setLocalStatus(newStatus);
      } else {
        setError(result.error ?? 'Failed to update status.');
      }
    });
  }

  const statusInfo = STATUS_LABELS[localStatus] ?? {
    label: localStatus,
    color: '#666',
    bg: '#f3f4f6',
  };
  const availableActions = NEXT_ACTIONS[localStatus] ?? [];
  const address = order.shippingAddress as {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    postal_code?: string;
    country?: string;
  } | null;

  return (
    <div
      className="flex justify-between rounded-lg border p-4  w-full"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      {/* Order number + status */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-wide mb-0.5"
            style={{ color: 'var(--text-muted)' }}
          >
            Order ID
          </p>
          <p
            className="font-mono text-sm font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            #{order.id.slice(0, 8).toUpperCase()}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Assigned driver — admin oversight view only */}
      {showDriver && order.driver && (
        <div
          className="mb-2 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs"
          style={{ background: 'var(--navy-50)', color: 'var(--navy-700)' }}
        >
          <User className="h-3 w-3" />
          Assigned to{' '}
          <span className="font-semibold">
            {order.driver.name ?? order.driver.email}
          </span>
        </div>
      )}

      {/* Customer */}
      <div className="mb-2">
        <p
          className="text-xs font-semibold uppercase tracking-wide mb-0.5"
          style={{ color: 'var(--text-muted)' }}
        >
          Customer
        </p>
        <p
          className="text-sm font-medium"
          style={{ color: 'var(--text-primary)' }}
        >
          {order.customerName ?? '—'}
        </p>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {order.customerEmail}
        </p>
      </div>

      {/* Shipping address */}
      <div className="mb-4">
        <p
          className="text-xs font-semibold uppercase tracking-wide mb-0.5 flex items-center gap-1"
          style={{ color: 'var(--text-muted)' }}
        >
          <MapPin className="h-3 w-3" />
          Shipping Address
        </p>
        {address ? (
          <address
            className="not-italic text-sm"
            style={{ color: 'var(--text-secondary)' }}
          >
            {address.line1 && <span>{address.line1}</span>}
            {address.line2 && <span>, {address.line2}</span>}
            {(address.city || address.state) && (
              <span>
                {address.line1 ? ', ' : ''}
                {[
                  address.city,
                  address.state,
                  address.postalCode ?? address.postal_code,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </span>
            )}
            {address.country && <span>, {address.country}</span>}
          </address>
        ) : (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            No address provided.
          </p>
        )}
      </div>

      <div>
        <span
          className="rounded-full px-2.5 py-1 text-xs font-semibold flex-shrink-0"
          style={{ background: statusInfo.bg, color: statusInfo.color }}
        >
          {statusInfo.label}
        </span>
      </div>

      {error && (
        <p
          className="text-xs mb-2 rounded px-2 py-1.5"
          style={{ background: 'var(--error-bg)', color: 'var(--error-text)' }}
        >
          {error}
        </p>
      )}

      {!readOnly && availableActions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {availableActions.map((action) => (
            <button
              key={action.status}
              onClick={() => handleUpdate(action.status)}
              disabled={isPending}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
              style={{ background: action.bg, color: action.color }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
