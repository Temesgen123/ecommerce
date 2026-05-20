import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AddToCartButton from '@/components/store/AddToCartButton';
import ProductImageGallery from '@/components/store/ProductImageGallery';
import ReviewList from '@/components/store/ReviewList';
import ReviewForm from '@/components/store/ReviewForm';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  return product ? { title: product.name } : {};
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug, published: true },
    include: {
      category: { select: { name: true, slug: true } },
      reviews: {
        where: { approved: true },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          rating: true,
          title: true,
          body: true,
          authorName: true,
          createdAt: true,
        },
      },
    },
  });

  if (!product) notFound();

  const image = product.images[0] ?? null;
  const reviews = product.reviews;
  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
        totalReviews
      : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Product info */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ProductImageGallery
          images={product.images}
          productName={product.name}
        />

        <div className="flex flex-col gap-5">
          {product.category && (
            <a
              href={`/products?category=${product.category.slug}`}
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: 'var(--navy-600)' }}
            >
              {product.category.name}
            </a>
          )}

          <h1
            className="text-3xl font-extrabold tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            {product.name}
          </h1>

          {/* Rating summary inline */}
          {totalReviews > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    style={{
                      color:
                        star <= Math.round(avgRating)
                          ? '#F97316'
                          : 'var(--border-base)',
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {avgRating.toFixed(1)} ({totalReviews} review
                {totalReviews !== 1 ? 's' : ''})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span
              className="text-3xl font-bold"
              style={{ color: 'var(--accent)' }}
            >
              {formatPrice(product.price)}
            </span>
            {product.compareAt && product.compareAt > product.price && (
              <>
                <span
                  className="text-lg line-through"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {formatPrice(product.compareAt)}
                </span>
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                  style={{
                    background: 'var(--error-bg)',
                    color: 'var(--error-text)',
                  }}
                >
                  SALE
                </span>
              </>
            )}
          </div>

          {product.description && (
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              {product.description}
            </p>
          )}

          <p className="text-sm font-medium">
            {product.stock > 0 ? (
              <span style={{ color: 'var(--success-text)' }}>
                ✓ In stock ({product.stock} available)
              </span>
            ) : (
              <span style={{ color: 'var(--error-text)' }}>✕ Out of stock</span>
            )}
          </p>

          <AddToCartButton
            product={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              image,
              stock: product.stock,
            }}
          />

          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            SKU: {product.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
      </div>

      {/* Reviews section */}
      <div className="mt-16 space-y-10">
        <div style={{ borderTop: '2px solid var(--border-subtle)' }} />

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Review list */}
          <div>
            <h2
              className="text-xl font-bold mb-6"
              style={{ color: 'var(--text-primary)' }}
            >
              Customer Reviews
            </h2>
            <ReviewList
              reviews={reviews}
              avgRating={avgRating}
              total={totalReviews}
            />
          </div>

          {/* Write a review */}
          <div>
            <h2
              className="text-xl font-bold mb-6"
              style={{ color: 'var(--text-primary)' }}
            >
              Write a Review
            </h2>
            <div
              className="rounded-xl border p-6"
              style={{
                background: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <ReviewForm productId={product.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
