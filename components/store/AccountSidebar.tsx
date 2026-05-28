'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTransition } from 'react';
import { User, ShoppingBag, MapPin, Lock, LogOut } from 'lucide-react';
import { logoutCustomer } from '@/app/actions/customer';
interface Props { customer: { name?: string | null; email: string }; }
const nav = [
  { label: 'Overview', href: '/account', icon: User },
  { label: 'Orders', href: '/account/orders', icon: ShoppingBag },
  { label: 'Addresses', href: '/account/addresses', icon: MapPin },
  { label: 'Security', href: '/account/security', icon: Lock },
];
export default function AccountSidebar({ customer }: Props) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  return (
    <aside className="w-full sm:w-52 flex-shrink-0">
      <div className="rounded-xl p-4 mb-4" style={{ background: 'var(--navy-900)' }}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold flex-shrink-0" style={{ background: 'var(--accent)', color: '#fff' }}>
            {(customer.name ?? customer.email)[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate text-white">{customer.name ?? 'My Account'}</p>
            <p className="text-xs truncate" style={{ color: 'var(--navy-100)' }}>{customer.email}</p>
          </div>
        </div>
      </div>
      <nav className="space-y-0.5">
        {nav.map(({ label, href, icon: Icon }) => {
          const isActive = href === '/account' ? pathname === '/account' : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all"
              style={isActive ? { background: 'var(--navy-50)', color: 'var(--navy-900)', borderLeft: '3px solid var(--navy-700)', paddingLeft: '9px' } : { color: 'var(--text-secondary)' }}>
              <Icon className="h-4 w-4 flex-shrink-0" />{label}
            </Link>
          );
        })}
        <button onClick={() => startTransition(() => logoutCustomer())} disabled={isPending}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-red-50 disabled:opacity-50"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--error-text)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}>
          <LogOut className="h-4 w-4 flex-shrink-0" />{isPending ? 'Signing out…' : 'Sign Out'}
        </button>
      </nav>
    </aside>
  );
}
