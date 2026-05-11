import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { updateProduct } from '@/app/actions/products';
import ProductForm from '@/components/admin/ProductForm';

export const metadata = { title: 'Edit Product' };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ]);

  if (!product) notFound();

  // Bind the product id into the action so the form doesn't need a hidden field
  const updateProductWithId = updateProduct.bind(null, product.id);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/products"
          className="text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Edit Product</h1>
      </div>

      <ProductForm
        action={updateProductWithId}
        categories={categories}
        defaultValues={{
          name: product.name,
          slug: product.slug,
          description: product.description ?? '',
          price: product.price,
          compareAt: product.compareAt,
          stock: product.stock,
          categoryId: product.categoryId,
          published: product.published,
          featured: product.featured,
        }}
        submitLabel="Update Product"
      />
    </div>
  );
}
