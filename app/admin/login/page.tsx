'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(
    params.get('error') ? 'Invalid email or password.' : null,
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
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
      setError('Invalid email or password.');
      return;
    }
    router.push('/admin');
    router.refresh();
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Background glow */}
      <div
        className="pointer-events-none fixed left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full opacity-10 blur-3xl"
        style={{ background: 'var(--accent)' }}
      />

      <div
        className="relative w-full max-w-sm rounded-2xl p-8"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-base)',
          boxShadow: '0 24px 64px rgba(2,11,24,0.6)',
        }}
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <p
            className="text-2xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            My<span style={{ color: 'var(--accent)' }}>Store</span>
          </p>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Sign in to your admin panel
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div
              className="rounded-lg px-4 py-3 text-sm"
              style={{
                background: 'var(--error-bg)',
                color: 'var(--error-text)',
              }}
            >
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label
              className="text-xs font-medium"
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
              className="text-xs font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-theme w-full px-4 py-2.5 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5 text-sm font-semibold mt-2 disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
