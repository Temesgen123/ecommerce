'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ImagePlus, X, Loader2 } from 'lucide-react';
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
    price?: number | null;
    stock?: number;
    image?: string | null;
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

  const [variantImage, setVariantImage] = useState<string>(
    defaultValues.image ?? '',
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.message === 'ok') onSuccess?.();
  }, [state.message, onSuccess]);

  const err = state.errors ?? {};

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be under 5MB.');
      return;
    }

    setUploadError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append(
        'upload_preset',
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
      );

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData },
      );

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setVariantImage(data.secure_url);
    } catch {
      setUploadError('Failed to upload image. Try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <form action={formAction} className="space-y-3">
      {state.message && state.message !== 'ok' && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
        {/* Color */}
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

        {/* Size */}
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

        {/* SKU */}
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

        {/* Price */}
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

        {/* Stock */}
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

        {/* Variant image */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">
            Image <span className="text-gray-400">(optional)</span>
          </label>

          {variantImage ? (
            <div className="relative h-[38px] w-[38px]">
              <Image
                src={variantImage}
                alt="Variant"
                fill
                sizes="38px"
                className="rounded-md object-cover border border-gray-200"
              />
              <button
                type="button"
                onClick={() => setVariantImage('')}
                className="absolute -right-1.5 -top-1.5 rounded-full bg-red-500 p-0.5 text-white shadow"
                title="Remove image"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex h-[38px] w-[38px] items-center justify-center rounded-md border-2 border-dashed border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              title="Upload variant image"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="h-4 w-4" />
              )}
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />

          {/* Hidden field carries the URL to the server action */}
          <input type="hidden" name="image" value={variantImage} />

          {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={isPending || uploading}
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
