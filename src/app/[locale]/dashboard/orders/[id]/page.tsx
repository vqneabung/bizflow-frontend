'use client'

import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { useRouter } from '@/i18n/navigation'
import { notFound } from 'next/navigation'
import { toast } from 'sonner'
import { useOrderQuery, useCancelOrderMutation } from '@/lib/query/orders'
import { OrderDetailSkeleton } from '@/components/orders/OrderSkeleton'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { getErrorMessage } from '@/lib/types'
import { useState } from 'react'

/** Format VND inline */
function fmtPrice(v: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v)
}

/** Format date inline */
function fmtDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

const CANCELLABLE_STATUSES = ['DRAFT', 'CONFIRMED']

export default function OrderDetailPage() {
  const t = useTranslations('orders')
  const rootT = useTranslations()
  const d = useTranslations('dashboard')
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [cancelling, setCancelling] = useState(false)

  const { data: res, isPending, isError, error } = useOrderQuery(id)
  const cancelMutation = useCancelOrderMutation()

  const handleCancel = async () => {
    if (!res?.data) return
    const ref = res.data.referenceNumber
    if (!window.confirm(`Hủy đơn ${ref}?`)) return
    setCancelling(true)
    try {
      await cancelMutation.mutateAsync({ id })
      toast.success(t('toast.cancelled', { referenceNumber: ref }))
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('errors.cannotCancel')))
    } finally {
      setCancelling(false)
    }
  }

  if (isPending) {
    return (
      <div className="space-y-6 max-w-4xl">
        <nav className="text-xs text-zinc-400 mb-1">
          <Link href="/dashboard" className="hover:text-zinc-600">{d('title')}</Link>
          <span className="mx-1">/</span>
          <Link href="/dashboard/orders" className="hover:text-zinc-600">{t('title')}</Link>
          <span className="mx-1">/</span>
          <span className="text-zinc-400">...</span>
        </nav>
        <OrderDetailSkeleton />
      </div>
    )
  }

  if (isError || !res?.success || !res.data) {
    if (isError) {
      const msg = getErrorMessage(error, t('errors.loadFailed'))
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-sm text-zinc-600">{msg}</p>
          <Link href="/dashboard/orders" className="mt-4 text-sm text-brand-600 hover:underline">{t('title')}</Link>
        </div>
      )
    }
    notFound()
  }

  const item = res.data

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="text-xs text-zinc-400 mb-1">
        <Link href="/dashboard" className="hover:text-zinc-600">{d('title')}</Link>
        <span className="mx-1">/</span>
        <Link href="/dashboard/orders" className="hover:text-zinc-600">{t('title')}</Link>
        <span className="mx-1">/</span>
        <span className="text-zinc-700 font-medium">{item.referenceNumber}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/orders"
            className="p-2 rounded-xl hover:bg-zinc-100 transition-colors"
          >
            <span className="text-lg">←</span>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-zinc-900">{item.referenceNumber}</h2>
              <OrderStatusBadge status={item.status} t={rootT} />
            </div>
            <p className="text-sm text-zinc-500">
              {fmtDate(item.createdAt)}
            </p>
          </div>
        </div>
        {CANCELLABLE_STATUSES.includes(item.status) && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="px-4 py-2 rounded-xl border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            {cancelling ? t('actions.cancelling') : t('actions.cancel')}
          </button>
        )}
      </div>

      {/* Info card */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <p className="text-xs text-zinc-400 mb-1">{t('fields.customer')}</p>
          <p className="text-sm font-medium text-zinc-900">
            {item.customerId ? `#${item.customerId.slice(0, 8)}` : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-400 mb-1">{t('fields.totalAmount')}</p>
          <p className="text-sm font-bold text-brand-700">{fmtPrice(item.totalAmount)}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-400 mb-1">Đã trả / Còn nợ</p>
          <p className="text-sm text-zinc-700">
            <span className="font-medium text-green-600">{fmtPrice(item.paidAmount)}</span>
            <span className="mx-1 text-zinc-300">/</span>
            <span className="font-medium text-red-500">{fmtPrice(item.debtAmount)}</span>
          </p>
        </div>
        {item.notes && (
          <div className="md:col-span-3">
            <p className="text-xs text-zinc-400 mb-1">{t('fields.notes')}</p>
            <p className="text-sm text-zinc-700 whitespace-pre-wrap">{item.notes}</p>
          </div>
        )}
      </div>

      {/* Items table */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-900 mb-3">{t('fields.items')}</h3>
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">{t('fields.product')}</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase">{t('fields.quantity')}</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase">{t('fields.unitPrice')}</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase">{t('fields.subtotal')}</th>
              </tr>
            </thead>
            <tbody>
              {item.items.map((i) => (
                <tr key={i.id} className="border-b border-zinc-50 last:border-0">
                  <td className="px-4 py-3 text-zinc-900">{i.productName}</td>
                  <td className="px-4 py-3 text-right text-zinc-700">{i.quantity}</td>
                  <td className="px-4 py-3 text-right text-zinc-700">{fmtPrice(i.unitPrice)}</td>
                  <td className="px-4 py-3 text-right font-medium text-zinc-900">{fmtPrice(i.subtotal)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-zinc-200 bg-zinc-50">
                <td colSpan={3} className="px-4 py-3 text-right text-sm font-semibold text-zinc-900">
                  {t('fields.totalAmount')}
                </td>
                <td className="px-4 py-3 text-right text-sm font-bold text-brand-700">
                  {fmtPrice(item.totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
