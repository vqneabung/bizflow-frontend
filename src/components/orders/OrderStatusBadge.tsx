'use client'

import type { OrderStatus } from '@/lib/types/api/order'

const statusStyles: Record<OrderStatus, string> = {
  DRAFT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  CONFIRMED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

export function OrderStatusBadge({
  status,
  t,
}: {
  status: OrderStatus
  t: (key: string) => string
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status] || ''}`}
    >
      {t(`orders.status.${status}`)}
    </span>
  )
}
