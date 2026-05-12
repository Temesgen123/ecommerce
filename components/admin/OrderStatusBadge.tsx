import {
  STATUS_LABEL,
  STATUS_STYLE,
  type OrderStatus,
} from '@/lib/order-utils';

export default function OrderStatusBadge({ status }: { status: string }) {
  const style =
    STATUS_STYLE[status as OrderStatus] ?? 'bg-gray-100 text-gray-600';
  const label = STATUS_LABEL[status as OrderStatus] ?? status;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {label}
    </span>
  );
}
