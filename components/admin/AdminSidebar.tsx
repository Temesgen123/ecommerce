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
  Percent,
  Star,
  BarChart2,
  AlertTriangle,
  Boxes,
  Newspaper,
  HelpCircle,
  UserRound,
  CreditCard,
} from 'lucide-react';

interface AdminSidebarProps {
  user: { name?: string | null; email?: string | null };
}

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart2 },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Categories', href: '/admin/categories', icon: Tag },
  {
    label: 'Products (Bulk)',
    href: '/admin/products-bulk',
    icon: Boxes,
  },
  { label: 'Discounts', href: '/admin/discounts', icon: Percent },
  { label: 'Reviews', href: '/admin/reviews', icon: Star },
  { label: 'Stock Alerts', href: '/admin/stock-alerts', icon: AlertTriangle },
  { label: 'Customers', href: '/admin/customers', icon: UserRound },
  { label: 'Drivers', href: '/admin/drivers', icon: UserRound },
  { label: 'Gift Cards', href: '/admin/gift-cards', icon: CreditCard },
  { label: 'Newsletter', href: '/admin/newsletter', icon: Newspaper },
  { label: 'FAQs', href: '/admin/faqs', icon: HelpCircle },
];

<Link href="/admin/customers">Customers</Link>;
export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className="flex h-screen w-56 flex-shrink-0 flex-col bg-white"
      style={{ borderRight: '1px solid var(--border-subtle)' }}
    >
      {/* Logo */}
      <div
        className="flex h-16 items-center px-5"
        style={{
          background: 'var(--navy-900)',
          borderBottom: '1px solid var(--navy-800)',
        }}
      >
        <span className="text-base font-bold text-white">
          My<span style={{ color: 'var(--accent)' }}>Store</span>
          <span className="ml-2 text-xs font-normal opacity-60">Admin</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all"
              style={
                isActive
                  ? {
                      background: 'var(--navy-50)',
                      color: 'var(--navy-900)',
                      borderLeft: '3px solid var(--navy-700)',
                      paddingLeft: '9px',
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

      {/* User */}
      <div
        className="p-3"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        <div
          className="mb-2 rounded-lg px-3 py-2"
          style={{ background: 'var(--bg-elevated)' }}
        >
          <p
            className="truncate text-xs font-semibold"
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
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-red-50"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.color = 'var(--error-text)')
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.color =
              'var(--text-secondary)')
          }
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
