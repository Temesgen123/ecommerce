'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';

// ── Inner form — uses useSearchParams so needs Suspense ───────
function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();

  const getInitialError = () => {
    const error = params.get('error');
    if (!error) return null;
    if (error === 'TooManyRequests') {
      return 'Too many login attempts. Please wait 15 minutes and try again.';
    }
    return 'Invalid email or password.';
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(getInitialError);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      if (result.error === 'TooManyRequests') {
        setError(
          'Too many login attempts. Please wait 15 minutes and try again.',
        );
      } else {
        setError('Invalid email or password.');
      }
      return;
    }

    router.push('/admin');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
      {error && (
        <div
          className="rounded-lg px-4 py-3 text-sm font-medium"
          style={{ background: 'var(--error-bg)', color: 'var(--error-text)' }}
        >
          {error}
        </div>
      )}
      <div className="space-y-1.5">
        <label
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: 'var(--text-secondary)' }}
        >
          Email
        </label>
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@example.com"
          className="input-theme w-full px-4 py-2.5 text-sm"
        />
      </div>
      <div className="space-y-1.5">
        <label
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: 'var(--text-secondary)' }}
        >
          Password
        </label>
        <input
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-theme w-full px-4 py-2.5 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="btn-navy w-full py-2.5 text-sm disabled:opacity-50 mt-2"
      >
        {loading ? 'Signing in…' : 'Sign in →'}
      </button>
    </form>
  );
}

// ── Page shell — wraps form in Suspense ───────────────────────
export default function LoginPage() {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Left panel — navy brand */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12"
        style={{ background: 'var(--navy-900)' }}
      >
        <p className="text-4xl font-extrabold text-white">
          Next<span style={{ color: 'var(--accent)' }}>Shop</span>
        </p>
        <p className="mt-3 text-base" style={{ color: 'var(--navy-100)' }}>
          Admin Panel — Manage your store
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <p
            className="mb-8 text-center text-2xl font-extrabold lg:hidden"
            style={{ color: 'var(--navy-900)' }}
          >
            Next<span style={{ color: 'var(--accent)' }}>Shop</span>
          </p>

          <h2
            className="text-2xl font-bold mb-1"
            style={{ color: 'var(--text-primary)' }}
          >
            Sign in
          </h2>
          <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
            Enter your admin credentials to continue.
          </p>

          <Suspense
            fallback={
              <div className="space-y-4">
                <div
                  className="h-10 rounded-lg animate-pulse"
                  style={{ background: 'var(--bg-elevated)' }}
                />
                <div
                  className="h-10 rounded-lg animate-pulse"
                  style={{ background: 'var(--bg-elevated)' }}
                />
                <div
                  className="h-10 rounded-lg animate-pulse"
                  style={{ background: 'var(--bg-elevated)' }}
                />
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
