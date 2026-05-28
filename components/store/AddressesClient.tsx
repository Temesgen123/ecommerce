'use client';
import { useState, useTransition, useActionState } from 'react';
import { Plus, X, Trash2, Star } from 'lucide-react';
import { addAddress, deleteAddress, setDefaultAddress, type AuthFormState } from '@/app/actions/customer';

interface Address { id: string; name: string; line1: string; line2: string | null; city: string; state: string; postalCode: string; country: string; isDefault: boolean; }

export default function AddressesClient({ addresses }: { addresses: Address[] }) {
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [state, formAction, isSubmitting] = useActionState<AuthFormState, FormData>(addAddress, {});
  if (state.message === 'ok' && showForm) setShowForm(false);
  const err = state.errors ?? {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Saved Addresses</h1>
        <button onClick={() => setShowForm(v => !v)} className="btn-navy inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm">
          {showForm ? <><X className="h-4 w-4" />Cancel</> : <><Plus className="h-4 w-4" />Add Address</>}
        </button>
      </div>
      {showForm && (
        <div className="rounded-xl border p-5" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>New Address</h2>
          <form action={formAction} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[['name','Full Name','John Smith'],['line1','Address Line 1','123 Main St'],['city','City',''],['state','State / Province',''],['postalCode','Postal Code',''],['country','Country','US']].map(([n,l,p]) => (
                <div key={n} className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>{l}</label>
                  <input name={n} required className="input-theme w-full px-3 py-2 text-sm" placeholder={p} defaultValue={n==='country'?'US':''} />
                  {err[n] && <p className="text-xs" style={{ color: 'var(--error-text)' }}>{err[n]![0]}</p>}
                </div>
              ))}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Line 2 <span style={{color:'var(--text-muted)'}}>optional</span></label>
                <input name="line2" className="input-theme w-full px-3 py-2 text-sm" placeholder="Apt 4B" />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isDefault" className="h-4 w-4 rounded" />
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Set as default address</span>
            </label>
            <button type="submit" disabled={isSubmitting} className="btn-navy rounded-lg px-5 py-2 text-sm font-semibold disabled:opacity-50">
              {isSubmitting ? 'Saving…' : 'Save Address'}
            </button>
          </form>
        </div>
      )}
      {addresses.length === 0 && !showForm ? (
        <p className="text-sm text-center py-12" style={{ color: 'var(--text-muted)' }}>No saved addresses yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <div key={addr.id} className="rounded-xl border p-4 space-y-2"
              style={{ background: 'var(--bg-surface)', borderColor: addr.isDefault ? 'var(--navy-500)' : 'var(--border-subtle)', borderWidth: addr.isDefault ? '2px' : '1px' }}>
              {addr.isDefault && <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--navy-700)' }}><Star className="h-3 w-3" />Default</span>}
              <address className="not-italic text-sm space-y-0.5" style={{ color: 'var(--text-secondary)' }}>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{addr.name}</p>
                <p>{addr.line1}</p>{addr.line2 && <p>{addr.line2}</p>}
                <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                <p>{addr.country}</p>
              </address>
              <div className="flex gap-2 pt-1">
                {!addr.isDefault && (
                  <button onClick={() => startTransition(() => setDefaultAddress(addr.id))} disabled={isPending}
                    className="text-xs font-medium underline disabled:opacity-50" style={{ color: 'var(--navy-700)' }}>Set default</button>
                )}
                <button onClick={() => { if(confirm('Delete this address?')) startTransition(() => deleteAddress(addr.id)); }}
                  disabled={isPending} className="ml-auto text-xs disabled:opacity-50" style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--error-text)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-muted)')}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
