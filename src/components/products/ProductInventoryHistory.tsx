/**
 * ProductInventoryHistory.tsx — Bảng lịch sử biến động tồn kho.
 *
 * Layer: PRESENTATION (UI only).
 * Data: useInventoryHistoryQuery (TanStack Query).
 */
'use client'

import { useTranslations } from 'next-intl'
import { useInventoryHistoryQuery } from '@/lib/query/products'

interface ProductInventoryHistoryProps {
  productId: string
}

export function ProductInventoryHistory({ productId }: ProductInventoryHistoryProps) {
  const t = useTranslations('products')
  const { data, isPending, isError } = useInventoryHistoryQuery(productId)

  if (isPending) {
    return <p className="text-sm text-muted-foreground">{t('history.loading')}</p>
  }

  if (isError) {
    return <p className="text-sm text-destructive">{t('history.error')}</p>
  }

  if (!data?.data?.length) {
    return <p className="text-sm text-muted-foreground">{t('history.empty')}</p>
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="p-2 text-left font-medium">{t('history.time')}</th>
            <th className="p-2 text-left font-medium">{t('history.type')}</th>
            <th className="p-2 text-right font-medium">{t('history.quantity')}</th>
            <th className="p-2 text-right font-medium">{t('history.balanceAfter')}</th>
            <th className="p-2 text-left font-medium">{t('history.reference')}</th>
          </tr>
        </thead>
        <tbody>
          {data.data.map((item) => {
            const movementKey = item.movementType.toLowerCase()
            const refKey = item.refType.toLowerCase().replace('_', '.')
            const movementClass =
              item.movementType === 'IN'
                ? 'bg-green-100 text-green-700'
                : item.movementType === 'OUT'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
            return (
              <tr key={item.id} className="border-t">
                <td className="p-2">{new Date(item.createdAt).toLocaleString()}</td>
                <td className="p-2">
                  <span
                    className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${movementClass}`}
                  >
                    {t(`history.movement.${movementKey}`)}
                  </span>
                </td>
                <td className="p-2 text-right">{item.quantity}</td>
                <td className="p-2 text-right font-medium">{item.balanceAfter}</td>
                <td className="p-2 text-muted-foreground">
                  {t(`history.ref.${refKey}`)}
                  {item.referenceNumber ? ` ${item.referenceNumber}` : ''}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}