'use client';

import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  resetPassword,
  type ResetFormState,
} from '@/app/actions/password-reset';
import { ArrowLeft, KeyRound } from 'lucide-react';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [state, formAction, isPending] = useActionState<
    ResetFormState,
    FormData
  >(resetPassword, {});
  const err = state.errors ?? {};

  // Missing token
  if (!token) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center sm:px-6">
        <p className="text-sm" style={{ color: 'var(--error-text)' }}>
          Invalid reset link.
        </p>
        <Link
          href="/account/forgot-password"
          className="mt-4 inline-block text-sm font-medium underline"
          style={{ color: 'var(--navy-700)' }}
        >
          Request a new one
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="text-center mb-8">
        <div
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
          style={{ background: 'var(--bg-elevated)' }}
        >
          <KeyRound className="h-6 w-6" style={{ color: 'var(--navy-700)' }} />
        </div>
        <h1
          className="text-2xl font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          Choose a new password
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          Must be at least 8 characters.
        </p>
      </div>

      <div
        className="rounded-2xl border p-6"
        style={{
          background: 'var(--bg-surface)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        {state.success ? (
          <div className="space-y-4 text-center">
            <div
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: '#dcfce7' }}
            >
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p
              className="font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              Password updated!
            </p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              You can now sign in with your new password.
            </p>
            <Link
              href="/account/login"
              className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
              style={{ color: 'var(--navy-700)' }}
            >
              <ArrowLeft className="h-4 w-4" /> Go to sign in
            </Link>
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            {/* Pass token as hidden field */}
            <input type="hidden" name="token" value={token} />

            {state.message && (
              <p
                className="rounded-lg px-3 py-2 text-sm"
                style={{
                  background: 'var(--error-bg)',
                  color: 'var(--error-text)',
                }}
              >
                {state.message}{' '}
                {state.message.includes('expired') && (
                  <Link
                    href="/account/forgot-password"
                    className="underline font-medium"
                  >
                    Request a new link
                  </Link>
                )}
              </p>
            )}

            <div className="space-y-1.5">
              <label
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: 'var(--text-secondary)' }}
              >
                New password
              </label>
              <input
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                className="input-theme w-full px-3 py-2.5 text-sm"
                placeholder="Min. 8 characters"
              />
              {err.password && (
                <p className="text-xs" style={{ color: 'var(--error-text)' }}>
                  {err.password[0]}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: 'var(--text-secondary)' }}
              >
                Confirm new password
              </label>
              <input
                name="confirm"
                type="password"
                autoComplete="new-password"
                required
                className="input-theme w-full px-3 py-2.5 text-sm"
              />
              {err.confirm && (
                <p className="text-xs" style={{ color: 'var(--error-text)' }}>
                  {err.confirm[0]}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="btn-navy w-full rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50"
            >
              {isPending ? 'Updating…' : 'Update Password'}
            </button>

            <div className="text-center">
              <Link
                href="/account/login"
                className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
                style={{ color: 'var(--text-muted)' }}
              >
                <ArrowLeft className="h-4 w-4" /> Back to sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
