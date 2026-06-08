'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import type { StockImportSummaryResponse } from '@/lib/types'

interface StockImportTableProps {
  items: StockImportSummaryResponse[]
}

export default function StockImportTable({ items }: StockImportTableProps) {
  const t = useTranslations('stockImports')

  if (items.length === 0) return null

  return (
    <div className="space-y-3">
      {/* Desktop header */}
      <div className="hidden md:grid md:grid-cols-5 gap-4 px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
        <div>{t('table.referenceNumber')}</div>
        <div>{t('table.supplier')}</div>
        <div>{t('table.importDate')}</div>
        <div>{t('table.totalCost')}</div>
        <div className="text-right">{t('table.actions')}</div>
      </div>

      {items.map((item) => (
        <Link
          key={item.id}
          href={`/dashboard/stock-imports/${item.id}`}
          className="block bg-white rounded-xl border border-zinc-200 p-4 md:grid md:grid-cols-5 md:gap-4 md:items-center hover:border-brand-500/30 hover:shadow-sm transition-all"
        >
          {/* Reference number */}
          <div>
            <p className="text-sm font-medium text-zinc-900 truncate">
              {item.referenceNumber}
            </p>
          </div>

          {/* Supplier */}
          <div className="text-sm text-zinc-600 mt-1 md:mt-0">
            {item.supplier || '—'}
          </div>

          {/* Date */}
          <div className="text-sm text-zinc-600 mt-1 md:mt-0">
            {new Date(item.importDate).toLocaleDateString('vi-VN')}
          </div>

          {/* Total cost */}
          <div className="text-sm font-medium text-zinc-900 mt-1 md:mt-0">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.totalCost)}
          </div>

          {/* Actions */}
          <div className="flex justify-end mt-2 md:mt-0">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700">
              {item.itemCount} {t('table.itemCount')}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
