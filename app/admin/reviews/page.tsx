import { prisma } from '@/lib/prisma';
import AdminReviewsClient from '@/components/admin/AdminReviewsClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Reviews' };

export default async function AdminReviewsPage() {
  const reviews = await prisma.productReview.findMany({
    orderBy: { createdAt: 'desc' },
    include: { product: { select: { name: true, slug: true } } },
  });

  return <AdminReviewsClient reviews={reviews} />;
}
