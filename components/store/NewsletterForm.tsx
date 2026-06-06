'use client';

import { useState } from 'react';
import { subscribeToNewsletter } from '@/app/actions/newsletter';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');

    const result = await subscribeToNewsletter(email);

    if (result.success) {
      setStatus('success');
      setMessage("You're subscribed! Check your inbox for a welcome email.");
      setEmail('');
    } else {
      setStatus('error');
      setMessage(result.error || 'Something went wrong.');
    }
  }

  return (
    <div className="w-full">
      {/* Title */}
      <h3 className="text-sm font-bold mb-1" style={{ color: '#fff' }}>
        Stay in the loop
      </h3>

      {/* Subtitle */}
      <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>
        Get notified about new products and exclusive deals.
      </p>

      {status === 'success' ? (
        <p className="text-sm font-medium" style={{ color: '#4ade80' }}>
          {message}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={status === 'loading'}
            className="flex-1 rounded-lg px-3 py-2 text-xs outline-none"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
            }}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="rounded-lg px-3 py-2 text-xs font-bold transition-opacity hover:opacity-90 whitespace-nowrap"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            {status === 'loading' ? '...' : 'Subscribe'}
          </button>
        </form>
      )}

      {status === 'error' && (
        <p className="text-xs mt-2" style={{ color: '#f87171' }}>
          {message}
        </p>
      )}
    </div>
  );
}
