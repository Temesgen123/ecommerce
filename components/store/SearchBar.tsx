'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTransition, useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [value, setValue] = useState(searchParams.get('q') ?? '');

  // Keep input in sync if user navigates back/forward
  useEffect(() => {
    setValue(searchParams.get('q') ?? '');
  }, [searchParams]);

  function updateSearch(term: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (term.trim()) {
      params.set('q', term.trim());
    } else {
      params.delete('q');
    }
    // Reset to page 1 on new search
    params.delete('page');
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateSearch(value);
  }

  function handleClear() {
    setValue('');
    updateSearch('');
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="relative flex items-center">
        {/* Search icon */}
        <Search
          className="absolute left-3 h-4 w-4 pointer-events-none"
          style={{ color: isPending ? 'var(--accent)' : 'var(--text-muted)' }}
        />

        {/* Input */}
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search products…"
          className="input-theme w-full py-2.5 pl-9 pr-10 text-sm"
          style={{ borderRadius: '0.625rem' }}
          autoComplete="off"
        />

        {/* Clear button */}
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 rounded transition-colors"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Pending indicator */}
      {isPending && (
        <div
          className="absolute bottom-0 left-0 h-0.5 animate-pulse rounded-full"
          style={{ width: '100%', background: 'var(--accent)' }}
        />
      )}
    </form>
  );
}
