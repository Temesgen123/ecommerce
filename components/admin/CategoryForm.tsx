'use client';

import { useActionState, useEffect, useState } from 'react';
import type { CategoryFormState } from '@/app/actions/categories';

interface CategoryFormProps {
  action: (
    prev: CategoryFormState,
    formData: FormData,
  ) => Promise<CategoryFormState>;
  defaultValues?: { name?: string; slug?: string; description?: string };
  submitLabel?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function CategoryForm({
  action,
  defaultValues = {},
  submitLabel = 'Save',
  onSuccess,
  onCancel,
}: CategoryFormProps) {
  const [state, formAction, isPending] = useActionState<
    CategoryFormState,
    FormData
  >(action, {});

  const [name, setName] = useState(defaultValues.name ?? '');
  const [slug, setSlug] = useState(defaultValues.slug ?? '');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(
    !!defaultValues.slug,
  );

  useEffect(() => {
    if (!slugManuallyEdited) setSlug(slugify(name));
  }, [name, slugManuallyEdited]);

  // Signal success to parent (e.g. close edit row)
  useEffect(() => {
    if (state.message === 'ok') onSuccess?.();
  }, [state.message, onSuccess]);

  const err = state.errors ?? {};

  return (
    <form action={formAction} className="space-y-3">
      {state.message && state.message !== 'ok' && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Name */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Name</label>
          <input
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Apparel"
            className={field(!!err.name)}
          />
          {err.name && <p className="text-xs text-red-600">{err.name[0]}</p>}
        </div>

        {/* Slug */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Slug</label>
          <input
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugManuallyEdited(true);
            }}
            placeholder="apparel"
            className={field(!!err.slug)}
          />
          {err.slug && <p className="text-xs text-red-600">{err.slug[0]}</p>}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600">
          Description <span className="text-gray-400">(optional)</span>
        </label>
        <input
          name="description"
          defaultValue={defaultValues.description ?? ''}
          placeholder="Short description…"
          className={field(false)}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-gray-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Saving…' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function field(hasError: boolean) {
  return `w-full rounded-md border px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition ${
    hasError ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
  }`;
}
