'use client';
import { useActionState } from 'react';
import { loginCustomer, type AuthFormState } from '@/app/actions/customer';
export default function LoginForm() {
  const [state, formAction, isPending] = useActionState<AuthFormState, FormData>(loginCustomer, {});
  const err = state.errors ?? {};
  return (
    <form action={formAction} className="space-y-4">
      {state.message && <p className="rounded-lg px-3 py-2 text-sm" style={{ background: 'var(--error-bg)', color: 'var(--error-text)' }}>{state.message}</p>}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Email</label>
        <input name="email" type="email" autoComplete="email" required className="input-theme w-full px-3 py-2.5 text-sm" placeholder="you@example.com" />
        {err.email && <p className="text-xs" style={{ color: 'var(--error-text)' }}>{err.email[0]}</p>}
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Password</label>
        <input name="password" type="password" autoComplete="current-password" required className="input-theme w-full px-3 py-2.5 text-sm" />
        {err.password && <p className="text-xs" style={{ color: 'var(--error-text)' }}>{err.password[0]}</p>}
      </div>
      <button type="submit" disabled={isPending} className="btn-navy w-full rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50">
        {isPending ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  );
}
