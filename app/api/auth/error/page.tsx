// app/api/auth/error/page.tsx
// NextAuth redirects here on sign-in failure with ?error=AccessDenied

import Link from 'next/link';
import { ShieldAlert, Home } from 'lucide-react';

interface Props {
  searchParams: Promise<{ error?: string }>;
}
const errorMessages: Record<string, { title: string; description: string }> = {
  AccessDenied: {
    title: 'Too many login attempts',
    description:
      "You've made too many login attempts. Please wait 15 minutes before trying again.",
  },
  Verification: {
    title: 'Link expired',
    description: 'This sign-in link has expired or already been used.',
  },
  Default: {
    title: 'Sign-in failed',
    description: 'Something went wrong during sign-in. Please try again.',
  },
};

export default async function AuthErrorPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const { title, description } =
    errorMessages[error ?? 'Default'] ?? errorMessages.Default;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-24">
      <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-8">
        <ShieldAlert className="w-9 h-9 text-red-400" strokeWidth={1.5} />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-3 text-center">
        {title}
      </h1>
      <p className="text-gray-500 text-center max-w-sm mb-10 text-base leading-relaxed">
        {description}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <Link
          href="/admin/login"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors w-full"
        >
          Try again
        </Link>
        <Link
          href="/"
          className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors w-full"
        >
          <Home className="w-4 h-4" />
          Go home
        </Link>
      </div>
    </div>
  );
}
