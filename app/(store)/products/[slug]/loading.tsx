// app/products/[slug]/loading.tsx

export default function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Image gallery */}
        <div className="space-y-3">
          <div className="aspect-square w-full animate-pulse rounded-xl bg-gray-200" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-16 w-16 flex-shrink-0 animate-pulse rounded-lg bg-gray-200"
              />
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-5">
          <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200" />
          <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />

          <div className="space-y-2 pt-2">
            <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
          </div>

          <div className="flex gap-3 pt-4">
            <div className="h-11 w-32 animate-pulse rounded-lg bg-gray-200" />
            <div className="h-11 flex-1 animate-pulse rounded-lg bg-gray-900/20" />
          </div>

          <div className="space-y-2 border-t border-gray-100 pt-6">
            <div className="h-3 w-40 animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-32 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
