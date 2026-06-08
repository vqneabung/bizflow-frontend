'use client'

export interface ReportStatCardProps {
  label: string
  value: string
  trend?: 'up' | 'down' | 'neutral'
  change?: string
  icon: string
}

export function ReportStatCard({ label, value, trend, change, icon }: ReportStatCardProps) {
  const trendColor =
    trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-zinc-500'
  const trendArrow = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-6">
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        {change && (
          <span className={`text-sm font-medium ${trendColor}`}>
            {trendArrow} {change}
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-zinc-900">{value}</p>
      <p className="text-sm text-zinc-500">{label}</p>
    </div>
  )
}
