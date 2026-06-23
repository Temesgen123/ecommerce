'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/driver/login' })}
      className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
      style={{
        background: 'var(--bg-elevated)',
        color: 'var(--text-secondary)',
        border: '1px solid var(--border-base)',
      }}
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </button>
  );
}
