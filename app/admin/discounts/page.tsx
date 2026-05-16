import { prisma } from '@/lib/prisma';
import DiscountsClient from '@/components/admin/DiscountsClient';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Discount Codes' };

export default async function AdminDiscountsPage() {
  const codes = await prisma.discountCode.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return <DiscountsClient codes={codes} />;
}
