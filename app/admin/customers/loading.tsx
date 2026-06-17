// app/admin/categories/loading.tsx
// This same pattern works for products, orders, customers, discounts, reviews —
// copy this file into each admin/*/loading.tsx folder, just adjust column count.

export default function AdminTableLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-7 w-40 animate-pulse rounded bg-gray-200" />
        <div className="h-9 w-32 animate-pulse rounded-md bg-gray-200" />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200 bg-white">
        {/* Table header */}
        <div className="grid grid-cols-5 gap-4 border-b border-gray-100 px-6 py-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-3 w-16 animate-pulse rounded bg-gray-150 bg-gray-200"
            />
          ))}
        </div>

        {/* Table rows */}
        <div className="divide-y divide-gray-100">
          {Array.from({ length: 6 }).map((_, row) => (
            <div key={row} className="grid grid-cols-5 gap-4 px-6 py-4">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-12 animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-8 animate-pulse rounded bg-gray-100 justify-self-end" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
