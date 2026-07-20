'use client';

import { useState } from 'react';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';
import ReviewForm from '@/components/store/ReviewForm';

interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  authorName: string;
  createdAt: Date;
  verifiedPurchase: boolean;
}

interface ProductReviewsProps {
  productId: string;
  reviews: Review[];
  reviewCount: number;
  avgRating: number | null;
  customerEmail?: string | null;
  customerName?: string | null;
  isVerifiedBuyer?: boolean;
}

export default function ProductReviews({
  productId,
  reviews,
  reviewCount,
  avgRating,
  customerEmail,
  customerName,
  isVerifiedBuyer = false,
}: ProductReviewsProps) {
  const [showReviews, setShowReviews] = useState(false);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-16 space-y-6">
      {/* ── Toggle header ── */}
      <button
        onClick={() => setShowReviews((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-2xl border px-6 py-4 transition-colors hover:bg-opacity-80"
        style={{
          borderColor: 'var(--border-subtle)',
          background: 'var(--bg-surface)',
          color: 'var(--text-primary)',
        }}
      >
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold">Customer Reviews</h2>
          {avgRating !== null ? (
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-4 w-4"
                    style={{
                      fill:
                        star <= Math.round(avgRating)
                          ? '#f59e0b'
                          : 'transparent',
                      color:
                        star <= Math.round(avgRating)
                          ? '#f59e0b'
                          : 'var(--border-base)',
                    }}
                  />
                ))}
              </div>
              <span
                className="text-sm font-medium"
                style={{ color: 'var(--text-muted)' }}
              >
                {avgRating.toFixed(1)} · {reviewCount} review
                {reviewCount !== 1 ? 's' : ''}
              </span>
            </div>
          ) : (
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No reviews yet
            </span>
          )}
        </div>
        {showReviews ? (
          <ChevronUp
            className="h-5 w-5 flex-shrink-0"
            style={{ color: 'var(--text-muted)' }}
          />
        ) : (
          <ChevronDown
            className="h-5 w-5 flex-shrink-0"
            style={{ color: 'var(--text-muted)' }}
          />
        )}
      </button>

      {/* ── Collapsible body ── */}
      {showReviews && (
        <div className="space-y-8">
          {/* Review list */}
          {reviews.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-xl border p-5 space-y-2"
                  style={{
                    background: 'var(--bg-surface)',
                    borderColor: 'var(--border-subtle)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="h-3.5 w-3.5"
                          style={{
                            fill:
                              star <= review.rating ? '#f59e0b' : 'transparent',
                            color:
                              star <= review.rating
                                ? '#f59e0b'
                                : 'var(--border-base)',
                          }}
                        />
                      ))}
                    </div>
                    {review.verifiedPurchase && (
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={{ background: '#dcfce7', color: '#16a34a' }}
                      >
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  {review.title && (
                    <p className="text-sm font-semibold">{review.title}</p>
                  )}
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {review.body}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {review.authorName} ·{' '}
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Write a review */}
          <div
            className="rounded-2xl border p-6 space-y-4"
            style={{
              borderColor: 'var(--border-subtle)',
              background: 'var(--bg-surface)',
            }}
          >
            <h3 className="text-lg font-bold">Write a Review</h3>
            <ReviewForm
              productId={productId}
              customerEmail={customerEmail}
              customerName={customerName}
              isVerifiedBuyer={isVerifiedBuyer}
            />
          </div>
        </div>
      )}
    </div>
  );
}
