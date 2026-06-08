'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useRouter } from '@/i18n/navigation'
import { toast } from 'sonner'
import OrderForm from '@/components/orders/OrderForm'
import { useCreateOrderMutation } from '@/lib/query/orders'
import { toCreateOrderRequest } from '@/lib/mappers/order-mapper'
import { getErrorMessage } from '@/lib/types'
import { useState } from 'react'
import type { CreateOrderFormData } from '@/lib/schemas/order-schema'

export default function CreateOrderPage() {
  const rootT = useTranslations()
  const o = useTranslations('orders')
  const d = useTranslations('dashboard')
  const router = useRouter()
  const mutation = useCreateOrderMutation()
  const [serverError, setServerError] = useState<string | null>(null)

  const handleSubmit = async (data: CreateOrderFormData) => {
    setServerError(null)
    try {
      const req = toCreateOrderRequest(data)
      await mutation.mutateAsync(req)
      toast.success(o('toast.created', { referenceNumber: '' }))
      // Mutation's onSuccess will navigate to detail page
    } catch (err: unknown) {
      setServerError(getErrorMessage(err, o('toast.error')))
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="text-xs text-zinc-400 mb-1">
        <Link href="/dashboard" className="hover:text-zinc-600">{d('title')}</Link>
        <span className="mx-1">/</span>
        <Link href="/dashboard/orders" className="hover:text-zinc-600">{o('title')}</Link>
        <span className="mx-1">/</span>
        <span className="text-zinc-700 font-medium">{o('create')}</span>
      </nav>

      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/orders"
          className="p-2 rounded-xl hover:bg-zinc-100 transition-colors"
        >
          <span className="text-lg">←</span>
        </Link>
        <h2 className="text-lg font-semibold text-zinc-900">{o('create')}</h2>
      </div>

      <OrderForm
        onSubmit={handleSubmit}
        isSubmitting={mutation.isPending}
        serverError={serverError}
        t={(key: string) => rootT(key)}
      />
    </div>
  )
}
