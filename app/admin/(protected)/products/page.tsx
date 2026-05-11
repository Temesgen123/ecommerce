import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { deleteProduct } from '@/app/actions/products';
import { Plus, Pencil, Trash2, PackageX } from 'lucide-react';

export const metadata = { title: 'Products' };

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: { select: { name: true } } },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Product
        </Link>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200 bg-white">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-400">
            <PackageX className="h-10 w-10" />
            <p className="text-sm">No products yet.</p>
            <Link
              href="/admin/products/new"
              className="text-sm font-medium text-gray-900 underline underline-offset-2"
            >
              Create your first product
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Price</th>
                <th className="px-6 py-3 font-medium">Stock</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Featured</th>
                <th className="px-6 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-400">{product.slug}</p>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-gray-500">
                    {product.category?.name ?? (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-gray-700">
                    <div>
                      <span>{formatPrice(product.price)}</span>
                      {product.compareAt && (
                        <span className="ml-2 text-xs text-gray-400 line-through">
                          {formatPrice(product.compareAt)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={
                        product.stock === 0
                          ? 'text-red-500 font-medium'
                          : product.stock < 10
                            ? 'text-yellow-600 font-medium'
                            : 'text-gray-700'
                      }
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        product.published
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {product.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    {product.featured ? (
                      <span className="text-xs text-yellow-600 font-medium">
                        ★ Yes
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <DeleteButton id={product.id} name={product.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Inline delete button (client component) ──────────────────
import DeleteButton from '@/components/admin/DeleteButton';
