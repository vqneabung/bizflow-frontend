'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCustomerOrdersQuery } from '@/lib/query/customers'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import type { OrderStatus } from '@/lib/types/api/order'

interface CustomerOrdersProps {
  customerId: string
}

const PAGE_SIZE = 10

/**
 * CustomerOrders — Lịch sử mua hàng của 1 khách hàng.
 * FR-17: hiển thị đơn hàng phân trang, mới nhất trước.
 */
export default function CustomerOrders({ customerId }: CustomerOrdersProps) {
  const t = useTranslations('customers.purchaseHistory')
  // rootT cho OrderStatusBadge (cần access 'orders.status.*')
  const rootT = useTranslations()
  const locale = useLocale()
  const [page, setPage] = useState(1)

  const { data, isPending, isError, error } = useCustomerOrdersQuery(
    customerId,
    { page, size: PAGE_SIZE },
  )

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
      style: 'currency',
      currency: 'VND',
    }).format(value)

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US')

  if (isPending) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-zinc-100 animate-pulse" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <p className="text-sm text-red-600 py-4">
        {(error as Error)?.message ?? t('loadFailed')}
      </p>
    )
  }

  const orders = data?.data ?? []
  const pagination = data?.pagination
  const totalPages = pagination
    ? Math.max(1, Math.ceil(pagination.totalElements / pagination.size))
    : 1

  if (orders.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-zinc-500">{t('empty')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="hidden md:grid md:grid-cols-12 gap-4 px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
        <div className="col-span-3">{t('table.reference')}</div>
        <div className="col-span-2 text-right">{t('table.total')}</div>
        <div className="col-span-2 text-right">{t('table.debt')}</div>
        <div className="col-span-2 text-center">{t('table.status')}</div>
        <div className="col-span-2">{t('table.date')}</div>
        <div className="col-span-1 text-right">{t('table.actions')}</div>
      </div>

      {/* Rows */}
      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-white rounded-xl border border-zinc-200 p-4 md:grid md:grid-cols-12 md:gap-4 md:items-center hover:border-brand-500/30 transition-all"
        >
          <div className="md:col-span-3">
            <p className="text-sm font-medium text-zinc-900">{order.referenceNumber}</p>
            <p className="text-xs text-zinc-500 md:hidden mt-1">{formatCurrency(order.totalAmount)}</p>
          </div>

          <div className="hidden md:block md:col-span-2 text-right text-sm text-zinc-900 font-medium">
            {formatCurrency(order.totalAmount)}
          </div>

          <div className="hidden md:block md:col-span-2 text-right text-sm">
            <span
              className={
                order.debtAmount > 0 ? 'text-red-600 font-medium' : 'text-zinc-500'
              }
            >
              {formatCurrency(order.debtAmount)}
            </span>
          </div>

          <div className="mt-2 md:mt-0 md:col-span-2 md:text-center">
            <OrderStatusBadge status={order.status as OrderStatus} t={rootT} />
          </div>

          <div className="hidden md:block md:col-span-2 text-sm text-zinc-600">
            {formatDate(order.createdAt)}
          </div>

          <div className="mt-2 md:mt-0 md:col-span-1 flex md:justify-end">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/dashboard/orders/${order.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-xs text-zinc-500">
            {t('pagination.summary', {
              from: (page - 1) * PAGE_SIZE + 1,
              to: Math.min(page * PAGE_SIZE, pagination?.totalElements ?? 0),
              total: pagination?.totalElements ?? 0,
            })}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              {t('pagination.prev')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              {t('pagination.next')}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
