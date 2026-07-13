'use client';
import { useActionState } from 'react';
import { loginCustomer, type AuthFormState } from '@/app/actions/customer';
import GoogleSignInButton from '@/components/store/GoogleSignInButton';

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState<
    AuthFormState,
    FormData
  >(loginCustomer, {});
  const err = state.errors ?? {};

  // Show google_failed error from callback redirect
  const searchError =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('error')
      : null;

  return (
    <div className="space-y-4">
      {searchError === 'google_failed' && (
        <p
          className="rounded-lg px-3 py-2 text-sm"
          style={{ background: 'var(--error-bg)', color: 'var(--error-text)' }}
        >
          Google sign-in failed. Please try again.
        </p>
      )}

      <GoogleSignInButton label="Sign in with Google" />

      <div className="flex items-center gap-3">
        <div
          className="flex-1 border-t"
          style={{ borderColor: 'var(--border-subtle)' }}
        />
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          or
        </span>
        <div
          className="flex-1 border-t"
          style={{ borderColor: 'var(--border-subtle)' }}
        />
      </div>

      <form action={formAction} className="space-y-4">
        {state.message && (
          <p
            className="rounded-lg px-3 py-2 text-sm"
            style={{
              background: 'var(--error-bg)',
              color: 'var(--error-text)',
            }}
          >
            {state.message}
          </p>
        )}
        <div className="space-y-1.5">
          <label
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: 'var(--text-secondary)' }}
          >
            Email
          </label>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="input-theme w-full px-3 py-2.5 text-sm"
            placeholder="you@example.com"
          />
          {err.email && (
            <p className="text-xs" style={{ color: 'var(--error-text)' }}>
              {err.email[0]}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <label
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: 'var(--text-secondary)' }}
          >
            Password
          </label>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="input-theme w-full px-3 py-2.5 text-sm"
          />
          {err.password && (
            <p className="text-xs" style={{ color: 'var(--error-text)' }}>
              {err.password[0]}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="btn-navy w-full rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50"
        >
          {isPending ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
