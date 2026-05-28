import { getCustomer } from '@/lib/customer-auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'My Orders' };
function fmt(c: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(c / 100); }
const S: Record<string, { bg: string; color: string }> = {
  PAID: { bg: '#DBEAFE', color: '#1D4ED8' }, DELIVERED: { bg: '#DCFCE7', color: '#15803D' },
  SHIPPED: { bg: '#E0E7FF', color: '#4338CA' }, PENDING: { bg: '#FEF9C3', color: '#854D0E' },
  CANCELLED: { bg: '#FEE2E2', color: '#DC2626' }, PROCESSING: { bg: '#EDE9FE', color: '#6D28D9' }, REFUNDED: { bg: '#F1F5F9', color: '#475569' },
};
export default async function AccountOrdersPage() {
  const customer = await getCustomer();
  if (!customer) return null;
  const orders = await prisma.order.findMany({ where: { customerEmail: customer.email }, orderBy: { createdAt: 'desc' }, include: { items: { select: { productName: true, quantity: true, total: true } } } });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>My Orders</h1>
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 rounded-xl border" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
          <ShoppingBag className="h-12 w-12 opacity-20" />
          <p className="text-sm">No orders yet.</p>
          <Link href="/products" className="btn-navy rounded-lg px-5 py-2 text-sm font-semibold">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const s = S[o.status] ?? S.PENDING;
            return (
              <div key={o.id} className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}>
                  <div className="flex gap-6">
                    <div><p className="text-xs" style={{ color: 'var(--text-muted)' }}>Order</p><p className="text-sm font-bold font-mono" style={{ color: 'var(--text-primary)' }}>#{o.id.slice(0, 8).toUpperCase()}</p></div>
                    <div><p className="text-xs" style={{ color: 'var(--text-muted)' }}>Date</p><p className="text-sm" style={{ color: 'var(--text-primary)' }}>{o.createdAt.toISOString().slice(0, 10)}</p></div>
                    <div><p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total</p><p className="text-sm font-bold" style={{ color: 'var(--accent)' }}>{fmt(o.total)}</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: s.bg, color: s.color }}>{o.status}</span>
                    <Link href={`/track-order?ref=${o.id.slice(0, 8).toUpperCase()}&email=${customer.email}`} className="text-xs font-semibold underline" style={{ color: 'var(--navy-700)' }}>Track →</Link>
                  </div>
                </div>
                <div className="px-5 py-3 space-y-1.5">
                  {o.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span style={{ color: 'var(--text-secondary)' }}>{item.productName} <span className="text-xs" style={{ color: 'var(--text-muted)' }}>× {item.quantity}</span></span>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{fmt(item.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}