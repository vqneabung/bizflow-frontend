'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useRouter } from '@/i18n/navigation'
import { toast } from 'sonner'
import CustomerForm from '@/components/customers/CustomerForm'
import { useCreateCustomerMutation } from '@/lib/query/customers'
import { toCreateCustomerRequest } from '@/lib/mappers/customer-mapper'
import { getErrorMessage } from '@/lib/types'
import { useState } from 'react'
import type { CreateCustomerFormData, EditCustomerFormData } from '@/lib/schemas/customer-schema'

export default function CreateCustomerPage() {
  const t = useTranslations('customers')
  const d = useTranslations('dashboard')
  const router = useRouter()
  const mutation = useCreateCustomerMutation()
  const [serverError, setServerError] = useState<string | null>(null)

  const handleSubmit = async (data: CreateCustomerFormData | EditCustomerFormData) => {
    setServerError(null)
    try {
      const req = toCreateCustomerRequest(data as CreateCustomerFormData)
      const res = await mutation.mutateAsync(req)
      toast.success(t('toast.created', { name: res.data?.name ?? '' }))
      router.push('/dashboard/customers')
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
        <span className="text-zinc-700 font-medium">{t('create')}</span>
      </nav>

      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/customers"
          className="p-2 rounded-xl hover:bg-zinc-100 transition-colors"
        >
          <span className="text-lg">←</span>
        </Link>
        <h2 className="text-lg font-semibold text-zinc-900">{t('create')}</h2>
      </div>

      <CustomerForm
        mode="create"
        onSubmit={handleSubmit}
        isSubmitting={mutation.isPending}
        serverError={serverError}
      />
    </div>
  )
}
