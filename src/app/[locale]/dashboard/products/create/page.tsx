/**
 * Create product page — Form tạo sản phẩm mới.
 */
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
import { toast } from 'sonner'
import ProductForm, { type CreateFormData } from '@/components/products/ProductForm'
import { createProduct } from '@/lib/api/products'
import type { ApiResponse, ProductResponse } from '@/lib/api/product-types'

export default function CreateProductPage() {
  const t = useTranslations('products')
  const d = useTranslations('dashboard')
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  async function handleSubmit(data: CreateFormData) {
    setIsSubmitting(true)
    setServerError(null)
    try {
      const result: ApiResponse<ProductResponse> = await createProduct(data as any)
      toast.success(t('toast.created', { name: data.name }))
      router.push('/dashboard/products')
    } catch (err: any) {
      const message = err?.message ?? t('toast.error')
      setServerError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div>
        <nav className="text-xs text-zinc-400 mb-1">
          <Link href="/dashboard" className="hover:text-zinc-600">{d('title')}</Link>
          <span className="mx-1">/</span>
          <Link href="/dashboard/products" className="hover:text-zinc-600">{t('title')}</Link>
          <span className="mx-1">/</span>
          <span className="text-zinc-700 font-medium">{t('create')}</span>
        </nav>
        <h2 className="text-lg font-semibold text-zinc-900">{t('create')}</h2>
      </div>

      <ProductForm
        mode="create"
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        serverError={serverError}
      />
    </div>
  )
}
