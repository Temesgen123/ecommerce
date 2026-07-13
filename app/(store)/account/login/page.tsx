import type { Metadata } from 'next';
import Link from 'next/link';
import { getCustomer } from '@/lib/customer-auth';
import { redirect } from 'next/navigation';
import LoginForm from '@/components/store/LoginForm';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Sign In' };
export default async function CustomerLoginPage() {
  const customer = await getCustomer();
  if (customer) redirect('/account');
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="text-center mb-8">
        <h1
          className="text-2xl font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          Sign In
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          New customer?{' '}
          <Link
            href="/account/register"
            className="font-semibold underline"
            style={{ color: 'var(--navy-700)' }}
          >
            Create an account
          </Link>
        </p>
      </div>
      <div
        className="rounded-2xl border p-6"
        style={{
          background: 'var(--bg-surface)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <LoginForm />
      </div>
    </div>
  );
}
