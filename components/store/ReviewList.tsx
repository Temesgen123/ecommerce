interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  authorName: string;
  createdAt: Date;
  verifiedPurchase: boolean;
}
interface ReviewListProps {
  reviews: Review[];
  avgRating: number;
  total: number;
}

function Stars({
  rating,
  size = 'sm',
}: {
  rating: number;
  size?: 'sm' | 'lg';
}) {
  return (
    <div className={`flex gap-0.5 ${size === 'lg' ? 'text-2xl' : 'text-base'}`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          style={{ color: s <= rating ? '#F97316' : 'var(--border-base)' }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function ReviewList({
  reviews,
  avgRating,
  total,
}: ReviewListProps) {
  if (total === 0) {
    return (
      <div className="py-8 text-center" style={{ color: 'var(--text-muted)' }}>
        <p className="text-3xl mb-2">💬</p>
        <p className="text-sm">
          No reviews yet. Be the first to review this product!
        </p>
      </div>
    );
  }

  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: Math.round(
      (reviews.filter((r) => r.rating === star).length / total) * 100,
    ),
  }));

  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <div className="text-center flex-shrink-0">
          <p
            className="text-5xl font-extrabold"
            style={{ color: 'var(--text-primary)' }}
          >
            {avgRating.toFixed(1)}
          </p>
          <Stars rating={Math.round(avgRating)} size="lg" />
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {total} review{total !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex-1 space-y-1.5 w-full">
          {breakdown.map(({ star, count, pct }) => (
            <div key={star} className="flex items-center gap-2 text-sm">
              <span
                className="w-4 text-right flex-shrink-0"
                style={{ color: 'var(--text-muted)' }}
              >
                {star}
              </span>
              <span style={{ color: '#F97316' }}>★</span>
              <div
                className="flex-1 rounded-full overflow-hidden h-2"
                style={{ background: 'var(--bg-elevated)' }}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, background: '#F97316' }}
                />
              </div>
              <span
                className="w-6 text-xs flex-shrink-0"
                style={{ color: 'var(--text-muted)' }}
              >
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-subtle)' }} />

      {/* Reviews */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Stars rating={review.rating} />
                  {review.title && (
                    <span
                      className="text-sm font-semibold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {review.title}
                    </span>
                  )}
                  {review.verifiedPurchase && (
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                      style={{
                        background: 'var(--success-bg)',
                        color: 'var(--success-text)',
                      }}
                    >
                      ✓ Verified Purchase
                    </span>
                  )}
                </div>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {review.authorName} ·{' '}
                  {new Date(review.createdAt).toISOString().slice(0, 10)}
                </p>
              </div>
            </div>
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              {review.body}
            </p>
            <div
              style={{
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '1rem',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
