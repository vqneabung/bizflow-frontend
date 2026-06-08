'use client'

import type { BestSellingProduct } from '@/lib/types/api/report'

interface BestSellingTableProps {
  data: BestSellingProduct[]
  formatPrice?: (n: number) => string
}

export function BestSellingTable({ data, formatPrice }: BestSellingTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed border-zinc-300 p-12 text-sm text-zinc-400">
        No sales data yet
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50">
          <tr>
            <th className="px-4 py-3 font-medium text-zinc-500">#</th>
            <th className="px-4 py-3 font-medium text-zinc-500">Product</th>
            <th className="px-4 py-3 font-medium text-zinc-500 text-right">Sold</th>
            <th className="px-4 py-3 font-medium text-zinc-500 text-right">Revenue</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {data.map((p, i) => (
            <tr key={p.productId} className="hover:bg-zinc-50">
              <td className="px-4 py-3 text-zinc-400">{i + 1}</td>
              <td className="px-4 py-3 font-medium text-zinc-900">{p.productName}</td>
              <td className="px-4 py-3 text-right text-zinc-700">{p.quantitySold}</td>
              <td className="px-4 py-3 text-right font-medium text-zinc-900">
                {formatPrice ? formatPrice(p.revenue) : p.revenue.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
