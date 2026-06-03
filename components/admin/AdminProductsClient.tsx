'use client';
import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  Pencil,
  Trash2,
  ImageOff,
  CheckSquare,
  Square,
  Minus,
} from 'lucide-react';
import { deleteProduct } from '@/app/actions/products';
import {
  bulkPublish,
  bulkUnpublish,
  bulkDelete,
  bulkFeature,
  bulkUnfeature,
} from '@/app/actions/bulk-actions';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAt: number | null;
  stock: number;
  published: boolean;
  featured: boolean;
  images: string[];
  category: { name: string } | null;
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export default function AdminProductsClient({
  products,
}: {
  products: Product[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const allSelected = products.length > 0 && selected.size === products.length;
  const someSelected = selected.size > 0 && !allSelected;

  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(products.map((p) => p.id)));
  }

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  function runBulk(fn: (ids: string[]) => Promise<void>, confirm?: string) {
    if (confirm && !window.confirm(confirm)) return;
    const ids = Array.from(selected);
    startTransition(async () => {
      await fn(ids);
      setSelected(new Set());
    });
  }

  function handleSingleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    startTransition(async () => {
      await deleteProduct(id);
    });
  }

  return (
    <div className="space-y-4">
      {/* Bulk toolbar */}
      {selected.size > 0 && (
        <div
          className="flex flex-wrap items-center gap-2 rounded-xl border px-4 py-3"
          style={{
            background: 'var(--navy-50)',
            borderColor: 'var(--navy-200, #89B4DC)',
          }}
        >
          <span
            className="text-sm font-semibold"
            style={{ color: 'var(--navy-900)' }}
          >
            {selected.size} selected
          </span>
          <div className="flex flex-wrap gap-2 ml-2">
            {[
              { label: 'Publish', fn: () => runBulk(bulkPublish) },
              { label: 'Unpublish', fn: () => runBulk(bulkUnpublish) },
              { label: 'Feature', fn: () => runBulk(bulkFeature) },
              { label: 'Unfeature', fn: () => runBulk(bulkUnfeature) },
            ].map(({ label, fn }) => (
              <button
                key={label}
                onClick={fn}
                disabled={isPending}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50"
                style={{ background: 'var(--navy-900)', color: '#fff' }}
              >
                {label}
              </button>
            ))}
            <button
              onClick={() =>
                runBulk(
                  bulkDelete,
                  `Delete ${selected.size} product(s)? This cannot be undone.`,
                )
              }
              disabled={isPending}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50"
              style={{
                background: 'var(--error-bg)',
                color: 'var(--error-text)',
              }}
            >
              Delete
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              Clear
            </button>
          </div>
        </div>
      )}

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
            <p className="text-sm">No products yet.</p>
            <Link
              href="/admin/products/new"
              className="text-sm font-semibold underline"
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
                <th className="px-4 py-3 w-10">
                  <button
                    onClick={toggleAll}
                    className="flex items-center justify-center"
                    style={{
                      color: allSelected
                        ? 'var(--navy-700)'
                        : someSelected
                          ? 'var(--navy-500)'
                          : 'var(--text-muted)',
                    }}
                  >
                    {allSelected ? (
                      <CheckSquare className="h-4 w-4" />
                    ) : someSelected ? (
                      <Minus className="h-4 w-4" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </th>
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
              {products.map((product) => {
                const isSelected = selected.has(product.id);
                return (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 transition-colors"
                    style={{
                      background: isSelected ? 'var(--navy-50)' : undefined,
                    }}
                  >
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggle(product.id)}
                        style={{
                          color: isSelected
                            ? 'var(--navy-700)'
                            : 'var(--text-muted)',
                        }}
                      >
                        {isSelected ? (
                          <CheckSquare className="h-4 w-4" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className="h-12 w-12 rounded-lg overflow-hidden flex-shrink-0"
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
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() =>
                            handleSingleDelete(product.id, product.name)
                          }
                          disabled={isPending}
                          className="rounded-lg p-1.5 transition-colors hover:bg-red-50 disabled:opacity-50"
                          style={{ color: 'var(--text-muted)' }}
                          onMouseEnter={(e) =>
                            ((e.currentTarget as HTMLElement).style.color =
                              'var(--error-text)')
                          }
                          onMouseLeave={(e) =>
                            ((e.currentTarget as HTMLElement).style.color =
                              'var(--text-muted)')
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
