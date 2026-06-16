'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Home, RefreshCw, AlertTriangle } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console (replace with your error tracking e.g. Sentry)
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-24">
      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-8">
        <AlertTriangle className="w-9 h-9 text-red-400" strokeWidth={1.5} />
      </div>

      {/* Message */}
      <h1 className="text-3xl font-bold text-gray-900 mb-3 text-center">
        Something went wrong
      </h1>
      <p className="text-gray-500 text-center max-w-md mb-2 text-base leading-relaxed">
        We hit an unexpected error. This has been noted and we&apos;ll look into
        it.
      </p>

      {/* Error digest for support reference */}
      {error.digest && (
        <p className="text-xs text-gray-400 mb-8 font-mono bg-gray-50 px-3 py-1.5 rounded">
          Error ID: {error.digest}
        </p>
      )}

      {!error.digest && <div className="mb-8" />}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <button
          onClick={reset}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors w-full"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </button>
        <Link
          href="/"
          className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors w-full"
        >
          <Home className="w-4 h-4" />
          Go home
        </Link>
      </div>

      {/* Contact support */}
      <p className="mt-8 text-sm text-gray-400">
        Problem persisting?{' '}
        <Link
          href="/contact"
          className="text-gray-600 hover:text-gray-900 underline underline-offset-2 transition-colors"
        >
          Contact support
        </Link>
      </p>
    </div>
  );
}
