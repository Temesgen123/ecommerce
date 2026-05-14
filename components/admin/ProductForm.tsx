'use client';

import { useActionState, useEffect, useState } from 'react';
import type { ProductFormState } from '@/app/actions/products';
import type { Category } from '@prisma/client';
import ImageUploader from '@/components/admin/ImageUploader';

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
    price?: number;
    compareAt?: number | null;
    stock?: number;
    categoryId?: string | null;
    published?: boolean;
    featured?: boolean;
    images?: string[];
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
  const [images, setImages] = useState<string[]>(defaultValues.images ?? []);

  useEffect(() => {
    if (!slugManuallyEdited) setSlug(slugify(name));
  }, [name, slugManuallyEdited]);

  const err = state.errors ?? {};

  // Wrap the action to inject image URLs into FormData
  async function handleSubmit(formData: FormData) {
    // Remove any stale image hidden fields from ImageUploader
    // and replace with the current images state
    images.forEach((url, i) => formData.set(`images[${i}]`, url));
    return action(state, formData);
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.message && (
        <div
          className="rounded-lg px-4 py-3 text-sm font-medium"
          style={{ background: 'var(--error-bg)', color: 'var(--error-text)' }}
        >
          {state.message}
        </div>
      )}

      {/* Images */}
      <section
        className="rounded-xl border bg-white p-6 space-y-4"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <h2
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: 'var(--text-muted)' }}
        >
          Product Images
        </h2>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          The first image will be used as the main product image.
        </p>
        <ImageUploader value={images} onChange={setImages} maxImages={5} />
        {err.images && (
          <p className="text-xs" style={{ color: 'var(--error-text)' }}>
            {err.images[0]}
          </p>
        )}
      </section>

      {/* Basic info */}
      <section
        className="rounded-xl border bg-white p-6 space-y-5"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <h2
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: 'var(--text-muted)' }}
        >
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
          hint="Auto-generated from name"
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
      <section
        className="rounded-xl border bg-white p-6 space-y-5"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <h2
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: 'var(--text-muted)' }}
        >
          Pricing
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Price (USD)" error={err.price?.[0]}>
            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
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
            hint="Strikethrough original"
            error={err.compareAt?.[0]}
          >
            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
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
      <section
        className="rounded-xl border bg-white p-6 space-y-5"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <h2
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: 'var(--text-muted)' }}
        >
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
      <section
        className="rounded-xl border bg-white p-6 space-y-4"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <h2
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: 'var(--text-muted)' }}
        >
          Visibility
        </h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="published"
            defaultChecked={defaultValues.published ?? false}
            className="h-4 w-4 rounded"
          />
          <div>
            <p
              className="text-sm font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              Published
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Visible on the storefront
            </p>
          </div>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={defaultValues.featured ?? false}
            className="h-4 w-4 rounded"
          />
          <div>
            <p
              className="text-sm font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              Featured
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Shown on the homepage
            </p>
          </div>
        </label>
      </section>

      {/* Submit */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="btn-navy rounded-lg px-6 py-2.5 text-sm disabled:opacity-50"
        >
          {isPending ? 'Saving…' : submitLabel}
        </button>
        <a
          href="/admin/products"
          className="text-sm transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          Cancel
        </a>
      </div>
    </form>
  );
}

// ── Sub-components ────────────────────────────────────────────
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
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label
          className="text-sm font-medium"
          style={{ color: 'var(--text-primary)' }}
        >
          {label}
        </label>
        {hint && (
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {hint}
          </span>
        )}
      </div>
      {children}
      {error && (
        <p className="text-xs" style={{ color: 'var(--error-text)' }}>
          {error}
        </p>
      )}
    </div>
  );
}

function input(hasError: boolean) {
  return `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition ${
    hasError
      ? 'border-red-400 bg-red-50 focus:ring-red-200'
      : 'focus:ring-blue-100'
  }`;
}
