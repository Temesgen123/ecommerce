import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { createProduct } from '@/app/actions/products';
import ProductForm from '@/components/admin/ProductForm';

export const metadata = { title: 'New Product' };

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/products"
          className="text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">New Product</h1>
      </div>

      <ProductForm
        action={createProduct}
        categories={categories}
        submitLabel="Create Product"
      />
    </div>
  );
}
