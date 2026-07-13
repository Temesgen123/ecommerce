'use client';
import { useActionState } from 'react';
import { registerCustomer, type AuthFormState } from '@/app/actions/customer';
import GoogleSignInButton from '@/components/store/GoogleSignInButton';

export default function RegisterForm() {
  const [state, formAction, isPending] = useActionState<
    AuthFormState,
    FormData
  >(registerCustomer, {});
  const err = state.errors ?? {};

  return (
    <div className="space-y-4">
      <GoogleSignInButton label="Sign up with Google" />

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
        {state.message && state.message !== 'ok' && (
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
            Full Name
          </label>
          <input
            name="name"
            type="text"
            autoComplete="name"
            required
            className="input-theme w-full px-3 py-2.5 text-sm"
            placeholder="John Smith"
          />
          {err.name && (
            <p className="text-xs" style={{ color: 'var(--error-text)' }}>
              {err.name[0]}
            </p>
          )}
        </div>
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
          <div className="flex items-baseline justify-between">
            <label
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: 'var(--text-secondary)' }}
            >
              Password
            </label>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Min. 8 characters
            </span>
          </div>
          <input
            name="password"
            type="password"
            autoComplete="new-password"
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
          {isPending ? 'Creating account…' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}
