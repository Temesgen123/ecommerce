import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AddToCartButton from '@/components/store/AddToCartButton';

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
  if (!product) return {};
  return { title: product.name };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug, published: true },
    include: { category: { select: { name: true, slug: true } } },
  });

  if (!product) notFound();

  const image = product.images[0] ?? null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Image */}
        <div
          className="aspect-square w-full overflow-hidden rounded-2xl"
          style={{ background: 'var(--bg-elevated)' }}
        >
          {image ? (
            <img
              src={image}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{ color: 'var(--text-muted)' }}
            >
              <svg
                className="h-24 w-24 opacity-20"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          {product.category && (
            <a
              href={`/products?category=${product.category.slug}`}
              className="text-xs font-semibold uppercase tracking-widest transition-colors"
              style={{ color: 'var(--accent-light)' }}
            >
              {product.category.name}
            </a>
          )}

          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span
              className="text-2xl font-semibold"
              style={{ color: 'var(--accent-light)' }}
            >
              {formatPrice(product.price)}
            </span>
            {product.compareAt && product.compareAt > product.price && (
              <>
                <span
                  className="text-base line-through"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {formatPrice(product.compareAt)}
                </span>
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{
                    background: 'var(--error-bg)',
                    color: 'var(--error-text)',
                  }}
                >
                  Sale
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

          {/* Stock */}
          <p className="text-xs">
            {product.stock > 0 ? (
              <span style={{ color: 'var(--success-text)' }}>
                ✓ In stock ({product.stock} available)
              </span>
            ) : (
              <span style={{ color: 'var(--error-text)' }}>Out of stock</span>
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
    </div>
  );
}
