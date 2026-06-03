import Link from 'next/link';
import { Plus } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import AdminProductsClient from '@/components/admin/AdminProductsClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Products' };

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: { select: { name: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1
          className="text-2xl font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Products
        </h1>
        <Link
          href="/admin/products/new"
          className="btn-navy inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm"
        >
          <Plus className="h-4 w-4" /> New Product
        </Link>
      </div>
      <AdminProductsClient products={products as any} />
    </div>
  );
}
