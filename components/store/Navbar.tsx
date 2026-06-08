'use client';
import Link from 'next/link';
import { ShoppingBag, Heart, User } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { useEffect, useState } from 'react';

interface NavbarProps {
  customerName?: string | null;
  wishlistCount?: number;
}

export default function Navbar({
  customerName,
  wishlistCount = 0,
}: NavbarProps) {
  const totalItems = useCartStore((s) => s.totalItems());
  const openCart = useCartStore((s) => s.openCart);
  const [mounted, setMounted] = useState(false);
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
          {[
            { href: '/products', label: 'Products' },
            { href: '/track-order', label: 'Track Order' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium transition-colors"
              style={{ color: 'var(--navy-100)' }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.color = '#fff')
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.color =
                  'var(--navy-100)')
              }
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <Link
            href={customerName ? '/account' : '/account/login'}
            className="relative rounded-lg p-2 transition-colors flex items-center gap-1.5"
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
            <User className="h-5 w-5" />
            {customerName && (
              <span className="hidden sm:block text-xs font-medium max-w-20 truncate">
                {customerName.split(' ')[0]}
              </span>
            )}
          </Link>

          {/* Wishlist */}
          <Link
            href="/account/wishlist"
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
            <Heart className="h-5 w-5" />
            {wishlistCount > 0 && (
              <span
                className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold"
                style={{ background: '#EF4444', color: '#fff' }}
              >
                {wishlistCount > 9 ? '9+' : wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart */}
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
      </div>
    </header>
  );
}
