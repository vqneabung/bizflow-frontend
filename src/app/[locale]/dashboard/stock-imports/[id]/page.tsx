'use client'

import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { notFound } from 'next/navigation'
import { useStockImportQuery } from '@/lib/query/stock-imports'
import { StockImportDetailSkeleton } from '@/components/stock-imports/StockImportSkeleton'
import { getErrorMessage } from '@/lib/types'

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
    })
  } catch {
    return dateStr
  }
}

export default function StockImportDetailPage() {
  const t = useTranslations('stockImports')
  const d = useTranslations('dashboard')
  const params = useParams()
  const id = params.id as string

  const { data: res, isPending, isError, error } = useStockImportQuery(id)

  if (isPending) {
    return (
      <div className="space-y-6 max-w-4xl">
        <nav className="text-xs text-zinc-400 mb-1">
          <Link href="/dashboard" className="hover:text-zinc-600">{d('title')}</Link>
          <span className="mx-1">/</span>
          <Link href="/dashboard/stock-imports" className="hover:text-zinc-600">{t('title')}</Link>
          <span className="mx-1">/</span>
          <span className="text-zinc-400">...</span>
        </nav>
        <StockImportDetailSkeleton />
      </div>
    )
  }

  if (isError || !res?.success || !res.data) {
    if (isError) {
      const msg = getErrorMessage(error, t('errors.loadFailed'))
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-sm text-zinc-600">{msg}</p>
          <Link href="/dashboard/stock-imports" className="mt-4 text-sm text-brand-600 hover:underline">{t('title')}</Link>
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
        <Link href="/dashboard/stock-imports" className="hover:text-zinc-600">{t('title')}</Link>
        <span className="mx-1">/</span>
        <span className="text-zinc-700 font-medium">{item.referenceNumber}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/stock-imports"
            className="p-2 rounded-xl hover:bg-zinc-100 transition-colors"
          >
            <span className="text-lg">←</span>
          </Link>
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">{item.referenceNumber}</h2>
            <p className="text-sm text-zinc-500">
              {fmtDate(item.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Info card */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <p className="text-xs text-zinc-400 mb-1">{t('fields.supplier')}</p>
          <p className="text-sm font-medium text-zinc-900">{item.supplier || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-400 mb-1">{t('fields.importDate')}</p>
          <p className="text-sm font-medium text-zinc-900">{fmtDate(item.importDate)}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-400 mb-1">{t('fields.totalCost')}</p>
          <p className="text-sm font-bold text-brand-700">{fmtPrice(item.totalCost)}</p>
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
                <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase">{t('fields.unitCost')}</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase">{t('fields.subtotal')}</th>
              </tr>
            </thead>
            <tbody>
              {item.items.map((i) => (
                <tr key={i.id} className="border-b border-zinc-50 last:border-0">
                  <td className="px-4 py-3 text-zinc-900">{i.productName}</td>
                  <td className="px-4 py-3 text-right text-zinc-700">{i.quantity}</td>
                  <td className="px-4 py-3 text-right text-zinc-700">{fmtPrice(i.unitCost)}</td>
                  <td className="px-4 py-3 text-right font-medium text-zinc-900">{fmtPrice(i.subtotal)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-zinc-200 bg-zinc-50">
                <td colSpan={3} className="px-4 py-3 text-right text-sm font-semibold text-zinc-900">
                  {t('fields.totalCost')}
                </td>
                <td className="px-4 py-3 text-right text-sm font-bold text-brand-700">
                  {fmtPrice(item.totalCost)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
