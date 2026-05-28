'use client';
import { useActionState } from 'react';
import { updateProfile, type AuthFormState } from '@/app/actions/customer';
interface Props { customer: { name?: string | null; email: string; phone?: string | null }; }
export default function ProfileForm({ customer }: Props) {
  const [state, formAction, isPending] = useActionState<AuthFormState, FormData>(updateProfile, {});
  const err = state.errors ?? {};
  return (
    <div className="rounded-xl border p-5" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
      <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Profile Details</h2>
      {state.message === 'ok' && <p className="mb-4 rounded-lg px-3 py-2 text-sm" style={{ background: 'var(--success-bg)', color: 'var(--success-text)' }}>✓ Profile updated.</p>}
      <form action={formAction} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
            <input name="name" type="text" defaultValue={customer.name ?? ''} className="input-theme w-full px-3 py-2 text-sm" />
            {err.name && <p className="text-xs" style={{ color: 'var(--error-text)' }}>{err.name[0]}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Phone (optional)</label>
            <input name="phone" type="tel" defaultValue={customer.phone ?? ''} className="input-theme w-full px-3 py-2 text-sm" placeholder="+1 555 000 0000" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Email</label>
          <input type="email" value={customer.email} disabled className="w-full rounded-lg px-3 py-2 text-sm" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }} />
        </div>
        <button type="submit" disabled={isPending} className="btn-navy rounded-lg px-5 py-2 text-sm font-semibold disabled:opacity-50">{isPending ? 'Saving…' : 'Save Changes'}</button>
      </form>
    </div>
  );
}
