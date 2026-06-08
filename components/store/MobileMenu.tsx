'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Menu,
  X,
  ShoppingBag,
  Heart,
  User,
  Home,
  Package,
  MapPin,
  Info,
  Mail,
  HelpCircle,
} from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';

interface Props {
  customerName?: string | null;
}

const navLinks = [
  { href: '/', label: 'Home', icon: <Home className="h-4 w-4" /> },
  {
    href: '/products',
    label: 'Products',
    icon: <Package className="h-4 w-4" />,
  },
  {
    href: '/track-order',
    label: 'Track Order',
    icon: <MapPin className="h-4 w-4" />,
  },
  { href: '/about', label: 'About Us', icon: <Info className="h-4 w-4" /> },
  { href: '/contact', label: 'Contact', icon: <Mail className="h-4 w-4" /> },
  { href: '/faqs', label: 'FAQs', icon: <HelpCircle className="h-4 w-4" /> },
];

const accountLinks = [
  { href: '/account', label: 'My Account', icon: <User className="h-4 w-4" /> },
  {
    href: '/account/orders',
    label: 'My Orders',
    icon: <Package className="h-4 w-4" />,
  },
  {
    href: '/account/wishlist',
    label: 'Wishlist',
    icon: <Heart className="h-4 w-4" />,
  },
];

export default function MobileMenu({ customerName }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const openCart = useCartStore((s) => s.openCart);
  const totalItems = useCartStore((s) => s.totalItems());

  const close = () => setIsOpen(false);

  return (
    <>
      {/* Hamburger button — mobile only */}
      <button
        onClick={() => setIsOpen(true)}
        className="sm:hidden rounded-lg p-2 transition-colors"
        style={{ color: 'var(--navy-100)' }}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 sm:hidden"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={close}
        />
      )}

      {/* Slide-in drawer */}
      <div
        className="fixed top-0 left-0 h-full w-72 z-50 sm:hidden flex flex-col transition-transform duration-300"
        style={{
          background: 'var(--navy-900)',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          borderRight: '1px solid var(--navy-700)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-4"
          style={{ borderBottom: '1px solid var(--navy-800)' }}
        >
          <Link
            href="/"
            onClick={close}
            className="text-lg font-bold text-white"
          >
            My<span style={{ color: 'var(--accent)' }}>Store</span>
          </Link>
          <button
            onClick={close}
            className="rounded-lg p-1.5 transition-colors"
            style={{ color: 'var(--navy-300)' }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Customer greeting */}
        {customerName && (
          <div
            className="px-4 py-3 text-sm"
            style={{
              background: 'var(--navy-800)',
              borderBottom: '1px solid var(--navy-700)',
              color: 'var(--navy-100)',
            }}
          >
            👋 Hello,{' '}
            <span className="font-semibold text-white">
              {customerName.split(' ')[0]}
            </span>
          </div>
        )}

        {/* Nav links */}
        <div className="flex-1 overflow-y-auto py-4">
          <p
            className="px-4 text-xs font-bold uppercase tracking-widest mb-2"
            style={{ color: 'var(--navy-400)' }}
          >
            Navigation
          </p>
          <ul>
            {navLinks.map(({ href, label, icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={close}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-navy-800"
                  style={{ color: 'var(--navy-100)' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      'var(--navy-800)';
                    (e.currentTarget as HTMLElement).style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      'transparent';
                    (e.currentTarget as HTMLElement).style.color =
                      'var(--navy-100)';
                  }}
                >
                  <span style={{ color: 'var(--navy-400)' }}>{icon}</span>
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Divider */}
          <div
            className="my-4 mx-4"
            style={{ borderTop: '1px solid var(--navy-800)' }}
          />

          {/* Account links */}
          <p
            className="px-4 text-xs font-bold uppercase tracking-widest mb-2"
            style={{ color: 'var(--navy-400)' }}
          >
            Account
          </p>
          <ul>
            {accountLinks.map(({ href, label, icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={close}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors"
                  style={{ color: 'var(--navy-100)' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      'var(--navy-800)';
                    (e.currentTarget as HTMLElement).style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      'transparent';
                    (e.currentTarget as HTMLElement).style.color =
                      'var(--navy-100)';
                  }}
                >
                  <span style={{ color: 'var(--navy-400)' }}>{icon}</span>
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Divider */}
          <div
            className="my-4 mx-4"
            style={{ borderTop: '1px solid var(--navy-800)' }}
          />

          {/* Quick actions */}
          <p
            className="px-4 text-xs font-bold uppercase tracking-widest mb-2"
            style={{ color: 'var(--navy-400)' }}
          >
            Quick Actions
          </p>
          <button
            onClick={() => {
              close();
              openCart();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors"
            style={{ color: 'var(--navy-100)' }}
          >
            <ShoppingBag
              className="h-4 w-4"
              style={{ color: 'var(--navy-400)' }}
            />
            Cart
            {totalItems > 0 && (
              <span
                className="ml-auto rounded-full px-2 py-0.5 text-xs font-bold"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Footer */}
        <div
          className="px-4 py-4"
          style={{ borderTop: '1px solid var(--navy-800)' }}
        >
          {customerName ? (
            <Link
              href="/account/logout"
              onClick={close}
              className="block w-full text-center rounded-lg py-2.5 text-sm font-semibold transition-colors"
              style={{
                border: '1px solid var(--navy-700)',
                color: 'var(--navy-300)',
              }}
            >
              Sign Out
            </Link>
          ) : (
            <div className="flex gap-2">
              <Link
                href="/account/login"
                onClick={close}
                className="flex-1 text-center rounded-lg py-2.5 text-sm font-semibold"
                style={{
                  border: '1px solid var(--navy-700)',
                  color: 'var(--navy-300)',
                }}
              >
                Sign In
              </Link>
              <Link
                href="/account/register"
                onClick={close}
                className="flex-1 text-center rounded-lg py-2.5 text-sm font-bold"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
