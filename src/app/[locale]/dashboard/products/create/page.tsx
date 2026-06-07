/**
 * Create product page — Form tạo sản phẩm mới.
 *
 * Layer: PRESENTATION (UI only).
 * Data: useCreateProductMutation (TanStack Query).
 * Form validation: lib/schemas/product-schema.ts (zod).
 * FormData → DTO: lib/mappers/product-mapper.ts.
 */
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ProductForm from '@/components/products/ProductForm'
import { useCreateProductMutation } from '@/lib/query/products'
import { toCreateProductRequest } from '@/lib/mappers/product-mapper'
import type { CreateProductFormData } from '@/lib/schemas/product-schema'
import { getErrorMessage } from '@/lib/types'

export default function CreateProductPage() {
  const t = useTranslations('products')
  const d = useTranslations('dashboard')
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  // ===== Mutation =====
  const createMutation = useCreateProductMutation()

  // ===== Handlers =====
  async function handleSubmit(data: CreateProductFormData) {
    setServerError(null)
    try {
      await createMutation.mutateAsync(toCreateProductRequest(data))
      toast.success(t('toast.created', { name: data.name }))
      router.push('/dashboard/products')
    } catch (err: unknown) {
      setServerError(getErrorMessage(err, t('toast.error')))
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
        isSubmitting={createMutation.isPending}
        serverError={serverError}
      />
    </div>
  )
}
