import NewsletterForm from '@/components/store/NewsletterForm';
import Link from 'next/link';
import { ShoppingBag, CreditCard } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      style={{
        background: 'var(--navy-900)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {/* Main footer grid */}
      <div className="mx-auto max-w-6xl px-4 pt-12 pb-8 sm:px-6">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand + Newsletter combined column */}
          <div className="col-span-2 lg:col-span-1">
            {/* Brand */}
            <div className="flex items-center gap-2 mb-3">
              <ShoppingBag
                className="w-5 h-5"
                style={{ color: 'var(--accent)' }}
              />
              <span className="text-base font-bold text-white">
                My<span style={{ color: 'var(--accent)' }}>Store</span>
              </span>
            </div>
            <p
              className="text-sm leading-relaxed mb-6"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              Your trusted marketplace for quality products delivered to your
              door.
            </p>

            {/* Newsletter embedded here */}
            <div
              className="rounded-xl p-4"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <p className="text-xs font-bold uppercase tracking-widest mb-3 text-white">
                Newsletter
              </p>
              <NewsletterForm />
            </div>
          </div>

          {/* Shop column */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-5 text-white">
              Shop
            </p>
            <ul className="space-y-3">
              {[
                { label: 'All Products', href: '/products' },
                { label: 'New Arrivals', href: '/products?sort=newest' },
                { label: 'Sale Items', href: '/products?sale=true' },
                { label: 'Track Order', href: '/track-order' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: 'rgba(255,255,255,0.65)' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account column */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-5 text-white">
              Account
            </p>
            <ul className="space-y-3">
              {[
                { label: 'Sign In', href: '/account/login' },
                { label: 'Create Account', href: '/account/register' },
                { label: 'Order History', href: '/account/orders' },
                { label: 'Wishlist', href: '/account/wishlist' },
                { label: 'Addresses', href: '/account/addresses' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: 'rgba(255,255,255,0.65)' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help column */}
          <div className="col-span-2 sm:col-span-1">
            <p className="text-xs font-bold uppercase tracking-widest mb-5 text-white">
              Help
            </p>
            <ul className="space-y-3 mb-8">
              {[
                { label: 'About Us', href: '/about' },
                { label: 'Gift Cards', href: '/gift-cards' },
                { label: 'Shipping Policy', href: '/shipping' },
                { label: 'Returns Policy', href: '/returns' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Contact Us', href: '/contact' },
                { label: 'FAQs', href: '/faqs' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: 'rgba(255,255,255,0.65)' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Payment */}
            <div
              className="rounded-lg p-3"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <p className="text-xs font-bold uppercase tracking-widest mb-2 text-white">
                We Accept
              </p>
              <div className="flex items-center gap-2">
                <CreditCard
                  className="w-4 h-4"
                  style={{ color: 'rgba(255,255,255,0.6)' }}
                />
                <span
                  className="text-xs"
                  style={{ color: 'rgba(255,255,255,0.6)' }}
                >
                  Visa · Mastercard · Amex
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            © {new Date().getFullYear()} MyStore. All rights reserved.
          </p>
          <div className="flex gap-4">
            {[
              { label: 'Privacy', href: '/privacy' },
              { label: 'Terms', href: '/terms' },
              { label: 'Sitemap', href: '/sitemap.xml' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs transition-colors hover:text-white"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
