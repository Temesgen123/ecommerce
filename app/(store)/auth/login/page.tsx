import LoginForm from '@/components/store/LoginForm';
import Link from 'next/link';

export const metadata = { title: 'Sign In' };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div
        className="rounded-2xl border p-8 space-y-6"
        style={{
          background: 'var(--bg-surface)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <div className="space-y-1">
          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            Sign In
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Welcome back! Sign in to your account.
          </p>
        </div>
        <LoginForm />
        <p
          className="text-center text-sm"
          style={{ color: 'var(--text-muted)' }}
        >
          Don't have an account?{' '}
          <Link
            href="/auth/register"
            className="font-semibold hover:underline"
            style={{ color: 'var(--accent)' }}
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
