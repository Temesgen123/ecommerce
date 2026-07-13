'use client';

import { useEffect, useState } from 'react';
import {
  useRecentlyViewedStore,
  type RecentlyViewedItem,
} from '@/lib/recently-viewed-store';
import ProductCard from '@/components/store/ProductCard';

interface Props {
  currentProductId: string;
}

export default function RecentlyViewed({ currentProductId }: Props) {
  const items = useRecentlyViewedStore((s) => s.items);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  // Exclude current product
  const filtered = items.filter((i) => i.id !== currentProductId);

  if (filtered.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h2
        className="text-xl font-bold mb-6"
        style={{ color: 'var(--text-primary)' }}
      >
        Recently Viewed
      </h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {filtered.slice(0, 4).map((item) => (
          <ProductCard
            key={item.id}
            id={item.id}
            name={item.name}
            slug={item.slug}
            price={item.price}
            compareAt={item.compareAt}
            image={item.image}
            category={item.category}
            variants={item.variants ?? []}
          />
        ))}
      </div>
    </section>
  );
}
