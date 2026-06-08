'use client'

import type { DebtCustomer } from '@/lib/types/api/report'

interface DebtTableProps {
  data: DebtCustomer[]
  formatPrice?: (n: number) => string
}

export function DebtTable({ data, formatPrice }: DebtTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed border-zinc-300 p-12 text-sm text-zinc-400">
        No outstanding debts
      </div>
    )
  }

  const totalDebt = data.reduce((sum, c) => sum + c.totalDebt, 0)

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Total Outstanding Debt</p>
        <p className="mt-1 text-3xl font-bold text-red-600">
          {formatPrice ? formatPrice(totalDebt) : totalDebt.toLocaleString()}
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50">
            <tr>
              <th className="px-4 py-3 font-medium text-zinc-500">Customer</th>
              <th className="px-4 py-3 font-medium text-zinc-500 text-right">Orders</th>
              <th className="px-4 py-3 font-medium text-zinc-500 text-right">Total Debt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {data.map((c) => (
              <tr key={c.customerId} className="hover:bg-zinc-50">
                <td className="px-4 py-3 font-medium text-zinc-900">{c.customerName}</td>
                <td className="px-4 py-3 text-right text-zinc-700">{c.orderCount}</td>
                <td className="px-4 py-3 text-right font-medium text-red-600">
                  {formatPrice ? formatPrice(c.totalDebt) : c.totalDebt.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
