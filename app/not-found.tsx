import Link from 'next/link';
import { Home, Search, ShoppingBag } from 'lucide-react';
import BackButton from '@/components/BackButton';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-24">
        {/* 404 large display */}
        <div className="relative mb-8">
          <span className="text-[10rem] font-extrabold text-gray-100 leading-none select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <ShoppingBag
              className="w-20 h-20 text-gray-300"
              strokeWidth={1.2}
            />
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3 text-center">
          Page not found
        </h1>
        <p className="text-gray-500 text-center max-w-md mb-10 text-base leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 btn-primary text-white rounded-lg font-medium hover:bg-gray-700 transition-colors w-full"
          >
            <Home className="w-4 h-4" />
            Go home
          </Link>
          <Link
            href="/products"
            className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors w-full"
          >
            <Search className="w-4 h-4" />
            Browse products
          </Link>
        </div>

        {/* Back button — client component */}
        <BackButton />
      </div>

      {/* Quick links */}
      <div className="border-t border-gray-100 py-8 px-4">
        <p className="text-center text-sm text-gray-400 mb-4">Popular pages</p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {[
            { label: 'New Arrivals', href: '/products?sort=newest' },
            { label: 'Sale', href: '/products?sale=true' },
            { label: 'Track Order', href: '/track-order' },
            { label: 'Contact', href: '/contact' },
            { label: 'FAQs', href: '/faqs' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors underline-offset-2 hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
