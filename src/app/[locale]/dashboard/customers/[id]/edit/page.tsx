'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useRouter } from '@/i18n/navigation'
import { useParams, notFound } from 'next/navigation'
import { toast } from 'sonner'
import CustomerForm from '@/components/customers/CustomerForm'
import { CustomerDetailSkeleton } from '@/components/customers/CustomerSkeleton'
import { useCustomerQuery, useUpdateCustomerMutation } from '@/lib/query/customers'
import { toUpdateCustomerRequest } from '@/lib/mappers/customer-mapper'
import { getErrorMessage } from '@/lib/types'
import { useState } from 'react'
import type { EditCustomerFormData } from '@/lib/schemas/customer-schema'

export default function EditCustomerPage() {
  const t = useTranslations('customers')
  const d = useTranslations('dashboard')
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const mutation = useUpdateCustomerMutation()
  const [serverError, setServerError] = useState<string | null>(null)

  const { data: res, isPending, isError, error } = useCustomerQuery(id)

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
        </div>
      )
    }
    notFound()
  }

  const customer = res.data

  const defaultValues: EditCustomerFormData = {
    name: customer.name,
    phone: customer.phone ?? '',
    email: customer.email ?? '',
    address: customer.address ?? '',
    notes: customer.notes ?? '',
  }

  const handleSubmit = async (data: EditCustomerFormData) => {
    setServerError(null)
    try {
      const res = await mutation.mutateAsync({ id, data: toUpdateCustomerRequest(data) })
      toast.success(t('toast.updated', { name: res.data?.name ?? '' }))
      router.push(`/dashboard/customers/${id}`)
    } catch (err: unknown) {
      setServerError(getErrorMessage(err, t('toast.error')))
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Breadcrumb */}
      <nav className="text-xs text-zinc-400 mb-1">
        <Link href="/dashboard" className="hover:text-zinc-600">{d('title')}</Link>
        <span className="mx-1">/</span>
        <Link href="/dashboard/customers" className="hover:text-zinc-600">{t('title')}</Link>
        <span className="mx-1">/</span>
        <Link href={`/dashboard/customers/${customer.id}`} className="hover:text-zinc-600">{customer.name}</Link>
        <span className="mx-1">/</span>
        <span className="text-zinc-700 font-medium">{t('edit')}</span>
      </nav>

      <div className="flex items-center gap-4">
        <Link
          href={`/dashboard/customers/${customer.id}`}
          className="p-2 rounded-xl hover:bg-zinc-100 transition-colors"
        >
          <span className="text-lg">←</span>
        </Link>
        <h2 className="text-lg font-semibold text-zinc-900">{t('edit')}</h2>
      </div>

      <CustomerForm
        mode="edit"
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        isSubmitting={mutation.isPending}
        serverError={serverError}
      />
    </div>
  )
}
