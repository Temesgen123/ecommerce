import RegisterForm from '@/components/store/RegisterForm';
import Link from 'next/link';

export const metadata = { title: 'Create Account' };

export default function RegisterPage() {
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
            Create Account
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Join us today and start shopping.
          </p>
        </div>
        <RegisterForm />
        <p
          className="text-center text-sm"
          style={{ color: 'var(--text-muted)' }}
        >
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="font-semibold hover:underline"
            style={{ color: 'var(--accent)' }}
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
