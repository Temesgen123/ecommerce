'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';

export default function Navbar() {
  const totalItems = useCartStore((s) => s.totalItems());
  const openCart = useCartStore((s) => s.openCart);

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-md"
      style={{
        background: 'rgba(2, 11, 24, 0.85)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="text-lg font-bold tracking-tight transition-colors"
          style={{ color: 'var(--text-primary)' }}
        >
          My<span style={{ color: 'var(--accent)' }}>Store</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-6">
          <Link
            href="/products"
            className="text-sm transition-colors hover:opacity-100"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = 'var(--text-primary)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = 'var(--text-secondary)')
            }
          >
            Products
          </Link>
        </nav>

        {/* Cart */}
        <button
          onClick={openCart}
          className="relative rounded-lg p-2 transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              'var(--bg-elevated)';
            (e.currentTarget as HTMLElement).style.color =
              'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color =
              'var(--text-secondary)';
          }}
          aria-label="Open cart"
        >
          <ShoppingBag className="h-5 w-5" />
          {totalItems > 0 && (
            <span
              className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-xs font-semibold"
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
