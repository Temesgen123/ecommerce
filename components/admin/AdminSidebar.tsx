'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tag,
  LogOut,
} from 'lucide-react';

interface AdminSidebarProps {
  user: { name?: string | null; email?: string | null };
}

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Categories', href: '/admin/categories', icon: Tag },
];

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className="flex h-screen w-56 flex-shrink-0 flex-col"
      style={{
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
      }}
    >
      {/* Logo */}
      <div
        className="flex h-16 items-center px-5"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <span
          className="text-base font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          My<span style={{ color: 'var(--accent)' }}>Store</span>
          <span
            className="ml-2 text-xs font-normal"
            style={{ color: 'var(--text-muted)' }}
          >
            Admin
          </span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all"
              style={
                isActive
                  ? {
                      background: 'var(--accent-subtle)',
                      color: 'var(--accent-light)',
                      borderLeft: '2px solid var(--accent)',
                    }
                  : { color: 'var(--text-secondary)' }
              }
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User + sign out */}
      <div
        className="p-3"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        <div className="mb-2 px-3 py-1">
          <p
            className="truncate text-xs font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            {user.name ?? 'Admin'}
          </p>
          <p
            className="truncate text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            {user.email}
          </p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              'var(--error-bg)';
            (e.currentTarget as HTMLElement).style.color = 'var(--error-text)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color =
              'var(--text-secondary)';
          }}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
