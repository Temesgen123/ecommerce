import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { AlertTriangle, PackageX } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Stock Alerts' };

const LOW_STOCK_THRESHOLD = parseInt(
  process.env.LOW_STOCK_THRESHOLD ?? '5',
  10,
);

function formatStock(stock: number) {
  if (stock === 0)
    return {
      label: 'Out of stock',
      style: { background: 'var(--error-bg)', color: 'var(--error-text)' },
    };
  return {
    label: `${stock} left`,
    style: { background: 'var(--warning-bg)', color: 'var(--warning-text)' },
  };
}

export default async function AdminStockAlertsPage() {
  const lowStockProducts = await prisma.product.findMany({
    where: {
      published: true,
      stock: { lte: LOW_STOCK_THRESHOLD },
    },
    orderBy: { stock: 'asc' },
    include: { category: { select: { name: true } } },
  });

  const outOfStock = lowStockProducts.filter((p) => p.stock === 0);
  const lowStock = lowStockProducts.filter((p) => p.stock > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            Stock Alerts
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Products at or below {LOW_STOCK_THRESHOLD} units. Set{' '}
            <code
              className="text-xs px-1 py-0.5 rounded"
              style={{ background: 'var(--bg-elevated)' }}
            >
              LOW_STOCK_THRESHOLD
            </code>{' '}
            in your environment to change this.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {outOfStock.length > 0 && (
            <span
              className="rounded-full px-3 py-1 font-semibold"
              style={{
                background: 'var(--error-bg)',
                color: 'var(--error-text)',
              }}
            >
              {outOfStock.length} out of stock
            </span>
          )}
          {lowStock.length > 0 && (
            <span
              className="rounded-full px-3 py-1 font-semibold"
              style={{
                background: 'var(--warning-bg)',
                color: 'var(--warning-text)',
              }}
            >
              {lowStock.length} low stock
            </span>
          )}
        </div>
      </div>

      {/* All clear */}
      {lowStockProducts.length === 0 && (
        <div
          className="flex flex-col items-center justify-center gap-3 py-20 rounded-xl border"
          style={{
            borderColor: 'var(--border-subtle)',
            color: 'var(--text-muted)',
          }}
        >
          <span className="text-4xl">✅</span>
          <p
            className="text-base font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            All products are well stocked
          </p>
          <p className="text-sm">
            No products are below the {LOW_STOCK_THRESHOLD}-unit threshold.
          </p>
        </div>
      )}

      {/* Out of stock */}
      {outOfStock.length > 0 && (
        <div className="space-y-3">
          <h2
            className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide"
            style={{ color: 'var(--error-text)' }}
          >
            <PackageX className="h-4 w-4" />
            Out of Stock ({outOfStock.length})
          </h2>
          <StockTable products={outOfStock} />
        </div>
      )}

      {/* Low stock */}
      {lowStock.length > 0 && (
        <div className="space-y-3">
          <h2
            className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide"
            style={{ color: 'var(--warning-text)' }}
          >
            <AlertTriangle className="h-4 w-4" />
            Low Stock ({lowStock.length})
          </h2>
          <StockTable products={lowStock} />
        </div>
      )}
    </div>
  );
}

function StockTable({ products }: { products: any[] }) {
  return (
    <div
      className="rounded-xl border bg-white overflow-hidden"
      style={{ borderColor: 'var(--border-subtle)' }}
    >
      <table className="w-full text-sm">
        <thead>
          <tr
            className="text-left text-xs font-semibold uppercase tracking-wide"
            style={{
              borderBottom: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
            }}
          >
            <th className="px-5 py-3">Product</th>
            <th className="px-5 py-3">Category</th>
            <th className="px-5 py-3 text-center">Stock</th>
            <th className="px-5 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody
          className="divide-y"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          {products.map((product) => {
            const { label, style } =
              product.stock === 0
                ? {
                    label: 'Out of stock',
                    style: {
                      background: 'var(--error-bg)',
                      color: 'var(--error-text)',
                    },
                  }
                : {
                    label: `${product.stock} left`,
                    style: {
                      background: 'var(--warning-bg)',
                      color: 'var(--warning-text)',
                    },
                  };

            return (
              <tr
                key={product.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div
                        className="h-10 w-10 rounded-lg flex-shrink-0"
                        style={{ background: 'var(--bg-elevated)' }}
                      />
                    )}
                    <div>
                      <p
                        className="font-semibold"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {product.name}
                      </p>
                      <p
                        className="text-xs font-mono"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {product.slug}
                      </p>
                    </div>
                  </div>
                </td>
                <td
                  className="px-5 py-3"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {product.category?.name ?? (
                    <span style={{ color: 'var(--text-muted)' }}>—</span>
                  )}
                </td>
                <td className="px-5 py-3 text-center">
                  <span
                    className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold"
                    style={style}
                  >
                    {label}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="btn-navy rounded-lg px-3 py-1.5 text-xs font-semibold"
                  >
                    Update Stock
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
