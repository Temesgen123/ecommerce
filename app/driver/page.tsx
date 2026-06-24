import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDriverOrders } from '@/app/actions/driver';
import DriverOrderCard from '@/components/driver/DriverOrderCard';
import SignOutButton from '@/components/driver/SignOutButton';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DriverDashboardPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (!session?.user || (role !== 'DRIVER' && role !== 'ADMIN')) {
    redirect('/driver/login');
  }

  const { active, completed, isAdmin } = await getDriverOrders();

  return (
    <div className="mx-auto w-full max-w-[75%] px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            {isAdmin ? 'All Deliveries' : 'My Deliveries'}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {isAdmin
              ? `Signed in as ${session.user.name ?? session.user.email} (admin oversight view)`
              : `Signed in as ${session.user.name ?? session.user.email}`}
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
            {isAdmin
              ? 'No active deliveries assigned to any driver right now.'
              : 'No active deliveries assigned right now.'}
          </p>
        ) : (
          <div className="space-y-3">
            {active.map((order: any) => (
              <DriverOrderCard
                key={order.id}
                order={order}
                showDriver={isAdmin}
              />
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
            {completed.map((order: any) => (
              <DriverOrderCard
                key={order.id}
                order={order}
                readOnly
                showDriver={isAdmin}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
