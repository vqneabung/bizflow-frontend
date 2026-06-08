'use client'

import type { OrderSummary } from '@/lib/types/api/order'
import type { OrderStatus } from '@/lib/types/api/order'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import { OrderStatusBadge } from './OrderStatusBadge'

interface OrderTableProps {
  orders: OrderSummary[]
  t: (key: string) => string
  locale: string
}

export function OrderTable({ orders, t, locale }: OrderTableProps) {
  if (orders.length === 0) return null

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium">{t('orders.table.referenceNumber')}</th>
            <th className="px-4 py-3 text-left font-medium">{t('orders.table.totalAmount')}</th>
            <th className="px-4 py-3 text-center font-medium">{t('orders.table.status')}</th>
            <th className="px-4 py-3 text-center font-medium">{t('orders.table.itemCount')}</th>
            <th className="px-4 py-3 text-left font-medium">{t('orders.table.date')}</th>
            <th className="px-4 py-3 text-center font-medium">{t('orders.table.actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-muted/30">
              <td className="px-4 py-3 font-medium">{order.referenceNumber}</td>
              <td className="px-4 py-3">
                {new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
                  style: 'currency',
                  currency: 'VND',
                }).format(order.totalAmount)}
              </td>
              <td className="px-4 py-3 text-center">
                <OrderStatusBadge status={order.status as OrderStatus} t={t} />
              </td>
              <td className="px-4 py-3 text-center">{order.itemCount}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString(
                  locale === 'vi' ? 'vi-VN' : 'en-US',
                )}
              </td>
              <td className="px-4 py-3 text-center">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/dashboard/orders/${order.id}`}>
                    <Eye className="mr-1 h-4 w-4" />
                    {t('orders.actions.view')}
                  </Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
