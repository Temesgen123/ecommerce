'use client';

import { useState } from 'react';
import { sendContactEmail } from '@/app/actions/contact';
import { Send, CheckCircle } from 'lucide-react';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError('');

    const result = await sendContactEmail(form);

    if (result.success) {
      setStatus('success');
      setForm({ name: '', email: '', message: '' });
    } else {
      setStatus('error');
      setError(result.error || 'Something went wrong.');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
        <CheckCircle className="h-12 w-12" style={{ color: '#22c55e' }} />
        <h3
          className="text-lg font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          Message sent!
        </h3>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Thanks for reaching out. We'll get back to you as soon as possible.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-2 text-sm font-semibold hover:underline"
          style={{ color: 'var(--navy-600)' }}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name + Email row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="name"
            className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
            style={{ color: 'var(--text-muted)' }}
          >
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="John Doe"
            value={form.name}
            onChange={handleChange}
            disabled={status === 'loading'}
            className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-base)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
            style={{ color: 'var(--text-muted)' }}
          >
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="john@example.com"
            value={form.email}
            onChange={handleChange}
            disabled={status === 'loading'}
            className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-base)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="message"
          className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
          style={{ color: 'var(--text-muted)' }}
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          placeholder="How can we help you?"
          value={form.message}
          onChange={handleChange}
          disabled={status === 'loading'}
          className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-colors resize-none"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-base)',
            color: 'var(--text-primary)',
          }}
        />
      </div>

      {/* Error */}
      {status === 'error' && (
        <p className="text-sm" style={{ color: 'var(--error-text)' }}>
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="btn-primary w-full rounded-lg py-3 text-sm font-bold inline-flex items-center justify-center gap-2 disabled:opacity-60"
      >
        <Send className="h-4 w-4" />
        {status === 'loading' ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
