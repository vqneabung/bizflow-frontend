'use client'

import { useTranslations } from 'next-intl'
import type { InventoryReport, LowStockProduct, CategoryDistribution } from '@/lib/types/api/report'

interface InventoryCardProps {
  data: InventoryReport
  formatPrice?: (n: number) => string
}

export function InventoryCard({ data, formatPrice }: InventoryCardProps) {
  const t = useTranslations('reports')
  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Summary stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{t('inventory.totalProducts')}</p>
          <p className="mt-1 text-3xl font-bold text-zinc-900">{data.totalProducts}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{t('inventory.totalValue')}</p>
          <p className="mt-1 text-3xl font-bold text-zinc-900">
            {formatPrice ? formatPrice(data.totalValue) : data.totalValue.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{t('inventory.lowStock')}</p>
          <p className={`mt-1 text-3xl font-bold ${data.lowStockCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {data.lowStockCount}
          </p>
        </div>
      </div>

      {/* Low stock products table */}
      {data.lowStockProducts.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-zinc-700">{t('inventory.productsBelowMin')}</h3>
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-zinc-500">{t('inventory.product')}</th>
                  <th className="px-4 py-3 font-medium text-zinc-500 text-right">{t('inventory.stock')}</th>
                  <th className="px-4 py-3 font-medium text-zinc-500 text-right">{t('inventory.minStock')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {data.lowStockProducts.map((p: LowStockProduct, i: number) => (
                  <tr key={`${p.productId}-${i}`} className="hover:bg-zinc-50">
                    <td className="px-4 py-3 font-medium text-zinc-900">{p.productName}</td>
                    <td className="px-4 py-3 text-right text-red-600 font-medium">{p.stock}</td>
                    <td className="px-4 py-3 text-right text-zinc-500">{p.minStock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Category breakdown */}
      {data.byCategory.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-zinc-700">{t('inventory.productsByCategory')}</h3>
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-zinc-500">{t('inventory.category')}</th>
                  <th className="px-4 py-3 font-medium text-zinc-500 text-right">{t('inventory.count')}</th>
                  <th className="px-4 py-3 font-medium text-zinc-500 text-right">{t('inventory.percent')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {data.byCategory.map((c: CategoryDistribution) => (
                  <tr key={c.categoryName} className="hover:bg-zinc-50">
                    <td className="px-4 py-3 text-zinc-900">{c.categoryName}</td>
                    <td className="px-4 py-3 text-right text-zinc-700">{c.count}</td>
                    <td className="px-4 py-3 text-right text-zinc-500">
                      {data.totalProducts > 0
                        ? ((c.count / data.totalProducts) * 100).toFixed(1)
                        : 0}
                      %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
