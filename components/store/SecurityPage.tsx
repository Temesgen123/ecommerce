'use client';
import { useActionState } from 'react';
import { changePassword, type AuthFormState } from '@/app/actions/customer';
export default function SecurityPage() {
  const [state, formAction, isPending] = useActionState<AuthFormState, FormData>(changePassword, {});
  const err = state.errors ?? {};
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Security</h1>
      <div className="rounded-xl border p-6" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
        <h2 className="text-sm font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>Change Password</h2>
        {state.message === 'ok' && (
          <p className="mb-4 rounded-lg px-3 py-2 text-sm" style={{ background: 'var(--success-bg)', color: 'var(--success-text)' }}>✓ Password changed successfully.</p>
        )}
        <form action={formAction} className="space-y-4 max-w-sm">
          {[
            { name: 'current', label: 'Current Password', hint: '' },
            { name: 'password', label: 'New Password', hint: 'Minimum 8 characters' },
            { name: 'confirm', label: 'Confirm New Password', hint: '' },
          ].map(({ name, label, hint }) => (
            <div key={name} className="space-y-1.5">
              <div className="flex items-baseline justify-between">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>{label}</label>
                {hint && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{hint}</span>}
              </div>
              <input name={name} type="password" required className="input-theme w-full px-3 py-2.5 text-sm" />
              {err[name] && <p className="text-xs" style={{ color: 'var(--error-text)' }}>{err[name]![0]}</p>}
            </div>
          ))}
          <button type="submit" disabled={isPending} className="btn-navy rounded-lg px-5 py-2.5 text-sm font-semibold disabled:opacity-50">
            {isPending ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
