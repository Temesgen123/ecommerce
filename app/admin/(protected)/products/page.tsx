import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { deleteProduct } from '@/app/actions/products';
import DeleteButton from '@/components/admin/DeleteButton';
import { Plus, Pencil, PackageX, ImageOff } from 'lucide-react';

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
          <Plus className="h-4 w-4" />
          New Product
        </Link>
      </div>

      {/* Table */}
      <div
        className="rounded-xl border bg-white overflow-hidden"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        {products.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center gap-3 py-20"
            style={{ color: 'var(--text-muted)' }}
          >
            <PackageX className="h-10 w-10 opacity-40" />
            <p className="text-sm">No products yet.</p>
            <Link
              href="/admin/products/new"
              className="text-sm font-semibold underline underline-offset-2"
              style={{ color: 'var(--navy-700)' }}
            >
              Create your first product
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr
                className="text-left text-xs font-semibold uppercase tracking-wide"
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)',
                }}
              >
                <th className="px-4 py-3 w-16">Image</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Featured</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody
              className="divide-y"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              {products.map((product: any) => (
                <tr
                  key={product.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Thumbnail */}
                  <td className="px-4 py-3">
                    <div
                      className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg"
                      style={{ background: 'var(--bg-elevated)' }}
                    >
                      {product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div
                          className="flex h-full w-full items-center justify-center"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <ImageOff className="h-4 w-4 opacity-40" />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Name + slug */}
                  <td className="px-4 py-3">
                    <p
                      className="font-semibold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {product.name}
                    </p>
                    <p
                      className="text-xs font-mono mt-0.5"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {product.slug}
                    </p>
                    {product.images.length > 1 && (
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: 'var(--navy-600)' }}
                      >
                        {product.images.length} images
                      </p>
                    )}
                  </td>

                  <td
                    className="px-4 py-3"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {product.category?.name ?? (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div>
                      <span
                        className="font-semibold"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {formatPrice(product.price)}
                      </span>
                      {product.compareAt && (
                        <span
                          className="ml-2 text-xs line-through"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {formatPrice(product.compareAt)}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={
                        product.stock === 0
                          ? 'font-semibold text-red-500'
                          : product.stock < 10
                            ? 'font-semibold text-yellow-600'
                            : ''
                      }
                      style={
                        product.stock >= 10
                          ? { color: 'var(--text-primary)' }
                          : {}
                      }
                    >
                      {product.stock}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      style={
                        product.published
                          ? {
                              background: 'var(--success-bg)',
                              color: 'var(--success-text)',
                            }
                          : {
                              background: 'var(--bg-elevated)',
                              color: 'var(--text-muted)',
                            }
                      }
                    >
                      {product.published ? 'Published' : 'Draft'}
                    </span>
                  </td>

                  <td
                    className="px-4 py-3 text-xs font-medium"
                    style={{
                      color: product.featured
                        ? 'var(--warning-text)'
                        : 'var(--text-muted)',
                    }}
                  >
                    {product.featured ? '★ Yes' : '—'}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="rounded-lg p-1.5 transition-colors hover:bg-gray-100"
                        style={{ color: 'var(--text-muted)' }}
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
