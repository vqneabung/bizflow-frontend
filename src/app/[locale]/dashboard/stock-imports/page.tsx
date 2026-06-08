'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import StockImportTable from '@/components/stock-imports/StockImportTable'
import StockImportEmptyState from '@/components/stock-imports/StockImportEmptyState'
import { StockImportTableSkeleton } from '@/components/stock-imports/StockImportSkeleton'
import {
  useStockImportsQuery,
} from '@/lib/query/stock-imports'
import { getErrorMessage } from '@/lib/types'

export default function StockImportsPage() {
  const t = useTranslations('stockImports')
  const d = useTranslations('dashboard')

  const [page, setPage] = useState(1)

  const {
    data: result,
    isPending,
    isError,
    error,
    refetch,
  } = useStockImportsQuery({
    page,
    size: 20,
  })

  const items = result?.data ?? []
  const pagination = result?.pagination ?? null

  if (isPending) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <nav className="text-xs text-zinc-400 mb-1">
              <Link href="/dashboard" className="hover:text-zinc-600">{d('title')}</Link>
              <span className="mx-1">/</span>
              <span className="text-zinc-700 font-medium">{t('title')}</span>
            </nav>
            <h2 className="text-lg font-semibold text-zinc-900">{t('title')}</h2>
            <p className="text-sm text-zinc-500">{t('subtitle')}</p>
          </div>
        </div>
        <StockImportTableSkeleton />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <nav className="text-xs text-zinc-400 mb-1">
          <Link href="/dashboard" className="hover:text-zinc-600">{d('title')}</Link>
          <span className="mx-1">/</span>
          <span className="text-zinc-700 font-medium">{t('title')}</span>
        </nav>
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-sm text-zinc-600">{getErrorMessage(error, t('errors.loadFailed'))}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            {t('errors.loadFailedAction')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <div>
          <nav className="text-xs text-zinc-400 mb-1">
            <Link href="/dashboard" className="hover:text-zinc-600">{d('title')}</Link>
            <span className="mx-1">/</span>
            <span className="text-zinc-700 font-medium">{t('title')}</span>
          </nav>
          <h2 className="text-lg font-semibold text-zinc-900">{t('title')}</h2>
          <p className="text-sm text-zinc-500">{t('subtitle')}</p>
        </div>
        <Link
          href="/dashboard/stock-imports/create"
          className="px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors shrink-0"
        >
          + {t('create')}
        </Link>
      </div>

      {items.length === 0 ? (
        <StockImportEmptyState />
      ) : (
        <>
          <StockImportTable items={items} />

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg text-sm border border-zinc-300 disabled:opacity-40 hover:bg-zinc-50 transition-colors"
              >
                ←
              </button>
              <span className="px-3 py-1.5 text-sm text-zinc-500">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="px-3 py-1.5 rounded-lg text-sm border border-zinc-300 disabled:opacity-40 hover:bg-zinc-50 transition-colors"
              >
                →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
