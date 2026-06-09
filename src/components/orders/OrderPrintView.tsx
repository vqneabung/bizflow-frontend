'use client'

import { useLocale, useTranslations } from 'next-intl'
import type { Order } from '@/lib/types/api/order'

interface OrderPrintViewProps {
  order: Order
}

/**
 * OrderPrintView — Hoá đơn in được (FR-09).
 *
 * Rendered inside `print-area` div. Khi user bấm "In hoá đơn",
 * page sẽ gọi window.print() với @media print CSS ẩn sidebar/header/buttons,
 * chỉ hiển thị phần `.print-area` này.
 *
 * Layout: header (store) → meta (số HĐ, ngày, KH) → items table → totals → footer.
 */
export default function OrderPrintView({ order }: OrderPrintViewProps) {
  const t = useTranslations('orders.print')
  const locale = useLocale()

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
      style: 'currency',
      currency: 'VND',
    }).format(value)

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })

  return (
    <div className="print-area bg-white p-8 max-w-3xl mx-auto">
      {/* Store header */}
      <div className="text-center border-b-2 border-zinc-900 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 uppercase tracking-wide">
          {t('storeName')}
        </h1>
        <p className="text-sm text-zinc-600 mt-1">{t('storeAddress')}</p>
        <p className="text-sm text-zinc-600">{t('storeContact')}</p>
      </div>

      {/* Title */}
      <h2 className="text-center text-xl font-semibold text-zinc-900 mb-6 uppercase">
        {t('title')}
      </h2>

      {/* Meta info */}
      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <p className="text-zinc-500">{t('referenceNumber')}:</p>
          <p className="font-semibold text-zinc-900">{order.referenceNumber}</p>
        </div>
        <div className="text-right">
          <p className="text-zinc-500">{t('date')}:</p>
          <p className="font-medium text-zinc-900">{formatDate(order.createdAt)}</p>
        </div>
        {order.customerId && (
          <div className="col-span-2">
            <p className="text-zinc-500">{t('customer')}:</p>
            <p className="font-medium text-zinc-900">#{order.customerId.slice(0, 8)}</p>
          </div>
        )}
      </div>

      {/* Items table */}
      <table className="w-full text-sm border-collapse mb-4">
        <thead>
          <tr className="border-y-2 border-zinc-900">
            <th className="text-left py-2 font-semibold text-zinc-900 uppercase text-xs">
              {t('items.product')}
            </th>
            <th className="text-right py-2 font-semibold text-zinc-900 uppercase text-xs">
              {t('items.quantity')}
            </th>
            <th className="text-right py-2 font-semibold text-zinc-900 uppercase text-xs">
              {t('items.unitPrice')}
            </th>
            <th className="text-right py-2 font-semibold text-zinc-900 uppercase text-xs">
              {t('items.subtotal')}
            </th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id} className="border-b border-zinc-200">
              <td className="py-2 text-zinc-900">{item.productName}</td>
              <td className="py-2 text-right text-zinc-700">{item.quantity}</td>
              <td className="py-2 text-right text-zinc-700">{formatCurrency(item.unitPrice)}</td>
              <td className="py-2 text-right font-medium text-zinc-900">
                {formatCurrency(item.subtotal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="border-t-2 border-zinc-900 pt-3 space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-zinc-700">{t('totalAmount')}:</span>
          <span className="font-bold text-zinc-900 text-base">
            {formatCurrency(order.totalAmount)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-700">{t('paidAmount')}:</span>
          <span className="font-medium text-green-700">
            {formatCurrency(order.paidAmount)}
          </span>
        </div>
        {order.debtAmount > 0 && (
          <div className="flex justify-between">
            <span className="text-zinc-700">{t('debtAmount')}:</span>
            <span className="font-semibold text-red-600">
              {formatCurrency(order.debtAmount)}
            </span>
          </div>
        )}
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="mt-6 pt-4 border-t border-zinc-200">
          <p className="text-xs text-zinc-500 uppercase mb-1">{t('notes')}:</p>
          <p className="text-sm text-zinc-700 whitespace-pre-wrap">{order.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 pt-4 border-t border-zinc-300 text-center text-xs text-zinc-500">
        <p>{t('thanks')}</p>
        <p className="mt-1">{t('poweredBy')}</p>
      </div>
    </div>
  )
}
