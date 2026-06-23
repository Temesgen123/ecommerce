import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDriverOrders } from '@/app/actions/driver';
import DriverOrderCard from '@/components/driver/DriverOrderCard';
import SignOutButton from '@/components/driver/SignOutButton';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DriverDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any).role !== 'DRIVER') {
    redirect('/driver/login');
  }

  const { active, completed } = await getDriverOrders();

  return (
    <div className="mx-auto max-w-[75%] w-full px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            My Deliveries
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Signed in as {session.user.name ?? session.user.email}
          </p>
        </div>
        <SignOutButton />
      </div>

      <section className="mb-10">
        <h2
          className="text-sm font-bold uppercase tracking-wide mb-3"
          style={{ color: 'var(--text-muted)' }}
        >
          Active ({active.length})
        </h2>
        {active.length === 0 ? (
          <p
            className="text-sm py-8 text-center"
            style={{ color: 'var(--text-muted)' }}
          >
            No active deliveries assigned right now.
          </p>
        ) : (
          <div className="space-y-3">
            {active.map((order) => (
              <DriverOrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2
          className="text-sm font-bold uppercase tracking-wide mb-3"
          style={{ color: 'var(--text-muted)' }}
        >
          Recent History
        </h2>
        {completed.length === 0 ? (
          <p
            className="text-sm py-8 text-center"
            style={{ color: 'var(--text-muted)' }}
          >
            No completed deliveries yet.
          </p>
        ) : (
          <div className="space-y-3 opacity-70">
            {completed.map((order) => (
              <DriverOrderCard key={order.id} order={order} readOnly />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
