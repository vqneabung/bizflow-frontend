/**
 * ProductSkeleton.tsx — Skeleton loading cho product list và detail.
 *
 * Dùng CSS animate-pulse (Tailwind built-in) không cần thêm thư viện.
 * Desktop: 5 dòng bảng giả. Mobile: 3 card giả.
 */
export function ProductTableSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {/* Header */}
      <div className="hidden md:grid md:grid-cols-5 gap-4 px-4 py-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-4 bg-zinc-200 rounded" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: 5 }).map((_, row) => (
        <div key={row} className="bg-white rounded-xl border border-zinc-200 p-4 md:grid md:grid-cols-5 md:gap-4 md:items-center">
          <div className="h-4 bg-zinc-200 rounded w-3/4 mb-2 md:mb-0" />
          <div className="h-4 bg-zinc-200 rounded w-1/2 mb-2 md:mb-0" />
          <div className="h-4 bg-zinc-200 rounded w-1/3 mb-2 md:mb-0" />
          <div className="h-4 bg-zinc-200 rounded w-1/4 mb-2 md:mb-0" />
          <div className="h-8 bg-zinc-200 rounded w-24" />
        </div>
      ))}
    </div>
  )
}

export function ProductDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6 max-w-2xl">
      <div className="h-8 bg-zinc-200 rounded w-1/3" />
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className="h-3 bg-zinc-200 rounded w-1/2 mb-2" />
            <div className="h-5 bg-zinc-200 rounded w-3/4" />
          </div>
        ))}
      </div>
    </div>
  )
}
