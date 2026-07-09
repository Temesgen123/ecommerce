'use client';

import { useActionState, useEffect } from 'react';
import {
  createVariant,
  updateVariant,
  type VariantFormState,
} from '@/app/actions/variants';

interface VariantFormProps {
  productId: string;
  mode: 'create' | 'edit';
  variantId?: string;
  defaultValues?: {
    color?: string;
    size?: string;
    sku?: string;
    price?: number | null; // cents
    stock?: number;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

function centsToDisplay(cents?: number | null): string {
  if (cents == null) return '';
  return (cents / 100).toFixed(2);
}

export default function VariantForm({
  productId,
  mode,
  variantId,
  defaultValues = {},
  onSuccess,
  onCancel,
}: VariantFormProps) {
  const action =
    mode === 'edit' && variantId
      ? updateVariant.bind(null, variantId, productId)
      : createVariant.bind(null, productId);

  const [state, formAction, isPending] = useActionState<
    VariantFormState,
    FormData
  >(action, {});

  useEffect(() => {
    if (state.message === 'ok') onSuccess?.();
  }, [state.message, onSuccess]);

  const err = state.errors ?? {};

  return (
    <form action={formAction} className="space-y-3">
      {state.message && state.message !== 'ok' && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Color</label>
          <input
            name="color"
            defaultValue={defaultValues.color ?? ''}
            placeholder="e.g. Blue"
            className={field(!!err.color)}
          />
          {err.color && <p className="text-xs text-red-600">{err.color[0]}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Size</label>
          <input
            name="size"
            defaultValue={defaultValues.size ?? ''}
            placeholder="e.g. M"
            className={field(!!err.size)}
          />
          {err.size && <p className="text-xs text-red-600">{err.size[0]}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">SKU</label>
          <input
            name="sku"
            defaultValue={defaultValues.sku ?? ''}
            placeholder="Optional"
            className={field(!!err.sku)}
          />
          {err.sku && <p className="text-xs text-red-600">{err.sku[0]}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">
            Price <span className="text-gray-400">(override)</span>
          </label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              $
            </span>
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={centsToDisplay(defaultValues.price)}
              placeholder="Base price"
              className={field(!!err.price) + ' pl-5'}
            />
          </div>
          {err.price && <p className="text-xs text-red-600">{err.price[0]}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Stock</label>
          <input
            name="stock"
            type="number"
            min="0"
            step="1"
            defaultValue={defaultValues.stock ?? 0}
            className={field(!!err.stock)}
          />
          {err.stock && <p className="text-xs text-red-600">{err.stock[0]}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-gray-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Saving…' : mode === 'edit' ? 'Update' : 'Add Variant'}
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
