'use client';

import { useActionState, useState } from 'react';
import { submitReview, type ReviewFormState } from '@/app/actions/reviews';

interface ReviewFormProps {
  productId: string;
}

export default function ReviewForm({ productId }: ReviewFormProps) {
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
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
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
              aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
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
        {rating === 0 && state.errors && (
          <p className="text-xs" style={{ color: 'var(--error-text)' }}>
            Please select a rating.
          </p>
        )}
      </div>

      {/* Title */}
      <div className="space-y-1">
        <label
          className="text-sm font-medium"
          style={{ color: 'var(--text-primary)' }}
        >
          Title <span style={{ color: 'var(--text-muted)' }}>(optional)</span>
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
          placeholder="Share your experience with this product…"
          className="input-theme w-full px-3 py-2 text-sm resize-none"
        />
        {err.body && (
          <p className="text-xs" style={{ color: 'var(--error-text)' }}>
            {err.body[0]}
          </p>
        )}
      </div>

      {/* Name + Email */}
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
            placeholder="Your name"
            className="input-theme w-full px-3 py-2 text-sm"
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
            placeholder="your@email.com"
            className="input-theme w-full px-3 py-2 text-sm"
          />
          {err.authorEmail && (
            <p className="text-xs" style={{ color: 'var(--error-text)' }}>
              {err.authorEmail[0]}
            </p>
          )}
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Your email won't be displayed publicly.
          </p>
        </div>
      </div>

      {state.message && !state.success && (
        <p
          className="text-sm rounded-lg px-3 py-2"
          style={{ background: 'var(--error-bg)', color: 'var(--error-text)' }}
        >
          {state.message}
        </p>
      )}

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
