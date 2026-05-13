'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const totalItems = useCartStore((s) => s.totalItems());
  const openCart = useCartStore((s) => s.openCart);
  const [mounted, setMounted] = useState(false);

  // Only show cart count after hydration to avoid SSR mismatch
  useEffect(() => setMounted(true), []);

  return (
    <header
      className="sticky top-0 z-40"
      style={{
        background: 'var(--navy-900)',
        borderBottom: '1px solid var(--navy-800)',
      }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight"
          style={{ color: '#fff' }}
        >
          My<span style={{ color: 'var(--accent)' }}>Store</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-6">
          <Link
            href="/products"
            className="text-sm font-medium transition-colors"
            style={{ color: 'var(--navy-100)' }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.color = '#fff')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color = 'var(--navy-100)')
            }
          >
            Products
          </Link>
        </nav>

        <button
          onClick={openCart}
          aria-label="Open cart"
          className="relative rounded-lg p-2 transition-colors"
          style={{ color: 'var(--navy-100)' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              'var(--navy-800)';
            (e.currentTarget as HTMLElement).style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color = 'var(--navy-100)';
          }}
        >
          <ShoppingBag className="h-5 w-5" />
          {mounted && totalItems > 0 && (
            <span
              className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              {totalItems > 9 ? '9+' : totalItems}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
