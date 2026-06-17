export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading dashboard">
      <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-6">
        <div className="h-7 w-64 rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="mt-2 h-4 w-48 rounded bg-zinc-100 dark:bg-zinc-800" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-200 bg-white p-5">
            <div className="space-y-3">
              <div className="h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-700" />
              <div className="h-7 w-16 rounded bg-zinc-200 dark:bg-zinc-700" />
            </div>
            <div className="mt-3 h-8 w-8 rounded bg-zinc-100 dark:bg-zinc-800" />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-10 w-36 rounded-lg bg-zinc-200 dark:bg-zinc-700" />
        ))}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-5 w-32 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-4 w-20 rounded bg-zinc-100 dark:bg-zinc-800" />
        </div>
        <div className="h-64 w-full rounded bg-zinc-100 dark:bg-zinc-800" />
      </div>
    </div>
  )
}
