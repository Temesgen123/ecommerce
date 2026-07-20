import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCustomer } from '@/lib/customer-auth';
import ProductDetail from '@/components/store/ProductDedtail';
import RelatedProducts from '@/components/store/RelatedProducts';
import RecentlyViewed from '@/components/store/RecentlyViewed';
import type { Metadata } from 'next';
import ProductReviews from '@/components/store/ProductReviews';

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
      variants: {
        select: {
          id: true,
          color: true,
          size: true,
          price: true,
          stock: true,
          sku: true,
          image: true,
        },
        orderBy: [{ color: 'asc' }, { size: 'asc' }],
      },
      reviews: {
        where: { approved: true },
        orderBy: { createdAt: 'desc' },
      },
      _count: { select: { reviews: { where: { approved: true } } } },
      bundledIn: {
        include: {
          bundledProduct: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              compareAt: true,
              images: true,
              variants: {
                select: { id: true, stock: true, price: true },
              },
            },
          },
        },
      },
    },
  });

  if (!product) notFound();

  // Compute here, in the page function where reviews are available
  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
        product.reviews.length
      : null;
  const reviewCount = product._count.reviews;

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

  const isVerifiedBuyer = customer
    ? !!(await prisma.orderItem.findFirst({
        where: {
          productId: product.id,
          order: {
            customerEmail: customer.email,
            status: { not: 'CANCELLED' },
          },
        },
      }))
    : false;

  return (
    <>
      <ProductDetail
        product={
          {
            ...product,
            avgRating,
            reviewCount,
          } as any
        }
        isWishlisted={isWishlisted}
        customerEmail={customer?.email ?? null}
        customerName={customer?.name ?? null}
        isVerifiedBuyer={isVerifiedBuyer}
        bundleProducts={product.bundledIn.map((b) => b.bundledProduct)}
      />
      <ProductReviews
        productId={product.id}
        reviews={product.reviews}
        reviewCount={reviewCount}
        avgRating={avgRating}
        customerEmail={customer?.email ?? null}
        customerName={customer?.name ?? null}
        isVerifiedBuyer={isVerifiedBuyer}
      />
      <RelatedProducts productId={product.id} categoryId={product.categoryId} />
      <RecentlyViewed currentProductId={product.id} />
    </>
  );
}
