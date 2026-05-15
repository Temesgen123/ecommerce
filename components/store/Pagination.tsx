'use client';

import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  totalPages: number;
  currentPage: number;
}

export default function Pagination({
  totalPages,
  currentPage,
}: PaginationProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  if (totalPages <= 1) return null;

  function buildUrl(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', String(page));
    }
    const qs = params.toString();
    return `${pathname}${qs ? `?${qs}` : ''}`;
  }

  // Build page number list with ellipsis
  function getPages(): (number | '...')[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | '...')[] = [1];
    if (currentPage > 3) pages.push('...');
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  }

  const pages = getPages();

  return (
    <nav
      className="flex items-center justify-center gap-1 pt-10"
      aria-label="Pagination"
    >
      {/* Prev */}
      {currentPage > 1 ? (
        <Link
          href={buildUrl(currentPage - 1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border transition-colors"
          style={{
            borderColor: 'var(--border-base)',
            color: 'var(--text-secondary)',
          }}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span
          className="flex h-9 w-9 items-center justify-center rounded-lg border opacity-30 cursor-not-allowed"
          style={{
            borderColor: 'var(--border-subtle)',
            color: 'var(--text-muted)',
          }}
        >
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {/* Page numbers */}
      {pages.map((page, i) =>
        page === '...' ? (
          <span
            key={`ellipsis-${i}`}
            className="flex h-9 w-9 items-center justify-center text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            …
          </span>
        ) : (
          <Link
            key={page}
            href={buildUrl(page)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors"
            style={
              page === currentPage
                ? {
                    background: 'var(--navy-900)',
                    color: '#fff',
                    borderColor: 'var(--navy-900)',
                  }
                : {
                    borderColor: 'var(--border-base)',
                    color: 'var(--text-secondary)',
                  }
            }
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </Link>
        ),
      )}

      {/* Next */}
      {currentPage < totalPages ? (
        <Link
          href={buildUrl(currentPage + 1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border transition-colors"
          style={{
            borderColor: 'var(--border-base)',
            color: 'var(--text-secondary)',
          }}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span
          className="flex h-9 w-9 items-center justify-center rounded-lg border opacity-30 cursor-not-allowed"
          style={{
            borderColor: 'var(--border-subtle)',
            color: 'var(--text-muted)',
          }}
        >
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
