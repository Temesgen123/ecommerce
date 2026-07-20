'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Trash2, Plus, Search, Loader2 } from 'lucide-react';
import {
  addBundleProduct,
  removeBundleProduct,
  searchProductsForBundle,
} from '@/app/actions/products';

interface BundleProduct {
  id: string;
  name: string;
  price: number;
  images: string[];
}

interface Props {
  productId: string;
  initialBundleProducts: BundleProduct[];
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export default function BundleManager({
  productId,
  initialBundleProducts,
}: Props) {
  const [bundleProducts, setBundleProducts] = useState<BundleProduct[]>(
    initialBundleProducts,
  );
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BundleProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const res = await searchProductsForBundle(productId, query);
      setResults(res);
      setSearching(false);
    }, 300);
  }, [query, productId]);

  function handleAdd(product: BundleProduct) {
    setError(null);
    startTransition(async () => {
      const result = await addBundleProduct(productId, product.id);
      if (result.error) {
        setError(result.error);
        return;
      }
      setBundleProducts((prev) => [...prev, product]);
      setResults((prev) => prev.filter((p) => p.id !== product.id));
      setQuery('');
    });
  }

  function handleRemove(bundledProductId: string) {
    startTransition(async () => {
      await removeBundleProduct(productId, bundledProductId);
      setBundleProducts((prev) =>
        prev.filter((p) => p.id !== bundledProductId),
      );
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-1">
          Frequently Bought Together
        </h3>
        <p className="text-xs text-gray-500">
          Add up to 4 products to show in a bundle on the product page.
        </p>
      </div>

      {/* Current bundle products */}
      {bundleProducts.length > 0 ? (
        <div className="space-y-2">
          {bundleProducts.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2"
            >
              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded">
                {p.images[0] ? (
                  <Image
                    src={p.images[0]}
                    alt={p.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-100" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-800">
                  {p.name}
                </p>
                <p className="text-xs text-gray-500">{formatPrice(p.price)}</p>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(p.id)}
                disabled={isPending}
                className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400 italic">
          No bundle products added yet.
        </p>
      )}

      {/* Add product search — only show if under 4 */}
      {bundleProducts.length < 4 && (
        <div className="relative">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
            {searching ? (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            ) : (
              <Search className="h-4 w-4 text-gray-400" />
            )}
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products to add..."
              className="flex-1 text-sm outline-none placeholder:text-gray-400"
            />
          </div>

          {/* Dropdown results */}
          {results.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
              {results.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleAdd(p)}
                  disabled={isPending}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors disabled:opacity-50 first:rounded-t-lg last:rounded-b-lg"
                >
                  <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded">
                    {p.images[0] ? (
                      <Image
                        src={p.images[0]}
                        alt={p.name}
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-100" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-800">
                      {p.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatPrice(p.price)}
                    </p>
                  </div>
                  <Plus className="h-4 w-4 flex-shrink-0 text-gray-400" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
