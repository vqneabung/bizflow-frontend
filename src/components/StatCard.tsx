/**
 * StatCard.tsx — Thẻ hiển thị số liệu thống kê trên dashboard.
 *
 * Props: label, value, trend (up/down/neutral), change%, icon
 * Dùng để hiển thị doanh thu, đơn hàng, công nợ, tồn kho...
 */
import type { DashboardStat } from '@/lib/constants'

const trendColors = {
  up: 'text-green-600 bg-green-50',
  down: 'text-red-600 bg-red-50',
  neutral: 'text-zinc-600 bg-zinc-50',
}

export default function StatCard({ label, value, trend, change, icon }: DashboardStat) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        {/* Label + icon */}
        <div className="space-y-1">
          <p className="text-sm text-zinc-500">{label}</p>
          <p className="text-2xl font-bold text-zinc-900">{value}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>

      {/* Trend badge */}
      <div className="mt-3 flex items-center gap-1.5">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${trendColors[trend]}`}>
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {change}
        </span>
        <span className="text-xs text-zinc-400">so với hôm qua</span>
      </div>
    </div>
  )
}
