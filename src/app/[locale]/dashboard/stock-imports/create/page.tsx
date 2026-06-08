'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useRouter } from '@/i18n/navigation'
import { toast } from 'sonner'
import StockImportForm from '@/components/stock-imports/StockImportForm'
import { useCreateStockImportMutation } from '@/lib/query/stock-imports'
import { toCreateStockImportRequest } from '@/lib/mappers/stock-import-mapper'
import { getErrorMessage } from '@/lib/types'
import { useState } from 'react'
import type { CreateStockImportFormData } from '@/lib/schemas/stock-import-schema'

export default function CreateStockImportPage() {
  const t = useTranslations('stockImports')
  const d = useTranslations('dashboard')
  const router = useRouter()
  const mutation = useCreateStockImportMutation()
  const [serverError, setServerError] = useState<string | null>(null)

  const handleSubmit = async (data: CreateStockImportFormData) => {
    setServerError(null)
    try {
      const req = toCreateStockImportRequest(data)
      const res = await mutation.mutateAsync(req)
      toast.success(t('toast.created', { referenceNumber: res.data?.referenceNumber ?? '' }))
      router.push('/dashboard/stock-imports')
    } catch (err: unknown) {
      setServerError(getErrorMessage(err, t('toast.error')))
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="text-xs text-zinc-400 mb-1">
        <Link href="/dashboard" className="hover:text-zinc-600">{d('title')}</Link>
        <span className="mx-1">/</span>
        <Link href="/dashboard/stock-imports" className="hover:text-zinc-600">{t('title')}</Link>
        <span className="mx-1">/</span>
        <span className="text-zinc-700 font-medium">{t('create')}</span>
      </nav>

      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/stock-imports"
          className="p-2 rounded-xl hover:bg-zinc-100 transition-colors"
        >
          <span className="text-lg">←</span>
        </Link>
        <h2 className="text-lg font-semibold text-zinc-900">{t('create')}</h2>
      </div>

      <StockImportForm
        onSubmit={handleSubmit}
        isSubmitting={mutation.isPending}
        serverError={serverError}
      />
    </div>
  )
}
