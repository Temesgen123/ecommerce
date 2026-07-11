'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShoppingBag,
  Heart,
  Star,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
} from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { toggleWishlistItem } from '@/app/actions/wishlist';

interface Variant {
  id: string;
  color: string | null;
  size: string | null;
  price: number | null;
  stock: number;
  sku: string | null;
}

interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  authorName: string;
  createdAt: Date;
  verifiedPurchase: boolean;
}

interface ProductDetailProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    brand: string | null;
    price: number;
    compareAt: number | null;
    images: string[];
    category: { name: string; slug: string } | null;
    variants: Variant[];
    reviews: Review[];
    _count: { reviews: number };
  };
  isWishlisted: boolean;
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

function variantLabel(v: Variant): string {
  if (v.color && v.size) return `${v.color} / ${v.size}`;
  if (v.color) return v.color;
  if (v.size) return v.size;
  return 'Default';
}

export default function ProductDetail({
  product,
  isWishlisted,
}: ProductDetailProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [wishlisted, setWishlisted] = useState(isWishlisted);
  const [wishlistPending, setWishlistPending] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product.variants.find((v) => v.stock > 0)?.id ??
      product.variants[0]?.id ??
      null,
  );
  const [addedToCart, setAddedToCart] = useState(false);
  const [variantError, setVariantError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) ?? null;
  const effectivePrice = selectedVariant?.price ?? product.price;
  const inStock = selectedVariant ? selectedVariant.stock > 0 : false;
  const hasOptions = product.variants.some((v) => v.color || v.size);
  const colors = [
    ...new Set(product.variants.map((v) => v.color).filter(Boolean)),
  ] as string[];
  const sizes = [
    ...new Set(product.variants.map((v) => v.size).filter(Boolean)),
  ] as string[];
  const selectedColor = selectedVariant?.color ?? null;
  const selectedSize = selectedVariant?.size ?? null;

  const discount =
    product.compareAt && product.compareAt > effectivePrice
      ? Math.round(
          ((product.compareAt - effectivePrice) / product.compareAt) * 100,
        )
      : null;

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
        product.reviews.length
      : null;

  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);

  function selectColor(color: string) {
    setVariantError(null);
    const match = product.variants.find(
      (v) =>
        v.color === color && (selectedSize ? v.size === selectedSize : true),
    );
    const fallback = product.variants.find((v) => v.color === color);
    setSelectedVariantId((match ?? fallback)?.id ?? null);
  }

  function selectSize(size: string) {
    setVariantError(null);
    const match = product.variants.find(
      (v) =>
        v.size === size && (selectedColor ? v.color === selectedColor : true),
    );
    const fallback = product.variants.find((v) => v.size === size);
    setSelectedVariantId((match ?? fallback)?.id ?? null);
  }

  function handleAddToCart() {
    if (!selectedVariantId || !selectedVariant) {
      setVariantError('Please select a variant.');
      return;
    }
    if (selectedVariant.stock <= 0) {
      setVariantError('This item is out of stock.');
      return;
    }
    addItem({
      id: product.id,
      variantId: selectedVariantId,
      variantLabel: hasOptions ? variantLabel(selectedVariant) : null,
      name: product.name,
      slug: product.slug,
      price: effectivePrice,
      image: product.images[0] ?? null,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
    openCart();
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleWishlist() {
    if (wishlistPending) return;
    setWishlistPending(true);
    setWishlisted((prev) => !prev); // optimistic update
    try {
      await toggleWishlistItem(product.id);
    } catch {
      setWishlisted((prev) => !prev); // revert on error
    } finally {
      setWishlistPending(false);
    }
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `Check out ${product.name}`;

  return (
    <div
      className="mx-auto max-w-6xl px-4 py-10 sm:px-6"
      style={{ color: 'var(--text-primary)' }}
    >
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* ── Image gallery ───────────────────────────────── */}
        <div className="relative">
          <div
            className="relative aspect-square w-full overflow-hidden rounded-2xl"
            style={{ background: 'var(--bg-elevated)' }}
          >
            {product.images.length > 0 ? (
              <Image
                src={product.images[currentImage]}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div
                className="flex h-full items-center justify-center"
                style={{ color: 'var(--text-muted)' }}
              >
                No image
              </div>
            )}

            {/* Prev/Next arrows */}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setCurrentImage(
                      (currentImage - 1 + product.images.length) %
                        product.images.length,
                    )
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-2 shadow-md transition-colors"
                  style={{ background: 'rgba(255,255,255,0.9)' }}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() =>
                    setCurrentImage((currentImage + 1) % product.images.length)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 shadow-md transition-colors"
                  style={{ background: 'rgba(255,255,255,0.9)' }}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                {/* Image counter */}
                <div
                  className="absolute bottom-3 left-3 rounded-full px-2.5 py-1 text-xs font-semibold"
                  style={{ background: 'rgba(0,0,0,0.5)', color: '#fff' }}
                >
                  {currentImage + 1} / {product.images.length}
                </div>
              </>
            )}

            {/* Sale badge */}
            {discount && (
              <div
                className="absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                SALE
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImage(i)}
                  className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg transition-all"
                  style={{
                    border:
                      i === currentImage
                        ? '2px solid var(--accent)'
                        : '2px solid transparent',
                    opacity: i === currentImage ? 1 : 0.6,
                  }}
                >
                  <Image
                    src={img}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product info ────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          {/* Category */}
          {product.category && (
            <Link
              href={`/products?category=${product.category.slug}`}
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: 'var(--text-muted)' }}
            >
              {product.category.name}
            </Link>
          )}

          {/* Name */}
          <h1 className="text-3xl font-bold leading-tight">{product.name}</h1>

          {/* Brand */}
          {product.brand && (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              by <span className="font-medium">{product.brand}</span>
            </p>
          )}

          {/* Rating */}
          {avgRating !== null && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-4 w-4"
                    style={{
                      fill:
                        star <= Math.round(avgRating)
                          ? '#f59e0b'
                          : 'transparent',
                      color:
                        star <= Math.round(avgRating)
                          ? '#f59e0b'
                          : 'var(--border-base)',
                    }}
                  />
                ))}
              </div>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {avgRating.toFixed(1)} ({product._count.reviews} review
                {product._count.reviews !== 1 ? 's' : ''})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span
              className="text-3xl font-bold"
              style={{ color: 'var(--accent)' }}
            >
              {formatPrice(effectivePrice)}
            </span>
            {product.compareAt && product.compareAt > effectivePrice && (
              <>
                <span
                  className="text-lg line-through"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {formatPrice(product.compareAt)}
                </span>
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                  style={{
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  SALE
                </span>
              </>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              {product.description}
            </p>
          )}

          {/* Stock status */}
          <p
            className="text-sm font-medium"
            style={{
              color:
                totalStock === 0
                  ? '#dc2626'
                  : totalStock < 5
                    ? '#d97706'
                    : '#16a34a',
            }}
          >
            {totalStock === 0
              ? '✗ Out of stock'
              : `✓ In stock (${totalStock} available)`}
          </p>

          {/* ── Variant picker ────────────────────────────── */}
          {hasOptions && (
            <div
              className="space-y-4 rounded-xl border p-4"
              style={{
                borderColor: 'var(--border-subtle)',
                background: 'var(--bg-surface)',
              }}
            >
              {colors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold">
                    Color
                    {selectedColor && (
                      <span
                        className="ml-2 font-normal"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        — {selectedColor}
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => {
                      const isSelected = selectedColor === color;
                      const hasStock = product.variants.some(
                        (v) => v.color === color && v.stock > 0,
                      );
                      return (
                        <button
                          key={color}
                          onClick={() => selectColor(color)}
                          disabled={!hasStock}
                          className="rounded-lg border px-4 py-0 text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:line-through"
                          style={{
                            borderColor: isSelected
                              ? 'var(--accent)'
                              : 'var(--border-base)',
                            background: isSelected
                              ? 'rgba(249,115,22,0.08)'
                              : 'white',
                            color: isSelected
                              ? 'var(--accent)'
                              : 'var(--text-secondary)',
                            boxShadow: isSelected
                              ? '0 0 0 1.5px var(--accent)'
                              : 'none',
                          }}
                        >
                          {color}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {sizes.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold">
                    Size
                    {selectedSize && (
                      <span
                        className="ml-2 font-normal"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        — {selectedSize}
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => {
                      const isSelected = selectedSize === size;
                      const hasStock = product.variants.some(
                        (v) =>
                          v.size === size &&
                          (selectedColor ? v.color === selectedColor : true) &&
                          v.stock > 0,
                      );
                      return (
                        <button
                          key={size}
                          onClick={() => selectSize(size)}
                          disabled={!hasStock}
                          className="min-w-[44px] rounded-lg border px-3 py-0 text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:line-through"
                          style={{
                            borderColor: isSelected
                              ? 'var(--accent)'
                              : 'var(--border-base)',
                            background: isSelected
                              ? 'rgba(249,115,22,0.08)'
                              : 'white',
                            color: isSelected
                              ? 'var(--accent)'
                              : 'var(--text-secondary)',
                            boxShadow: isSelected
                              ? '0 0 0 1.5px var(--accent)'
                              : 'none',
                          }}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {variantError && (
            <p
              className="text-sm font-medium"
              style={{ color: 'var(--error-text)' }}
            >
              {variantError}
            </p>
          )}

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={!inStock && hasOptions}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-base font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: addedToCart ? '#16a34a' : 'var(--accent)',
              color: '#fff',
            }}
          >
            {addedToCart ? (
              <>
                <Check className="h-5 w-5" /> Added to Cart!
              </>
            ) : (
              <>
                <ShoppingBag className="h-5 w-5" />
                {!inStock && hasOptions ? 'Out of Stock' : 'Add to Cart'}
              </>
            )}
          </button>

          {/* SKU */}
          {selectedVariant?.sku && (
            <p
              className="text-xs font-mono"
              style={{ color: 'var(--text-muted)' }}
            >
              SKU: {selectedVariant.sku}
            </p>
          )}

          {/* Share */}
          <div className="space-y-2">
            <p
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: 'var(--text-muted)' }}
            >
              Share
            </p>
            <div className="flex flex-wrap gap-1">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors hover:bg-gray-300"
                style={{ borderColor: 'var(--border-base)' }}
              >
                <svg
                  className="h-4 w-4 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
                Facebook
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors hover:bg-gray-300"
                style={{ borderColor: 'var(--border-base)' }}
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                X (Twitter)
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors hover:bg-gray-300"
                style={{ borderColor: 'var(--border-base)' }}
              >
                <svg
                  className="h-4 w-4 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.845L.057 24l6.305-1.654A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.663-.525-5.176-1.437l-.371-.221-3.844 1.008 1.027-3.748-.242-.386A9.953 9.953 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                </svg>
                WhatsApp
              </a>
              <a
                href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors hover:bg-gray-300"
                style={{ borderColor: 'var(--border-base)' }}
              >
                <svg
                  className="h-4 w-4 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
                </svg>
                Pinterest
              </a>
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors hover:bg-gray-300"
                style={{ borderColor: 'var(--border-base)' }}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy
                    className="h-4 w-4"
                    style={{ color: 'var(--text-muted)' }}
                  />
                )}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            disabled={wishlistPending}
            className="flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-50 hover:bg-gray-300"
            style={{
              color: wishlisted ? '#ef4444' : 'var(--text-muted)',
            }}
          >
            <Heart className="h-4 w-4" fill={wishlisted ? '#ef4444' : 'none'} />
            {wishlisted ? 'Saved to Wishlist' : 'Save to Wishlist'}
          </button>
        </div>
      </div>

      {/* ── Reviews ─────────────────────────────────────── */}
      {product.reviews.length > 0 && (
        <div className="mt-16 space-y-6">
          <h2 className="text-xl font-bold">
            Customer Reviews ({product._count.reviews})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {product.reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-xl border p-5 space-y-2"
                style={{
                  background: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="h-3.5 w-3.5"
                        style={{
                          fill:
                            star <= review.rating ? '#f59e0b' : 'transparent',
                          color:
                            star <= review.rating
                              ? '#f59e0b'
                              : 'var(--border-base)',
                        }}
                      />
                    ))}
                  </div>
                  {review.verifiedPurchase && (
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-semibold"
                      style={{ background: '#dcfce7', color: '#16a34a' }}
                    >
                      ✓ Verified
                    </span>
                  )}
                </div>
                {review.title && (
                  <p className="text-sm font-semibold">{review.title}</p>
                )}
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {review.body}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {review.authorName} ·{' '}
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
