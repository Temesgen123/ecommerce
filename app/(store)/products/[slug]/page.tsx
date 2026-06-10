import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AddToCartButton from '@/components/store/AddToCartButton';
import ProductImageGallery from '@/components/store/ProductImageGallery';
import ReviewList from '@/components/store/ReviewList';
import ReviewForm from '@/components/store/ReviewForm';
import RelatedProducts from '@/components/store/RelatedProducts';
import { getCustomer } from '@/lib/customer-auth';
import TrackRecentlyViewed from '@/components/store/TrackRecentlyViewed';
import RecentlyViewed from '@/components/store/RecentlyViewed';
import { Metadata } from 'next';
import ShareButtons from '@/components/store/ShareButtons';

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

const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: { select: { name: true } } },
  });

  if (!product) return { title: 'Product Not Found' };

  const price = (product.price / 100).toFixed(2);
  const image = product.images[0] ?? null;
  const title = `${product.name} | MyStore`;
  const description = product.description
    ? product.description.slice(0, 160)
    : `Buy ${product.name} at MyStore. ${product.category?.name ? `Shop our ${product.category.name} collection.` : ''} Fast shipping, easy returns.`;

  return {
    title,
    description,
    keywords: [
      product.name,
      product.category?.name ?? '',
      'buy online',
      'MyStore',
      'free shipping',
    ].filter(Boolean),
    openGraph: {
      type: 'website',
      title,
      description,
      url: `${baseUrl}/products/${slug}`,
      siteName: 'MyStore',
      ...(image && {
        images: [
          {
            url: image,
            width: 800,
            height: 800,
            alt: product.name,
          },
        ],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(image && { images: [image] }),
    },
    alternates: {
      canonical: `${baseUrl}/products/${slug}`,
    },
    other: {
      'product:price:amount': price,
      'product:price:currency': 'USD',
      ...(product.stock > 0
        ? { 'product:availability': 'in stock' }
        : { 'product:availability': 'out of stock' }),
    },
  };
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
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: product.description ?? undefined,
            image: product.images,
            sku: product.id.slice(0, 8).toUpperCase(),
            url: `${baseUrl}/products/${product.slug}`,
            brand: {
              '@type': 'Brand',
              name: 'MyStore',
            },
            ...(product.category && {
              category: product.category.name,
            }),
            offers: {
              '@type': 'Offer',
              url: `${baseUrl}/products/${product.slug}`,
              priceCurrency: 'USD',
              price: (product.price / 100).toFixed(2),
              availability:
                product.stock > 0
                  ? 'https://schema.org/InStock'
                  : 'https://schema.org/OutOfStock',
              seller: {
                '@type': 'Organization',
                name: 'MyStore',
              },
            },
            ...(totalReviews > 0 && {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: avgRating.toFixed(1),
                reviewCount: totalReviews,
                bestRating: 5,
                worstRating: 1,
              },
              review: reviews.slice(0, 5).map((r: any) => ({
                '@type': 'Review',
                reviewRating: {
                  '@type': 'Rating',
                  ratingValue: r.rating,
                  bestRating: 5,
                  worstRating: 1,
                },
                author: {
                  '@type': 'Person',
                  name: r.authorName,
                },
                reviewBody: r.body,
                datePublished: r.createdAt.toISOString().slice(0, 10),
              })),
            }),
          }),
        }}
      />

      {/* Breadcrumb JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: baseUrl,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Products',
                item: `${baseUrl}/products`,
              },
              ...(product.category
                ? [
                    {
                      '@type': 'ListItem',
                      position: 3,
                      name: product.category.name,
                      item: `${baseUrl}/products?category=${product.category.slug}`,
                    },
                    {
                      '@type': 'ListItem',
                      position: 4,
                      name: product.name,
                      item: `${baseUrl}/products/${product.slug}`,
                    },
                  ]
                : [
                    {
                      '@type': 'ListItem',
                      position: 3,
                      name: product.name,
                      item: `${baseUrl}/products/${product.slug}`,
                    },
                  ]),
            ],
          }),
        }}
      />
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
      <TrackRecentlyViewed
        item={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          compareAt: product.compareAt,
          image: product.images[0] ?? null,
          category: product.category?.name ?? null,
        }}
      />

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

          {/* Share buttons — add here */}
          <ShareButtons
            url={`${baseUrl}/products/${product.slug}`}
            title={product.name}
            price={formatPrice(product.price)}
          />
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
      <RecentlyViewed currentProductId={product.id} />
    </div>
  );
}
