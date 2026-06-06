/**
 * Edit product page — Form sửa sản phẩm.
 *
 * Layer: PRESENTATION (UI only).
 * Data: useProductQuery + useUpdateProductMutation (TanStack Query).
 * Form validation: lib/schemas/product-schema.ts (zod).
 * FormData → DTO: lib/mappers/product-mapper.ts.
 */
'use client'

import { useState, use } from 'react'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ProductForm from '@/components/products/ProductForm'
import { ProductDetailSkeleton } from '@/components/products/ProductSkeleton'
import {
  useProductQuery,
  useUpdateProductMutation,
} from '@/lib/query/products'
import { toUpdateProductRequest } from '@/lib/mappers/product-mapper'
import type { EditProductFormData } from '@/lib/schemas/product-schema'
import { getErrorMessage } from '@/lib/types/error'

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const t = useTranslations('products')
  const d = useTranslations('dashboard')
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  // ===== Data fetching =====
  const { data: result, isPending } = useProductQuery(id)

  // ===== Mutation =====
  const updateMutation = useUpdateProductMutation()

  // ===== Derived =====
  const product = result?.data ?? null

  // ===== Handlers =====
  async function handleSubmit(data: EditProductFormData) {
    setServerError(null)
    try {
      const payload = toUpdateProductRequest(data)
      await updateMutation.mutateAsync({ id, data: payload })
      toast.success(t('toast.updated', { name: payload.name ?? product?.name ?? '' }))
      router.push('/dashboard/products')
    } catch (err: unknown) {
      setServerError(getErrorMessage(err, t('toast.error')))
    }
  }

  // ===== Render states =====
  if (isPending || !product) return <ProductDetailSkeleton />

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
            <Link href={`/dashboard/products/${id}`} className="hover:text-foreground transition-colors">
              {product.name}
            </Link>
            <span className="mx-1">/</span>
            <span className="font-medium text-foreground">{t('edit')}</span>
          </nav>
          <h1 className="text-xl font-semibold text-foreground">{t('edit')}</h1>
        </div>
      </div>

      <ProductForm
        mode="edit"
        defaultValues={{
          name: product.name,
          categoryId: product.categoryId ?? '',
          primaryUnitId: product.primaryUnitId,
          price: product.price,
          costPrice: product.costPrice ?? undefined,
          stock: product.stock,
          minStock: product.minStock,
          imageUrl: product.imageUrl ?? '',
          imageKeys: product.imageKeys ?? [],
          barcode: product.barcode ?? '',
        }}
        existingImageKeys={product.imageKeys ?? []}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        serverError={serverError}
      />
    </div>
  )
}
