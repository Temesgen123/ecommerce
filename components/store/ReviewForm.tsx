'use client';

import { useActionState, useState, useEffect } from 'react';
import { submitReview, type ReviewFormState } from '@/app/actions/reviews';

interface ReviewFormProps {
  productId: string;
  customerEmail?: string | null;
  customerName?: string | null;
  isVerifiedBuyer?: boolean;
}

export default function ReviewForm({
  productId,
  customerEmail,
  customerName,
  isVerifiedBuyer = false,
}: ReviewFormProps) {
  const action = submitReview.bind(null, productId);
  const [state, formAction, isPending] = useActionState<
    ReviewFormState,
    FormData
  >(action, {});
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);

  const err = state.errors ?? {};

  if (state.success) {
    return (
      <div
        className="rounded-xl p-5 text-center"
        style={{
          background: 'var(--success-bg)',
          border: '1px solid rgba(22,163,74,0.2)',
        }}
      >
        <p className="text-2xl mb-2">🎉</p>
        <p className="font-semibold" style={{ color: 'var(--success-text)' }}>
          {state.message}
        </p>
        {isVerifiedBuyer && (
          <p
            className="text-xs mt-2"
            style={{ color: 'var(--success-text)', opacity: 0.8 }}
          >
            ✓ Your review will be marked as a Verified Purchase.
          </p>
        )}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {/* Verified buyer badge */}
      {isVerifiedBuyer && (
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2"
          style={{
            background: 'var(--success-bg)',
            border: '1px solid rgba(22,163,74,0.2)',
          }}
        >
          <span style={{ color: 'var(--success-text)' }}>✓</span>
          <p
            className="text-xs font-semibold"
            style={{ color: 'var(--success-text)' }}
          >
            You purchased this product — your review will be marked as a
            Verified Purchase.
          </p>
        </div>
      )}

      {/* Star rating */}
      <div className="space-y-1">
        <label
          className="text-sm font-medium"
          style={{ color: 'var(--text-primary)' }}
        >
          Rating <span style={{ color: 'var(--error-text)' }}>*</span>
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="text-2xl transition-transform hover:scale-110 focus:outline-none"
            >
              <span
                style={{
                  color:
                    star <= (hovered || rating)
                      ? '#F97316'
                      : 'var(--border-base)',
                }}
              >
                ★
              </span>
            </button>
          ))}
        </div>
        <input type="hidden" name="rating" value={rating} />
        {err.rating && (
          <p className="text-xs" style={{ color: 'var(--error-text)' }}>
            {err.rating[0]}
          </p>
        )}
      </div>

      {/* Title */}
      <div className="space-y-1">
        <label
          className="text-sm font-medium"
          style={{ color: 'var(--text-primary)' }}
        >
          Title{' '}
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            (optional)
          </span>
        </label>
        <input
          name="title"
          type="text"
          placeholder="Summarise your review"
          className="input-theme w-full px-3 py-2 text-sm"
        />
      </div>

      {/* Body */}
      <div className="space-y-1">
        <label
          className="text-sm font-medium"
          style={{ color: 'var(--text-primary)' }}
        >
          Review <span style={{ color: 'var(--error-text)' }}>*</span>
        </label>
        <textarea
          name="body"
          rows={4}
          placeholder="Share your experience…"
          className="input-theme w-full px-3 py-2 text-sm resize-none"
        />
        {err.body && (
          <p className="text-xs" style={{ color: 'var(--error-text)' }}>
            {err.body[0]}
          </p>
        )}
      </div>

      {/* Name + Email — pre-filled if logged in */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label
            className="text-sm font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            Name <span style={{ color: 'var(--error-text)' }}>*</span>
          </label>
          <input
            name="authorName"
            type="text"
            defaultValue={customerName ?? ''}
            placeholder="Your name"
            className="input-theme w-full px-3 py-2 text-sm"
            readOnly={!!customerName}
            style={customerName ? { opacity: 0.7 } : {}}
          />
          {err.authorName && (
            <p className="text-xs" style={{ color: 'var(--error-text)' }}>
              {err.authorName[0]}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <label
            className="text-sm font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            Email <span style={{ color: 'var(--error-text)' }}>*</span>
          </label>
          <input
            name="authorEmail"
            type="email"
            defaultValue={customerEmail ?? ''}
            placeholder="your@email.com"
            className="input-theme w-full px-3 py-2 text-sm"
            readOnly={!!customerEmail}
            style={customerEmail ? { opacity: 0.7 } : {}}
          />
          {err.authorEmail && (
            <p className="text-xs" style={{ color: 'var(--error-text)' }}>
              {err.authorEmail[0]}
            </p>
          )}
          {!customerEmail && (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Not shown publicly.
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="btn-navy rounded-lg px-6 py-2.5 text-sm font-semibold disabled:opacity-50"
      >
        {isPending ? 'Submitting…' : 'Submit Review'}
      </button>
    </form>
  );
}
