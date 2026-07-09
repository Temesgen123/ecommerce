import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { updateProduct } from '@/app/actions/products';
import ProductForm from '@/components/admin/ProductForm';
import VariantsClient from '@/components/admin/VariantsClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Edit Product' };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        variants: { orderBy: [{ color: 'asc' }, { size: 'asc' }] },
      },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ]);

  if (!product) notFound();

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
        action={updateProduct.bind(null, product.id)}
        categories={categories}
        defaultValues={{
          name: product.name,
          slug: product.slug,
          description: product.description ?? '',
          brand: product.brand ?? '',
          price: product.price,
          compareAt: product.compareAt,
          stock: product.stock,
          categoryId: product.categoryId,
          published: product.published,
          featured: product.featured,
          images: product.images,
        }}
        submitLabel="Update Product"
      />

      <VariantsClient
        productId={product.id}
        variants={product.variants}
        basePrice={product.price}
      />
    </div>
  );
}
