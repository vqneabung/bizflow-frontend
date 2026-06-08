'use client'

import type { DailyRevenue } from '@/lib/types/api/report'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

interface RevenueChartProps {
  data: DailyRevenue[]
  formatDate?: (d: string) => string
  formatPrice?: (n: number) => string
}

export function RevenueChart({ data, formatDate, formatPrice }: RevenueChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed border-zinc-300 p-12 text-sm text-zinc-400">
        No revenue data yet
      </div>
    )
  }

  const formatted = data.map((p) => ({
    ...p,
    label: formatDate ? formatDate(p.date) : p.date,
  }))

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-6">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={formatted} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: '#71717a' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#71717a' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => (v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v))}
          />
          <Tooltip
            formatter={(value, _name) => [
              formatPrice ? formatPrice(Number(value)) : Number(value).toLocaleString(),
              'Revenue',
            ]}
            labelFormatter={(_label) => `Date: ${_label}`}
          />
          <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
