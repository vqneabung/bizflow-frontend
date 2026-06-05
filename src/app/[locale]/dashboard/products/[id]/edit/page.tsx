/**
 * Edit product page — Form sửa sản phẩm.
 *
 * Load dữ liệu hiện tại từ API, fill vào form.
 * Khi submit, chỉ gửi các trường thay đổi (PATCH-style).
 *
 * UX:
 * - Header có nút Quay lại + breadcrumb
 * - Form full-width 2 cột với shadcn Card
 */
'use client'

import { useState, useEffect, use } from 'react'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ProductForm, { type EditFormData } from '@/components/products/ProductForm'
import { ProductDetailSkeleton } from '@/components/products/ProductSkeleton'
import { getProduct, updateProduct } from '@/lib/api/products'
import type { ApiResponse, ProductResponse, UpdateProductRequest } from '@/lib/api/product-types'

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const t = useTranslations('products')
  const d = useTranslations('dashboard')
  const router = useRouter()

  const [product, setProduct] = useState<ProductResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  // Load existing product data
  useEffect(() => {
    setLoading(true)
    getProduct(id)
      .then((res) => {
        if (res.data) setProduct(res.data)
        else setError(t('errors.notFound'))
      })
      .catch(() => setError(t('errors.loadFailed')))
      .finally(() => setLoading(false))
  }, [id, t])

  // Submit handler — chỉ gửi field thay đổi
  async function handleSubmit(data: EditFormData) {
    setIsSubmitting(true)
    setServerError(null)

    // Build PATCH payload — chỉ gửi field có giá trị
    const payload: UpdateProductRequest = {}
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== '') {
        (payload as any)[key] = value
      }
    }

    try {
      const result: ApiResponse<ProductResponse> = await updateProduct(id, payload)
      toast.success(t('toast.updated', { name: payload.name ?? product?.name ?? '' }))
      router.push('/dashboard/products')
    } catch (err: any) {
      const message = err?.message ?? t('toast.error')
      setServerError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) return <ProductDetailSkeleton />

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="text-4xl mb-3">❌</span>
        <p className="text-sm text-muted-foreground mb-4">{error ?? t('errors.notFound')}</p>
        <Link href="/dashboard/products">
          <Button variant="default">← {t('title')}</Button>
        </Link>
      </div>
    )
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
          category: product.category ?? '',
          primaryUnit: product.primaryUnit,
          price: product.price,
          costPrice: product.costPrice ?? undefined,
          stock: product.stock,
          minStock: product.minStock,
          imageUrl: product.imageUrl ?? '',
          barcode: product.barcode ?? '',
        }}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        serverError={serverError}
      />
    </div>
  )
}
