'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { toast } from 'sonner'
import CustomerTable from '@/components/customers/CustomerTable'
import CustomerEmptyState from '@/components/customers/CustomerEmptyState'
import CustomerDeleteDialog from '@/components/customers/CustomerDeleteDialog'
import { CustomerTableSkeleton } from '@/components/customers/CustomerSkeleton'
import {
  useCustomersQuery,
  useDeactivateCustomerMutation,
} from '@/lib/query/customers'
import { getErrorMessage } from '@/lib/types'
import type { CustomerResponse } from '@/lib/types'

export default function CustomersPage() {
  const t = useTranslations('customers')
  const d = useTranslations('dashboard')

  // Filter state
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const [deleteTarget, setDeleteTarget] = useState<CustomerResponse | null>(null)

  const {
    data: result,
    isPending,
    isError,
    error,
    refetch,
  } = useCustomersQuery({
    search: search || undefined,
    page,
    size: 20,
  })

  const deactivateMutation = useDeactivateCustomerMutation()

  const handleDeactivate = async () => {
    if (!deleteTarget) return
    try {
      await deactivateMutation.mutateAsync(deleteTarget.id)
      toast.success(t('toast.deactivated', { name: deleteTarget.name }))
      setDeleteTarget(null)
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('toast.error')))
    }
  }

  const customers = result?.data ?? []
  const pagination = result?.pagination ?? null

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
          href="/dashboard/customers/create"
          className="px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors shrink-0"
        >
          + {t('create')}
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder={t('search')}
          className="w-full rounded-xl border border-zinc-300 pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">🔍</span>
      </div>

      {/* Content */}
      {isPending ? (
        <CustomerTableSkeleton />
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="text-4xl mb-3">❌</span>
          <p className="text-sm text-zinc-600 mb-4">{getErrorMessage(error, t('errors.loadFailed'))}</p>
          <button onClick={() => refetch()} className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors">
            {t('errors.loadFailedAction')}
          </button>
        </div>
      ) : customers.length === 0 ? (
        <CustomerEmptyState hasFilters={!!search} />
      ) : (
        <CustomerTable
          customers={customers}
          onDeactivate={(c) => setDeleteTarget(c)}
        />
      )}

      {/* Deactivate dialog */}
      <CustomerDeleteDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeactivate}
        customerName={deleteTarget?.name ?? ''}
      />
    </div>
  )
}
