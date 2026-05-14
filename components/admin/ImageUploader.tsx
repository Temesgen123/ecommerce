'use client';

import { useState, useRef, useTransition } from 'react';
import { Upload, X, ImagePlus, Loader2 } from 'lucide-react';
import { uploadProductImage } from '@/app/actions/upload';

interface ImageUploaderProps {
  value: string[]; // current image URLs
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

export default function ImageUploader({
  value = [],
  onChange,
  maxImages = 5,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);

    const remaining = maxImages - value.length;
    const toUpload = Array.from(files).slice(0, remaining);

    if (files.length > remaining) {
      setError(`You can only upload ${maxImages} images total.`);
    }

    for (let i = 0; i < toUpload.length; i++) {
      const file = toUpload[i];

      // Validate
      if (!file.type.startsWith('image/')) {
        setError(`"${file.name}" is not an image.`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError(`"${file.name}" is too large. Max 10 MB.`);
        continue;
      }

      setUploadingIdx(value.length + i);

      const formData = new FormData();
      formData.append('file', file);

      startTransition(async () => {
        try {
          const url = await uploadProductImage(formData);
          onChange([...value, url]);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Upload failed.');
        } finally {
          setUploadingIdx(null);
        }
      });
    }
  }

  function removeImage(index: number) {
    const next = value.filter((_, i) => i !== index);
    onChange(next);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  const canUploadMore = value.length < maxImages;

  return (
    <div className="space-y-3">
      {/* Image previews */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {value.map((url, i) => (
            <div
              key={url}
              className="group relative aspect-square overflow-hidden rounded-lg border"
              style={{
                borderColor: 'var(--border-base)',
                background: 'var(--bg-elevated)',
              }}
            >
              <img
                src={url}
                alt={`Product image ${i + 1}`}
                className="h-full w-full object-cover"
              />
              {/* First image badge */}
              {i === 0 && (
                <span
                  className="absolute bottom-1 left-1 rounded px-1.5 py-0.5 text-xs font-medium"
                  style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}
                >
                  Main
                </span>
              )}
              {/* Delete button */}
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute right-1 top-1 rounded-full p-1 opacity-0 transition-opacity group-hover:opacity-100"
                style={{ background: 'rgba(239,68,68,0.9)', color: '#fff' }}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}

          {/* Uploading placeholder */}
          {isPending && (
            <div
              className="flex aspect-square items-center justify-center rounded-lg border"
              style={{
                borderColor: 'var(--border-base)',
                background: 'var(--bg-elevated)',
              }}
            >
              <Loader2
                className="h-6 w-6 animate-spin"
                style={{ color: 'var(--text-muted)' }}
              />
            </div>
          )}
        </div>
      )}

      {/* Drop zone */}
      {canUploadMore && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-8 transition-colors"
          style={{
            borderColor: isDragging ? 'var(--navy-500)' : 'var(--border-base)',
            background: isDragging ? 'var(--navy-50)' : 'var(--bg-elevated)',
          }}
        >
          {isPending ? (
            <Loader2
              className="h-8 w-8 animate-spin"
              style={{ color: 'var(--navy-500)' }}
            />
          ) : (
            <ImagePlus
              className="h-8 w-8"
              style={{ color: 'var(--text-muted)' }}
            />
          )}
          <div className="text-center">
            <p
              className="text-sm font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              {isPending ? 'Uploading…' : 'Drop images here or click to browse'}
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: 'var(--text-muted)' }}
            >
              PNG, JPG, WEBP up to 10 MB · {value.length}/{maxImages} uploaded
            </p>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <p
          className="text-xs font-medium"
          style={{ color: 'var(--error-text)' }}
        >
          {error}
        </p>
      )}

      {/* Hidden inputs to submit URLs with the form */}
      {value.map((url, i) => (
        <input key={i} type="hidden" name={`images[${i}]`} value={url} />
      ))}
    </div>
  );
}
