import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import ProductCard from './ProductCard';

interface RelatedProductsProps {
  productId: string;
  categoryId: string | null;
}

export default async function RelatedProducts({
  productId,
  categoryId,
}: RelatedProductsProps) {
  if (!categoryId) return null;

  const related = await prisma.product.findMany({
    where: {
      published: true,
      categoryId,
      id: { not: productId }, // exclude current product
    },
    orderBy: { featured: 'desc' },
    take: 4,
    include: { category: { select: { name: true } } },
  });

  if (related.length === 0) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6  mt-16 space-y-6">
      <div style={{ borderTop: '2px solid var(--border-subtle)' }} />
      <div className="flex items-center justify-between">
        <h2
          className="text-xl font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          You Might Also Like
        </h2>
        {categoryId && (
          <Link
            href={`/products?category=${related[0]?.category?.name ? encodeURIComponent(related[0].category.name) : ''}`}
            className="text-sm font-medium transition-colors"
            style={{ color: 'var(--navy-700)' }}
          >
            View all →
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {related.map((product: any) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            slug={product.slug}
            price={product.price}
            compareAt={product.compareAt}
            image={product.images[0] ?? null}
            category={product.category?.name}
          />
        ))}
      </div>
    </div>
  );
}
