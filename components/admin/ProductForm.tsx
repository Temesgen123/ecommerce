'use client';

import { useActionState, useEffect, useState } from 'react';
import type { ProductFormState } from '@/app/actions/products';
import type { Category } from '@prisma/client';

interface ProductFormProps {
  action: (
    prev: ProductFormState,
    formData: FormData,
  ) => Promise<ProductFormState>;
  categories: Category[];
  defaultValues?: {
    name?: string;
    slug?: string;
    description?: string;
    price?: number; // in cents
    compareAt?: number | null;
    stock?: number;
    categoryId?: string | null;
    published?: boolean;
    featured?: boolean;
  };
  submitLabel?: string;
}

function centsToDisplay(cents?: number | null): string {
  if (cents == null) return '';
  return (cents / 100).toFixed(2);
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function ProductForm({
  action,
  categories,
  defaultValues = {},
  submitLabel = 'Save Product',
}: ProductFormProps) {
  const [state, formAction, isPending] = useActionState<
    ProductFormState,
    FormData
  >(action, {});

  const [name, setName] = useState(defaultValues.name ?? '');
  const [slug, setSlug] = useState(defaultValues.slug ?? '');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(
    !!defaultValues.slug,
  );

  // Auto-generate slug from name unless user has manually edited it
  useEffect(() => {
    if (!slugManuallyEdited) {
      setSlug(slugify(name));
    }
  }, [name, slugManuallyEdited]);

  const err = state.errors ?? {};

  return (
    <form action={formAction} className="space-y-8">
      {state.message && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </div>
      )}

      {/* Basic info */}
      <section className="rounded-lg border border-gray-200 bg-white p-6 space-y-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Basic Information
        </h2>

        <Field label="Name" error={err.name?.[0]}>
          <input
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Classic Tee"
            className={input(!!err.name)}
          />
        </Field>

        <Field
          label="Slug"
          hint="URL-friendly identifier"
          error={err.slug?.[0]}
        >
          <input
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugManuallyEdited(true);
            }}
            placeholder="classic-tee"
            className={input(!!err.slug)}
          />
        </Field>

        <Field label="Description" error={err.description?.[0]}>
          <textarea
            name="description"
            defaultValue={defaultValues.description ?? ''}
            rows={4}
            placeholder="Product description…"
            className={input(!!err.description) + ' resize-none'}
          />
        </Field>
      </section>

      {/* Pricing */}
      <section className="rounded-lg border border-gray-200 bg-white p-6 space-y-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Pricing
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Price (USD)" error={err.price?.[0]}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                $
              </span>
              <input
                name="price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={centsToDisplay(defaultValues.price)}
                placeholder="0.00"
                className={input(!!err.price) + ' pl-7'}
              />
            </div>
          </Field>
          <Field
            label="Compare-at Price"
            hint="Show a strikethrough original price"
            error={err.compareAt?.[0]}
          >
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                $
              </span>
              <input
                name="compareAt"
                type="number"
                step="0.01"
                min="0"
                defaultValue={centsToDisplay(defaultValues.compareAt)}
                placeholder="0.00"
                className={input(!!err.compareAt) + ' pl-7'}
              />
            </div>
          </Field>
        </div>
      </section>

      {/* Inventory */}
      <section className="rounded-lg border border-gray-200 bg-white p-6 space-y-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Inventory
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Stock" error={err.stock?.[0]}>
            <input
              name="stock"
              type="number"
              min="0"
              step="1"
              defaultValue={defaultValues.stock ?? 0}
              className={input(!!err.stock)}
            />
          </Field>
          <Field label="Category" error={err.categoryId?.[0]}>
            <select
              name="categoryId"
              defaultValue={defaultValues.categoryId ?? ''}
              className={input(false)}
            >
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      {/* Visibility */}
      <section className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Visibility
        </h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="published"
            defaultChecked={defaultValues.published ?? false}
            className="h-4 w-4 rounded border-gray-300 text-gray-900"
          />
          <span className="text-sm text-gray-700">
            Published — visible on the storefront
          </span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={defaultValues.featured ?? false}
            className="h-4 w-4 rounded border-gray-300 text-gray-900"
          />
          <span className="text-sm text-gray-700">
            Featured — shown on the homepage
          </span>
        </label>
      </section>

      {/* Submit */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Saving…' : submitLabel}
        </button>
        <a
          href="/admin/products"
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}

// ── Sub-components ───────────────────────────────────────────
function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {hint && <span className="text-xs text-gray-400">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

function input(hasError: boolean) {
  return `w-full rounded-md border px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition ${
    hasError ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
  }`;
}
