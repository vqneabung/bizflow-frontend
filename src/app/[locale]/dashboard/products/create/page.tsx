/**
 * Create product page — Form tạo sản phẩm mới.
 *
 * UX:
 * - Header có nút Quay lại + breadcrumb
 * - Form full-width 2 cột với shadcn Card
 */
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
      {/* Header with back button + breadcrumb */}
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="mt-0.5 shrink-0"
          onClick={() => router.back()}
          aria-label="Quay lại"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <nav className="text-xs text-muted-foreground mb-0.5">
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              {d('title')}
            </Link>
            <span className="mx-1">/</span>
            <Link href="/dashboard/products" className="hover:text-foreground transition-colors">
              {t('title')}
            </Link>
            <span className="mx-1">/</span>
            <span className="font-medium text-foreground">{t('create')}</span>
          </nav>
          <h1 className="text-xl font-semibold text-foreground">{t('create')}</h1>
        </div>
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
