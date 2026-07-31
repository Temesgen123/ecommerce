'use client';

import { useState, useTransition, Fragment } from 'react';
import Image from 'next/image';
import { Pencil, Trash2, X, Tag } from 'lucide-react';
import VariantForm from './VariantForm';
import { deleteVariant } from '@/app/actions/variants';

interface Variant {
  id: string;
  color: string | null;
  size: string | null;
  sku: string | null;
  price: number | null;
  stock: number;
  image: string | null;
}

interface VariantsClientProps {
  productId: string;
  variants: Variant[];
  basePrice: number;
}

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function variantLabel(v: Variant): string {
  if (v.color && v.size) return `${v.color} / ${v.size}`;
  if (v.color) return v.color;
  if (v.size) return v.size;
  return 'Default (no options)';
}

export default function VariantsClient({
  productId,
  variants,
  basePrice,
}: VariantsClientProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete(id: string, label: string) {
    if (!confirm(`Delete variant "${label}"?`)) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteVariant(id, productId);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to delete variant.');
      }
    });
  }

  return (
    <section
      className="rounded-xl border bg-white p-6 space-y-4"
      style={{ borderColor: 'var(--border-subtle)' }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: 'var(--text-muted)' }}
          >
            Variants (Color / Size)
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Each variant tracks its own stock. Leave price blank to use the base
            price ({formatPrice(basePrice)}). Upload an image per color to show
            in the product page color picker.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate((v) => !v)}
          className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 transition-colors"
        >
          {showCreate ? (
            <>
              <X className="h-3.5 w-3.5" /> Cancel
            </>
          ) : (
            <>
              <span className="text-sm leading-none">+</span> Add Variant
            </>
          )}
        </button>
      </div>

      {error && (
        <p
          className="text-xs rounded px-2 py-1.5"
          style={{ background: 'var(--error-bg)', color: 'var(--error-text)' }}
        >
          {error}
        </p>
      )}

      {showCreate && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <VariantForm
            productId={productId}
            mode="create"
            onSuccess={() => setShowCreate(false)}
          />
        </div>
      )}

      <div className="rounded-lg border border-gray-200 overflow-hidden">
        {variants.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400">
            No variants yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs text-gray-500">
                <th className="px-4 py-2.5 font-medium w-10">Img</th>
                <th className="px-4 py-2.5 font-medium">Variant</th>
                <th className="px-4 py-2.5 font-medium">SKU</th>
                <th className="px-4 py-2.5 font-medium">Price</th>
                <th className="px-4 py-2.5 font-medium">Stock</th>
                <th className="px-4 py-2.5 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {variants.map((variant) => {
                const label = variantLabel(variant);
                return (
                  <Fragment key={variant.id}>
                    <tr className="hover:bg-gray-50">
                      {/* Variant image thumbnail */}
                      <td className="px-4 py-2.5">
                        {variant.image ? (
                          <div className="relative h-8 w-8 overflow-hidden rounded-md border border-gray-200 flex-shrink-0">
                            <Image
                              src={variant.image}
                              alt={label}
                              fill
                              sizes="32px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-md border border-dashed border-gray-200 bg-gray-50 flex-shrink-0" />
                        )}
                      </td>

                      <td className="px-4 py-2.5 font-medium text-gray-900">
                        <span className="inline-flex items-center gap-1.5">
                          <Tag className="h-3 w-3 text-gray-400" />
                          {label}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs text-gray-500">
                        {variant.sku ?? '—'}
                      </td>
                      <td className="px-4 py-2.5 text-gray-700">
                        {variant.price != null ? (
                          formatPrice(variant.price)
                        ) : (
                          <span className="text-gray-400">
                            {formatPrice(basePrice)} (base)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={
                            variant.stock === 0
                              ? 'text-red-600 font-semibold'
                              : variant.stock <= 5
                                ? 'text-amber-600 font-semibold'
                                : 'text-gray-700'
                          }
                        >
                          {variant.stock}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setEditingId(
                                editingId === variant.id ? null : variant.id,
                              )
                            }
                            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          {variants.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDelete(variant.id, label)}
                              disabled={isPending}
                              className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {editingId === variant.id && (
                      <tr key={`${variant.id}-edit`} className="bg-gray-50">
                        <td colSpan={6} className="px-4 py-3">
                          <VariantForm
                            productId={productId}
                            mode="edit"
                            variantId={variant.id}
                            defaultValues={{
                              color: variant.color ?? '',
                              size: variant.size ?? '',
                              sku: variant.sku ?? '',
                              price: variant.price,
                              stock: variant.stock,
                              image: variant.image,
                            }}
                            onSuccess={() => setEditingId(null)}
                            onCancel={() => setEditingId(null)}
                          />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
