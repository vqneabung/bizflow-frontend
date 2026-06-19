'use client'

import { useTranslations } from 'next-intl'
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'
import { useInventoryQuery } from '@/lib/query/reports'
import { Link } from '@/i18n/navigation'

export function LowStockAlerts() {
  const t = useTranslations('dashboard')
  const { data, isPending, isError } = useInventoryQuery()

  if (isPending) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t('lowStockAlerts.loading')}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        {t('lowStockAlerts.error')}
      </div>
    )
  }

  const products = data?.lowStockProducts ?? []

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-3 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-amber-500" />
        <h3 className="text-base font-semibold text-zinc-900">
          {t('lowStockAlerts.title')}
        </h3>
      </div>

      {products.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="h-4 w-4" />
          {t('lowStockAlerts.empty')}
        </div>
      ) : (
        <ul className="space-y-2">
          {products.slice(0, 5).map((p) => (
            <li
              key={p.productId}
              className="flex items-center justify-between rounded-md bg-zinc-50 px-3 py-2 text-sm"
            >
              <span className="truncate text-zinc-800">{p.productName}</span>
              <span className="ml-2 shrink-0 font-medium text-red-600">
                {p.stock}/{p.minStock}
              </span>
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/dashboard/reports"
        className="mt-3 inline-block text-xs font-medium text-blue-600 hover:text-blue-700"
      >
        {t('lowStockAlerts.viewAll')}
      </Link>
    </div>
  )
}