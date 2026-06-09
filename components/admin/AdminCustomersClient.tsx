'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Users, ChevronLeft, ChevronRight } from 'lucide-react';

interface Customer {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  createdAt: string;
  addressCount: number;
  orders: number;
  revenue: number;
}

interface Props {
  customers: Customer[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  searchTerm: string;
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function AdminCustomersClient({
  customers,
  totalCount,
  currentPage,
  totalPages,
  searchTerm,
}: Props) {
  const router = useRouter();
  const [search, setSearch] = useState(searchTerm);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      router.push(
        search.trim()
          ? `/admin/customers?q=${encodeURIComponent(search.trim())}`
          : '/admin/customers',
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-gray-400" />
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
            <p className="text-sm text-gray-500">
              {totalCount} registered customer{totalCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full rounded-lg border pl-9 pr-4 py-2 text-sm outline-none transition-colors"
            style={{ borderColor: 'var(--border-base)' }}
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          style={{ background: 'var(--navy-900)' }}
        >
          {isPending ? 'Searching...' : 'Search'}
        </button>
        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              setSearch('');
              router.push('/admin/customers');
            }}
            className="rounded-lg px-4 py-2 text-sm font-semibold border"
            style={{
              borderColor: 'var(--border-base)',
              color: 'var(--text-muted)',
            }}
          >
            Clear
          </button>
        )}
      </form>

      {/* Table */}
      <div
        className="rounded-xl border bg-white overflow-hidden"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        {customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
            <Users className="h-10 w-10" />
            <p className="text-sm">
              {searchTerm
                ? `No customers found for "${searchTerm}"`
                : 'No customers yet.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr
                className="text-left text-xs font-semibold uppercase tracking-wide text-gray-400"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}
              >
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3 text-right">Orders</th>
                <th className="px-6 py-3 text-right">Total Spent</th>
                <th className="px-6 py-3">Joined</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody
              className="divide-y"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              {customers.map((customer) => (
                <tr
                  key={customer.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ background: 'var(--navy-700)' }}
                      >
                        {(customer.name ?? customer.email)
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {customer.name ?? '—'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {customer.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-gray-500 text-xs">
                    {customer.phone ?? '—'}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <span
                      className="inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold"
                      style={{
                        background:
                          customer.orders > 0 ? 'var(--navy-50)' : '#F9FAFB',
                        color:
                          customer.orders > 0 ? 'var(--navy-700)' : '#9CA3AF',
                      }}
                    >
                      {customer.orders}
                    </span>
                  </td>
                  <td
                    className="px-6 py-3 text-right text-xs font-semibold"
                    style={{
                      color:
                        customer.revenue > 0
                          ? 'var(--accent)'
                          : 'var(--text-muted)',
                    }}
                  >
                    {formatPrice(customer.revenue)}
                  </td>
                  <td className="px-6 py-3 text-xs text-gray-500">
                    {formatDate(customer.createdAt)}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="text-xs font-medium hover:underline"
                      style={{ color: 'var(--navy-700)' }}
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/customers?page=${currentPage - 1}${searchTerm ? `&q=${searchTerm}` : ''}`}
              className={`rounded-lg p-2 border transition-colors ${currentPage === 1 ? 'opacity-40 pointer-events-none' : 'hover:bg-gray-50'}`}
              style={{ borderColor: 'var(--border-base)' }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <Link
              href={`/admin/customers?page=${currentPage + 1}${searchTerm ? `&q=${searchTerm}` : ''}`}
              className={`rounded-lg p-2 border transition-colors ${currentPage === totalPages ? 'opacity-40 pointer-events-none' : 'hover:bg-gray-50'}`}
              style={{ borderColor: 'var(--border-base)' }}
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
