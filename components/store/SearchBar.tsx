'use client';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTransition, useState } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';

/**
 * Filter panel for the products page — price range and sort.
 * The text search input itself now lives in NavSearchBar (navbar),
 * so this component only handles filtering, not search submission.
 */
export default function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') ?? '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') ?? '');
  const sort = searchParams.get('sort') ?? '';
  const q = searchParams.get('q') ?? '';

  function buildParams(overrides: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    params.delete('page');
    return params.toString();
  }

  function handleSort(s: string) {
    startTransition(() => {
      router.push(`${pathname}?${buildParams({ sort: s })}`);
    });
  }

  function handleApplyPrice() {
    startTransition(() => {
      router.push(`${pathname}?${buildParams({ minPrice, maxPrice })}`);
    });
  }

  function handleClear() {
    setMinPrice('');
    setMaxPrice('');
    startTransition(() => router.push(pathname));
  }

  const hasFilters = q || minPrice || maxPrice || sort;

  return (
    <div className="space-y-3">
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          className="rounded-lg px-3 py-2.5 text-sm font-medium transition-colors flex items-center gap-1.5"
          style={{
            background: showFilters ? 'var(--navy-900)' : 'var(--bg-elevated)',
            color: showFilters ? '#fff' : 'var(--text-secondary)',
            border: '1px solid var(--border-base)',
          }}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filters</span>
        </button>
        {hasFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg px-3 py-2.5 text-sm font-medium transition-colors flex items-center gap-1.5"
            style={{
              background: 'var(--error-bg)',
              color: 'var(--error-text)',
              border: '1px solid rgba(220,38,38,0.2)',
            }}
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div
          className="rounded-xl border p-4 space-y-4"
          style={{
            background: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Price range */}
            <div className="space-y-1.5 sm:col-span-2">
              <label
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: 'var(--text-muted)' }}
              >
                Price Range ($)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min"
                  className="input-theme flex-1 px-3 py-2 text-sm"
                />
                <span style={{ color: 'var(--text-muted)' }}>—</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max"
                  className="input-theme flex-1 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={handleApplyPrice}
                  className="btn-navy rounded-lg px-4 py-2 text-xs font-semibold flex-shrink-0"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Sort */}
            <div className="space-y-1.5">
              <label
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: 'var(--text-muted)' }}
              >
                Sort By
              </label>
              <select
                value={sort}
                onChange={(e) => handleSort(e.target.value)}
                className="input-theme w-full px-3 py-2 text-sm"
              >
                <option value="">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A–Z</option>
                <option value="name-desc">Name: Z–A</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
