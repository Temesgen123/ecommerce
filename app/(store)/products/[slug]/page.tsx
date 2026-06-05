import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AddToCartButton from '@/components/store/AddToCartButton';
import ProductImageGallery from '@/components/store/ProductImageGallery';
import ReviewList from '@/components/store/ReviewList';
import ReviewForm from '@/components/store/ReviewForm';
import RelatedProducts from '@/components/store/RelatedProducts';
import { getCustomer } from '@/lib/customer-auth';

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

  const [product, customer] = await Promise.all([
    prisma.product.findUnique({
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
            verifiedPurchase: true,
          },
        },
      },
    }),
    getCustomer(),
  ]);

  if (!product) notFound();

  const image = product.images[0] ?? null;
  const reviews = product.reviews;
  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
        totalReviews
      : 0;

  // Check if logged-in customer has purchased this product
  let isVerifiedBuyer = false;
  if (customer) {
    const purchase = await prisma.orderItem.findFirst({
      where: {
        productId: product.id,
        order: {
          customerEmail: { equals: customer.email, mode: 'insensitive' },
          status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
        },
      },
    });
    isVerifiedBuyer = !!purchase;
  }

  // Check if customer already reviewed
  const alreadyReviewed = customer
    ? !!(await prisma.productReview.findFirst({
        where: { productId: product.id, authorEmail: customer.email },
      }))
    : false;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Breadcrumb */}
      <nav
        className="mb-6 flex items-center gap-2 text-xs"
        style={{ color: 'var(--text-muted)' }}
      >
        <a
          href="/"
          className="hover:underline"
          style={{ color: 'var(--navy-700)' }}
        >
          Home
        </a>
        <span>/</span>
        <a
          href="/products"
          className="hover:underline"
          style={{ color: 'var(--navy-700)' }}
        >
          Products
        </a>
        {product.category && (
          <>
            <span>/</span>
            <a
              href={`/products?category=${product.category.slug}`}
              className="hover:underline"
              style={{ color: 'var(--navy-700)' }}
            >
              {product.category.name}
            </a>
          </>
        )}
        <span>/</span>
        <span style={{ color: 'var(--text-primary)' }}>{product.name}</span>
      </nav>

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
          {totalReviews > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span
                    key={s}
                    style={{
                      color:
                        s <= Math.round(avgRating)
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

      <RelatedProducts productId={product.id} categoryId={product.categoryId} />

      {/* Reviews */}
      <div className="mt-16 space-y-10">
        <div style={{ borderTop: '2px solid var(--border-subtle)' }} />
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
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
          <div>
            <h2
              className="text-xl font-bold mb-6"
              style={{ color: 'var(--text-primary)' }}
            >
              {alreadyReviewed ? 'You Already Reviewed This' : 'Write a Review'}
            </h2>
            {alreadyReviewed ? (
              <div
                className="rounded-xl border p-5 text-center"
                style={{
                  background: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  You have already submitted a review for this product. Thank
                  you!
                </p>
              </div>
            ) : (
              <div
                className="rounded-xl border p-6"
                style={{
                  background: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <ReviewForm
                  productId={product.id}
                  customerEmail={customer?.email ?? null}
                  customerName={customer?.name ?? null}
                  isVerifiedBuyer={isVerifiedBuyer}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
