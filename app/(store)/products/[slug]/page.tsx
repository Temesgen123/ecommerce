import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCustomer } from '@/lib/customer-auth';
import ProductDetail from '@/components/store/ProductDedtail';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { name: true, description: true, images: true, brand: true },
  });
  if (!product) return { title: 'Product Not Found' };
  return {
    title: product.name,
    description: product.description ?? undefined,
    openGraph: {
      title: product.name,
      description: product.description ?? undefined,
      images: product.images[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const customer = await getCustomer();

  const product = await prisma.product.findUnique({
    where: { slug, published: true },
    include: {
      category: { select: { name: true, slug: true } },
      // Variants sorted so colors group together, sizes sort naturally
      variants: {
        orderBy: [{ color: 'asc' }, { size: 'asc' }],
      },
      reviews: {
        where: { approved: true },
        orderBy: { createdAt: 'desc' },
      },
      _count: { select: { reviews: { where: { approved: true } } } },
    },
  });

  if (!product) notFound();

  // Check if this product is in the customer's wishlist
  const isWishlisted = customer
    ? !!(await prisma.wishlist.findUnique({
        where: {
          customerId_productId: {
            customerId: customer.id,
            productId: product.id,
          },
        },
      }))
    : false;

  return <ProductDetail product={product as any} isWishlisted={isWishlisted} />;
}
