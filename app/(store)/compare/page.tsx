import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShoppingBag, Check, X } from 'lucide-react';

export const metadata: Metadata = { title: 'Compare Products' };

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

interface Props {
  searchParams: Promise<{ ids?: string }>;
}

export default async function ComparePage({ searchParams }: Props) {
  const { ids } = await searchParams;

  const idList = ids?.split(',').filter(Boolean).slice(0, 3) ?? [];

  if (idList.length < 2) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          No products to compare
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          Add at least 2 products to compare them.
        </p>
        <Link
          href="/products"
          className="btn-navy rounded-lg px-6 py-3 text-sm font-semibold"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  const products = await prisma.product.findMany({
    where: { id: { in: idList }, published: true },
    include: { category: { select: { name: true } } },
  });

  const rows = [
    {
      label: 'Image',
      render: (p: any) =>
        p.images[0] ? (
          <img
            src={p.images[0]}
            alt={p.name}
            className="w-full h-40 object-cover rounded-lg"
          />
        ) : (
          <div
            className="w-full h-40 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--bg-elevated)' }}
          >
            <ShoppingBag className="h-8 w-8 opacity-20" />
          </div>
        ),
    },
    {
      label: 'Name',
      render: (p: any) => (
        <Link
          href={`/products/${p.slug}`}
          className="font-semibold hover:underline text-sm"
          style={{ color: 'var(--text-primary)' }}
        >
          {p.name}
        </Link>
      ),
    },
    {
      label: 'Category',
      render: (p: any) => (
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {p.category?.name ?? '—'}
        </span>
      ),
    },
    {
      label: 'Price',
      render: (p: any) => (
        <div className="flex items-baseline gap-2">
          <span
            className="text-base font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            {formatPrice(p.price)}
          </span>
          {p.compareAt && p.compareAt > p.price && (
            <span
              className="text-xs line-through"
              style={{ color: 'var(--text-muted)' }}
            >
              {formatPrice(p.compareAt)}
            </span>
          )}
        </div>
      ),
    },
    {
      label: 'In Stock',
      render: (p: any) =>
        p.stock > 0 ? (
          <Check className="h-5 w-5" style={{ color: '#22c55e' }} />
        ) : (
          <X className="h-5 w-5" style={{ color: '#ef4444' }} />
        ),
    },
    {
      label: 'On Sale',
      render: (p: any) =>
        p.compareAt && p.compareAt > p.price ? (
          <Check className="h-5 w-5" style={{ color: '#22c55e' }} />
        ) : (
          <X className="h-5 w-5" style={{ color: '#ef4444' }} />
        ),
    },
    {
      label: 'Action',
      render: (p: any) => (
        <Link
          href={`/products/${p.slug}`}
          className="btn-primary rounded-lg px-4 py-2 text-xs font-bold inline-block"
        >
          View Product
        </Link>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <h1
          className="text-2xl font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          Compare Products
        </h1>
        <Link
          href="/products"
          className="text-sm font-semibold hover:underline"
          style={{ color: 'var(--navy-600)' }}
        >
          ← Back to Products
        </Link>
      </div>

      {/* Comparison table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <tbody>
            {rows.map(({ label, render }) => (
              <tr
                key={label}
                style={{ borderBottom: '1px solid var(--border-subtle)' }}
              >
                {/* Row label */}
                <td
                  className="py-4 pr-4 text-xs font-bold uppercase tracking-wide w-24 align-top"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {label}
                </td>
                {/* Product cells */}
                {products.map((product) => (
                  <td
                    key={product.id}
                    className="py-4 px-4 align-top"
                    style={{ width: `${100 / products.length}%` }}
                  >
                    {render(product)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
