'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import {
  requestPasswordReset,
  type ResetFormState,
} from '@/app/actions/password-reset';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState<
    ResetFormState,
    FormData
  >(requestPasswordReset, {});
  const err = state.errors ?? {};

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="text-center mb-8">
        <div
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
          style={{ background: 'var(--bg-elevated)' }}
        >
          <Mail className="h-6 w-6" style={{ color: 'var(--navy-700)' }} />
        </div>
        <h1
          className="text-2xl font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          Forgot your password?
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          Enter your email and we'll send you a reset link.
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
              Check your inbox
            </p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              If an account exists for that email, we've sent a password reset
              link. It expires in 1 hour.
            </p>
            <Link
              href="/account/login"
              className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
              style={{ color: 'var(--navy-700)' }}
            >
              <ArrowLeft className="h-4 w-4" /> Back to sign in
            </Link>
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            <div className="space-y-1.5">
              <label
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: 'var(--text-secondary)' }}
              >
                Email address
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

            <button
              type="submit"
              disabled={isPending}
              className="btn-navy w-full rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50"
            >
              {isPending ? 'Sending…' : 'Send Reset Link'}
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
