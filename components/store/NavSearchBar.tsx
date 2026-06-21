'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Search } from 'lucide-react';

/**
 * Lightweight search input for the navbar — works from any page.
 * Always submits to /products?q=... regardless of current route.
 * Filters (price/sort) intentionally live only on the products
 * page itself (see trimmed-down SearchBar there), since they're
 * only meaningful in that filtering context.
 */
export default function NavSearchBar() {
  const router = useRouter();
  const [value, setValue] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    startTransition(() => {
      router.push(
        trimmed ? `/products?q=${encodeURIComponent(trimmed)}` : '/products',
      );
    });
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <Search
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none"
        style={{ color: isPending ? 'var(--accent)' : 'var(--navy-100)' }}
      />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search products…"
        autoComplete="off"
        className="w-full rounded-full py-2 pl-9 pr-4 text-sm outline-none transition-colors"
        style={{
          background: 'var(--navy-bg)',
          color: '#fff',
          border: '1px solid var(--navy-700)',
        }}
      />
    </form>
  );
}
