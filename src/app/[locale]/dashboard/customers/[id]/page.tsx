'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { notFound } from 'next/navigation'
import { useCustomerQuery, useDeactivateCustomerMutation } from '@/lib/query/customers'
import { CustomerDetailSkeleton } from '@/components/customers/CustomerSkeleton'
import CustomerOrders from '@/components/customers/CustomerOrders'
import { getErrorMessage } from '@/lib/types'
import { toast } from 'sonner'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import CustomerDeleteDialog from '@/components/customers/CustomerDeleteDialog'

type Tab = 'info' | 'orders'

export default function CustomerDetailPage() {
  const t = useTranslations('customers')
  const d = useTranslations('dashboard')
  const params = useParams()
  const id = params.id as string
  const [tab, setTab] = useState<Tab>('info')

  const { data: res, isPending, isError, error } = useCustomerQuery(id)
  const deactivateMutation = useDeactivateCustomerMutation()
  const [showDelete, setShowDelete] = useState(false)

  if (isPending) {
    return (
      <div className="space-y-6 max-w-3xl">
        <nav className="text-xs text-zinc-400 mb-1">
          <Link href="/dashboard" className="hover:text-zinc-600">{d('title')}</Link>
          <span className="mx-1">/</span>
          <Link href="/dashboard/customers" className="hover:text-zinc-600">{t('title')}</Link>
          <span className="mx-1">/</span>
          <span className="text-zinc-400">...</span>
        </nav>
        <CustomerDetailSkeleton />
      </div>
    )
  }

  if (isError || !res?.success || !res.data) {
    if (isError) {
      const msg = getErrorMessage(error, t('errors.loadFailed'))
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-sm text-zinc-600">{msg}</p>
          <Link href="/dashboard/customers" className="mt-4 text-sm text-brand-600 hover:underline">{t('title')}</Link>
        </div>
      )
    }
    notFound()
  }

  const customer = res.data

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Breadcrumb */}
      <nav className="text-xs text-zinc-400 mb-1">
        <Link href="/dashboard" className="hover:text-zinc-600">{d('title')}</Link>
        <span className="mx-1">/</span>
        <Link href="/dashboard/customers" className="hover:text-zinc-600">{t('title')}</Link>
        <span className="mx-1">/</span>
        <span className="text-zinc-700 font-medium">{customer.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/customers"
            className="p-2 rounded-xl hover:bg-zinc-100 transition-colors"
          >
            <span className="text-lg">←</span>
          </Link>
          <h2 className="text-lg font-semibold text-zinc-900">{customer.name}</h2>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/customers/${customer.id}/edit`}
            className="px-4 py-2.5 rounded-xl border border-zinc-300 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            {t('actions.edit')}
          </Link>
          <button
            onClick={() => setShowDelete(true)}
            className="px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
          >
            {t('actions.deactivate')}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-200 flex gap-6">
        <button
          onClick={() => setTab('info')}
          className={`pb-3 text-sm font-medium transition-colors ${
            tab === 'info'
              ? 'text-brand-600 border-b-2 border-brand-600'
              : 'text-zinc-500 hover:text-zinc-700'
          }`}
        >
          {t('tabs.info')}
        </button>
        <button
          onClick={() => setTab('orders')}
          className={`pb-3 text-sm font-medium transition-colors ${
            tab === 'orders'
              ? 'text-brand-600 border-b-2 border-brand-600'
              : 'text-zinc-500 hover:text-zinc-700'
          }`}
        >
          {t('tabs.orders')}
        </button>
      </div>

      {/* Tab content */}
      {tab === 'info' ? (
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-zinc-400 mb-1">{t('fields.phone')}</p>
            <p className="text-sm font-medium text-zinc-900">{customer.phone || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-400 mb-1">{t('fields.email')}</p>
            <p className="text-sm font-medium text-zinc-900">{customer.email || '—'}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-xs text-zinc-400 mb-1">{t('fields.address')}</p>
            <p className="text-sm font-medium text-zinc-900">{customer.address || '—'}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-xs text-zinc-400 mb-1">{t('fields.notes')}</p>
            <p className="text-sm text-zinc-700 whitespace-pre-wrap">{customer.notes || '—'}</p>
          </div>
        </div>
      ) : (
        <CustomerOrders customerId={customer.id} />
      )}

      {/* Delete dialog */}
      <CustomerDeleteDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={async () => {
          try {
            await deactivateMutation.mutateAsync(customer.id)
            toast.success(t('toast.deactivated', { name: customer.name }))
            setShowDelete(false)
          } catch (err: unknown) {
            toast.error(getErrorMessage(err, t('toast.error')))
          }
        }}
        customerName={customer.name}
      />
    </div>
  )
}
