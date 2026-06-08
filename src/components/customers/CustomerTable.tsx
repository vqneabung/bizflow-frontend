'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import type { CustomerResponse } from '@/lib/types'

interface CustomerTableProps {
  customers: CustomerResponse[]
  onDeactivate: (customer: CustomerResponse) => void
}

export default function CustomerTable({ customers, onDeactivate }: CustomerTableProps) {
  const t = useTranslations('customers')

  return (
    <div className="space-y-3">
      {/* Desktop header */}
      <div className="hidden md:grid md:grid-cols-4 gap-4 px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
        <div>{t('table.name')}</div>
        <div>{t('table.phone')}</div>
        <div>{t('table.email')}</div>
        <div className="text-right">{t('table.actions')}</div>
      </div>

      {customers.map((customer) => (
        <Link
          key={customer.id}
          href={`/dashboard/customers/${customer.id}`}
          className="block bg-white rounded-xl border border-zinc-200 p-4 md:grid md:grid-cols-4 md:gap-4 md:items-center hover:border-brand-500/30 hover:shadow-sm transition-all"
        >
          {/* Name (mobile header) */}
          <div className="md:col-span-1">
            <p className="text-sm font-medium text-zinc-900 truncate">
              {customer.name}
            </p>
          </div>

          {/* Phone */}
          <div className="text-sm text-zinc-600 mt-1 md:mt-0">
            {customer.phone || '—'}
          </div>

          {/* Email */}
          <div className="text-sm text-zinc-600 mt-1 md:mt-0 truncate">
            {customer.email || '—'}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-2 md:mt-0" onClick={(e) => e.preventDefault()}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDeactivate(customer)
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              {t('actions.deactivate')}
            </button>
          </div>
        </Link>
      ))}
    </div>
  )
}
