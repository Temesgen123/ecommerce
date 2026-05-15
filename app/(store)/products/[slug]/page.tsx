import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AddToCartButton from '@/components/store/AddToCartButton';
import ProductImageGallery from '@/components/store/ProductImageGallery';

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
    include: { category: { select: { name: true, slug: true } } },
  });

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Image gallery */}
        <ProductImageGallery
          images={product.images}
          productName={product.name}
        />

        {/* Info */}
        <div className="flex flex-col gap-5">
          {product.category && (
            <a
              href={`/products?category=${product.category.slug}`}
              className="text-xs font-bold uppercase tracking-widest transition-colors"
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

          {/* Description */}
          {product.description && (
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              {product.description}
            </p>
          )}

          {/* Stock */}
          <p className="text-sm font-medium">
            {product.stock > 0 ? (
              <span style={{ color: 'var(--success-text)' }}>
                ✓ In stock ({product.stock} available)
              </span>
            ) : (
              <span style={{ color: 'var(--error-text)' }}>✕ Out of stock</span>
            )}
          </p>

          {/* Add to cart */}
          <AddToCartButton
            product={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              image: product.images[0] ?? null,
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
