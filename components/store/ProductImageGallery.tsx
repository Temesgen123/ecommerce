'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductImageGallery({
  images,
  productName,
}: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // Fallback — no images
  if (images.length === 0) {
    return (
      <div
        className="flex aspect-square w-full items-center justify-center rounded-2xl"
        style={{ background: 'var(--bg-elevated)' }}
      >
        <svg
          className="h-24 w-24 opacity-20"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  function prev() {
    setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }

  function next() {
    setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div
        className="relative group aspect-square w-full overflow-hidden rounded-2xl"
        style={{ background: 'var(--bg-elevated)' }}
      >
        <img
          src={images[activeIndex]}
          alt={`${productName} — image ${activeIndex + 1}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-zoom-in"
          onClick={() => setIsZoomed(true)}
        />

        {/* Prev / Next arrows — only show if multiple images */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              style={{
                background: 'rgba(255,255,255,0.9)',
                color: 'var(--text-primary)',
              }}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              style={{
                background: 'rgba(255,255,255,0.9)',
                color: 'var(--text-primary)',
              }}
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Zoom hint */}
        <div
          className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'rgba(0,0,0,0.5)', color: '#fff' }}
        >
          <ZoomIn className="h-3 w-3" />
          Click to zoom
        </div>

        {/* Image counter */}
        {images.length > 1 && (
          <div
            className="absolute bottom-3 left-3 rounded-full px-2.5 py-1 text-xs font-medium"
            style={{ background: 'rgba(0,0,0,0.5)', color: '#fff' }}
          >
            {activeIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((url, i) => (
            <button
              key={url}
              onClick={() => setActiveIndex(i)}
              className="flex-shrink-0 h-16 w-16 overflow-hidden rounded-lg border-2 transition-all"
              style={{
                borderColor:
                  i === activeIndex ? 'var(--navy-700)' : 'transparent',
                opacity: i === activeIndex ? 1 : 0.6,
              }}
              aria-label={`View image ${i + 1}`}
            >
              <img
                src={url}
                alt={`${productName} thumbnail ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox / zoom modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.9)' }}
          onClick={() => setIsZoomed(false)}
        >
          <button
            className="absolute right-4 top-4 rounded-full p-2 text-white hover:bg-white/10 transition-colors"
            onClick={() => setIsZoomed(false)}
            aria-label="Close zoom"
          >
            ✕
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full p-3 text-white hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-3 text-white hover:bg-white/10 transition-colors"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <img
            src={images[activeIndex]}
            alt={`${productName} zoomed`}
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
