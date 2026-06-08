'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { OrderTable } from '@/components/orders/OrderTable'
import { OrderEmptyState } from '@/components/orders/OrderEmptyState'
import { OrderTableSkeleton } from '@/components/orders/OrderSkeleton'
import { useOrdersQuery } from '@/lib/query/orders'
import { getErrorMessage } from '@/lib/types'
import type { OrderStatus } from '@/lib/types/api/order'

const STATUS_TABS: (OrderStatus | 'ALL')[] = ['ALL', 'CONFIRMED', 'DRAFT', 'CANCELLED']

export default function OrdersPage() {
  const rootT = useTranslations()
  const d = useTranslations('dashboard')
  const locale = useLocale()

  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL')

  const {
    data: result,
    isPending,
    isError,
    error,
    refetch,
  } = useOrdersQuery({
    page,
    size: 20,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
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
              <span className="text-zinc-700 font-medium">{rootT('orders.title')}</span>
            </nav>
            <h2 className="text-lg font-semibold text-zinc-900">{rootT('orders.title')}</h2>
            <p className="text-sm text-zinc-500">{rootT('orders.subtitle')}</p>
          </div>
        </div>
        <OrderTableSkeleton />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <nav className="text-xs text-zinc-400 mb-1">
          <Link href="/dashboard" className="hover:text-zinc-600">{d('title')}</Link>
          <span className="mx-1">/</span>
          <span className="text-zinc-700 font-medium">{rootT('orders.title')}</span>
        </nav>
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-sm text-zinc-600">{getErrorMessage(error, rootT('orders.errors.loadFailed'))}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            {rootT('orders.errors.loadFailedAction')}
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
            <span className="text-zinc-700 font-medium">{rootT('orders.title')}</span>
          </nav>
          <h2 className="text-lg font-semibold text-zinc-900">{rootT('orders.title')}</h2>
          <p className="text-sm text-zinc-500">{rootT('orders.subtitle')}</p>
        </div>
        <Link
          href="/dashboard/orders/create"
          className="px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors shrink-0"
        >
          + {rootT('orders.create')}
        </Link>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 bg-zinc-100 rounded-xl p-1 w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setStatusFilter(tab)
              setPage(1)
            }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === tab
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            {tab === 'ALL' ? 'Tất cả' : rootT(`orders.status.${tab}`)}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <OrderEmptyState
          title={rootT('orders.empty.title')}
          description={rootT('orders.empty.description')}
          actionLabel={rootT('orders.empty.action')}
          actionHref="/dashboard/orders/create"
        />
      ) : (
        <>
          <OrderTable orders={items} t={rootT} locale={locale} />

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
