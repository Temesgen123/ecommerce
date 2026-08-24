'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ShoppingBag, Heart, User } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { useEffect, useState } from 'react';
import MobileMenu from '@/components/store/MobileMenu';
import CategoryNavBar from '@/components/store/CategoryNavBar';
import NavSearchBar from '@/components/store/NavSearchBar';
import type { NavCategory } from '@/lib/category-tree';

interface NavbarProps {
  customerName?: string | null;
  wishlistCount?: number;
  categories?: NavCategory[];
}

export default function Navbar({
  customerName,
  wishlistCount = 0,
  categories = [],
}: NavbarProps) {
  const totalItems = useCartStore((s) => s.totalItems());
  const openCart = useCartStore((s) => s.openCart);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category') ?? undefined;

  return (
    <header
      className="sticky top-0 z-40 w-full"
      style={{
        background: 'var(--navy-900)',
        borderBottom: '1px solid var(--navy-800)',
        overflowX: 'hidden',
      }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Left — hamburger + logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <MobileMenu customerName={customerName} />
          <Link
            href="/"
            className="text-xl font-bold tracking-tight flex gap-3"
            style={{ color: '#fff' }}
          >
            <img
              src="/logo.png"
              alt="Logo"
              width={30}
              height={30}
              className="rounded-full hidden sm:block"
            />
            <span className="text-base font-bold text-white">
              Next<span style={{ color: 'var(--accent)' }}>Shop</span>
            </span>
          </Link>
        </div>

        {/* Center — search */}
        <div className="hidden flex-1 justify-center sm:flex">
          <div className="w-full max-w-md">
            <NavSearchBar />
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-6 flex-shrink-0">
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

        <div className="flex items-center gap-1 flex-shrink-0">
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

      {/* Mobile search */}
      <div className="px-4 pb-3 sm:hidden">
        <NavSearchBar />
      </div>

      {/* Category navigation bar */}
      {categories.length > 0 && (
        <CategoryNavBar
          categories={categories}
          activeCategory={activeCategory}
        />
      )}
    </header>
  );
}
