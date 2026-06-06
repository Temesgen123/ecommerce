'use client';

import { useState } from 'react';
import { subscribeToNewsletter } from '@/app/actions/newsletter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
    <div className="w-full max-w-md">
      <h3 className="text-lg font-semibold mb-1">Stay in the loop</h3>
      <p className="text-sm text-muted-foreground mb-3">
        Get notified about new products and exclusive deals.
      </p>

      {status === 'success' ? (
        <p className="text-sm text-green-500">{message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={status === 'loading'}
            className="flex-1"
          />
          <Button type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
          </Button>
        </form>
      )}

      {status === 'error' && (
        <p className="text-sm text-red-500 mt-2">{message}</p>
      )}
    </div>
  );
}
