import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';
import AdminCustomersClient from '@/components/admin/AdminCustomersClient';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Customers' };

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
}

const PER_PAGE = 20;

export default async function AdminCustomersPage({ searchParams }: Props) {
  const { q, page: pageParam } = await searchParams;
  const searchTerm = q?.trim() ?? '';
  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10));
  const skip = (currentPage - 1) * PER_PAGE;

  const where = searchTerm
    ? {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' as const } },
          { email: { contains: searchTerm, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [customers, totalCount] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: PER_PAGE,
      include: {
        _count: { select: { addresses: true } },
      },
    }),
    prisma.customer.count({ where }),
  ]);

  // Get order stats per customer
  const customerEmails = customers.map((c) => c.email);
  const orderStats = await prisma.order.groupBy({
    by: ['customerEmail'],
    where: {
      customerEmail: { in: customerEmails },
      status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
    },
    _count: true,
    _sum: { total: true },
  });

  const statsMap = Object.fromEntries(
    orderStats.map((s: any) => [
      s.customerEmail,
      { orders: s._count, revenue: s._sum.total ?? 0 },
    ]),
  );

  const customersWithStats = customers.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    createdAt: c.createdAt.toISOString(),
    addressCount: c._count.addresses,
    orders: statsMap[c.email]?.orders ?? 0,
    revenue: statsMap[c.email]?.revenue ?? 0,
  }));

  const totalPages = Math.ceil(totalCount / PER_PAGE);

  return (
    <AdminCustomersClient
      customers={customersWithStats}
      totalCount={totalCount}
      currentPage={currentPage}
      totalPages={totalPages}
      searchTerm={searchTerm}
    />
  );
}
