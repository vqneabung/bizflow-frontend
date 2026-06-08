export function OrderTableSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 w-full rounded bg-zinc-200 dark:bg-zinc-700" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-16 w-full rounded bg-zinc-100 dark:bg-zinc-800" />
      ))}
    </div>
  )
}

export function OrderDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 rounded bg-zinc-200 dark:bg-zinc-700" />
      <div className="h-4 w-48 rounded bg-zinc-100 dark:bg-zinc-800" />
      <div className="h-32 w-full rounded bg-zinc-100 dark:bg-zinc-800" />
      <div className="h-24 w-full rounded bg-zinc-100 dark:bg-zinc-800" />
    </div>
  )
}
