'use client';

import { useState, useTransition } from 'react';
import { Check, Trash2, Star, MessageSquare } from 'lucide-react';
import { approveReview, deleteReview } from '@/app/actions/reviews';

interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  authorName: string;
  authorEmail: string;
  approved: boolean;
  createdAt: Date;
  product: {
    name: string;
    slug: string;
  };
}

interface AdminReviewsClientProps {
  reviews: Review[];
}

function Stars({ rating }: { rating: number }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          style={{ color: s <= rating ? '#F97316' : 'var(--border-base)' }}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export default function AdminReviewsClient({
  reviews,
}: AdminReviewsClientProps) {
  const [isPending, startTransition] = useTransition();

  const pending = reviews.filter((r) => !r.approved);
  const approved = reviews.filter((r) => r.approved);

  const [localReviews, setLocalReviews] = useState(reviews);

  function handleApprove(id: string) {
    setLocalReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, approved: true } : r)),
    );
    startTransition(async () => {
      await approveReview(id);
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete review by "${name}"?`)) return;
    setLocalReviews((prev) => prev.filter((r) => r.id !== id));
    startTransition(async () => {
      await deleteReview(id);
    });
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1
          className="text-2xl font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Reviews
        </h1>
        <div
          className="flex gap-3 text-sm"
          style={{ color: 'var(--text-muted)' }}
        >
          <span>{pending.length} pending</span>
          <span>·</span>
          <span>{approved.length} approved</span>
        </div>
      </div>

      {/* Pending reviews */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h2
            className="text-sm font-bold uppercase tracking-wide"
            style={{ color: 'var(--warning-text)' }}
          >
            ⏳ Pending Approval ({pending.length})
          </h2>
          {pending.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              isPending={isPending}
              onApprove={() => handleApprove(review.id)}
              onDelete={() => handleDelete(review.id, review.authorName)}
              showApprove
            />
          ))}
        </div>
      )}

      {/* Approved reviews */}
      <div className="space-y-3">
        <h2
          className="text-sm font-bold uppercase tracking-wide"
          style={{ color: 'var(--success-text)' }}
        >
          ✓ Approved ({approved.length})
        </h2>
        {approved.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center gap-3 py-12 rounded-xl border"
            style={{
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-muted)',
            }}
          >
            <MessageSquare className="h-8 w-8 opacity-30" />
            <p className="text-sm">No approved reviews yet.</p>
          </div>
        ) : (
          approved.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              isPending={isPending}
              onDelete={() => handleDelete(review.id, review.authorName)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ReviewCard({
  review,
  isPending,
  onApprove,
  onDelete,
  showApprove = false,
}: {
  review: Review;
  isPending: boolean;
  onApprove?: () => void;
  onDelete: () => void;
  showApprove?: boolean;
}) {
  return (
    <div
      className="rounded-xl border bg-white p-5 space-y-3"
      style={{
        borderColor: showApprove ? 'var(--warning-bg)' : 'var(--border-subtle)',
        background: showApprove ? 'var(--warning-bg)' : '#fff',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Stars rating={review.rating} />
            {review.title && (
              <span
                className="text-sm font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                {review.title}
              </span>
            )}
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {review.authorName} ({review.authorEmail}) ·{' '}
            {new Date(review.createdAt).toISOString().slice(0, 10)} ·{' '}
            <span className="font-medium" style={{ color: 'var(--navy-700)' }}>
              {review.product.name}
            </span>
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {showApprove && onApprove && (
            <button
              onClick={onApprove}
              disabled={isPending}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50"
              style={{
                background: 'var(--success-bg)',
                color: 'var(--success-text)',
              }}
              title="Approve"
            >
              <Check className="h-3.5 w-3.5" />
              Approve
            </button>
          )}
          <button
            onClick={onDelete}
            disabled={isPending}
            className="rounded-lg p-1.5 transition-colors hover:bg-red-50 disabled:opacity-50"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.color =
                'var(--error-text)')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color =
                'var(--text-muted)')
            }
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <p
        className="text-sm leading-relaxed"
        style={{ color: 'var(--text-secondary)' }}
      >
        {review.body}
      </p>
    </div>
  );
}
