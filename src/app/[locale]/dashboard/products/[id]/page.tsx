/**
 * Product detail page — Chi tiết sản phẩm.
 *
 * Layer: PRESENTATION (UI only).
 * Data: useProductQuery + useDeactivateProductMutation (TanStack Query).
 */
'use client'

import { useState, use } from 'react'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import ProductDeleteDialog from '@/components/products/ProductDeleteDialog'
import { ProductDetailSkeleton } from '@/components/products/ProductSkeleton'
import { useImageUrl } from '@/lib/hooks/use-image-url'
import {
  useProductQuery,
  useDeactivateProductMutation,
} from '@/lib/query/products'
import { getErrorMessage } from '@/lib/types'

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const t = useTranslations('products')
  const d = useTranslations('dashboard')
  const router = useRouter()
  const [showDelete, setShowDelete] = useState(false)

  // ===== Data fetching =====
  const { data: result, isPending, isError } = useProductQuery(id)

  // ===== Mutation =====
  const deactivateMutation = useDeactivateProductMutation()

  // ===== Derived =====
  const product = result?.data ?? null
  const notFound = isError || (result !== undefined && !result.data)

  // ===== Handlers =====
  const handleDeactivate = async () => {
    try {
      await deactivateMutation.mutateAsync(id)
      toast.success(t('toast.deactivated', { name: product?.name ?? '' }))
      router.push('/dashboard/products')
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('toast.error')))
    }
  }

  // ===== Render states =====
  if (isPending) return <ProductDetailSkeleton />

  if (notFound || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="text-4xl mb-3">❌</span>
        <p className="text-sm text-zinc-600 mb-4">{t('errors.notFound')}</p>
        <Link href="/dashboard/products" className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium">
          ← {t('title')}
        </Link>
      </div>
    )
  }

  // ===== Helpers =====
  function formatPrice(val: number | null): string {
    if (val == null) return '—'
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
  }

  return (
    <div className="max-w-2xl space-y-6">
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
            <Link href="/dashboard" className="hover:text-foreground transition-colors">{d('title')}</Link>
            <span className="mx-1">/</span>
            <Link href="/dashboard/products" className="hover:text-foreground transition-colors">{t('title')}</Link>
            <span className="mx-1">/</span>
            <span className="font-medium text-foreground">{product.name}</span>
          </nav>
          <h1 className="text-xl font-semibold text-foreground">{t('detail')}</h1>
        </div>
      </div>

      {/* Detail card */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-semibold text-zinc-900">{product.name}</h3>
            {product.categoryName && (
              <span className="inline-flex px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-xs font-medium">
                {product.categoryName}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {product.isLowStock && (
              <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">⚠ {t('badge.lowStock')}</span>
            )}
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'}`}>
              {product.isActive ? t('badge.active') : t('badge.inactive')}
            </span>
          </div>
        </div>

        {/* Image gallery — show all product images */}
        {product.imageKeys.length > 0 && (
          <div>
            <p className="text-xs text-zinc-400 mb-2">{t('fields.images')} ({product.imageKeys.length})</p>
            <div className="flex gap-2 flex-wrap">
              {product.imageKeys.map((objectKey) => (
                <ProductImage key={objectKey} objectKey={objectKey} />
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label={t('fields.price')} value={formatPrice(product.price)} highlight />
          <Field label={t('fields.costPrice')} value={formatPrice(product.costPrice)} />
          <Field label={t('fields.stock')} value={`${product.stock} ${product.primaryUnitName}`} highlight={product.isLowStock} />
          <Field label={t('fields.minStock')} value={`${product.minStock} ${product.primaryUnitName}`} />
          <Field label={t('fields.primaryUnit')} value={product.primaryUnitName} />
          <Field label={t('fields.barcode')} value={product.barcode ?? '—'} />
          {product.imageUrl && (
            <Field label={t('fields.imageUrl')} value={
              <a href={product.imageUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline break-all">{product.imageUrl}</a>
            } />
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Link
          href={`/dashboard/products/${id}/edit`}
          className="px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          ✏️ {t('actions.edit')}
        </Link>
        {product.isActive && (
          <button
            onClick={() => setShowDelete(true)}
            className="px-5 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
          >
            🗑️ {t('actions.deactivate')}
          </button>
        )}
      </div>

      <ProductDeleteDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDeactivate}
        productName={product.name}
      />
    </div>
  )
}

/** Helper — hiển thị field label + value */
function Field({ label, value, highlight }: { label: string; value: React.ReactNode; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs text-zinc-400 mb-1">{label}</p>
      <p className={`text-sm font-medium ${highlight ? 'text-red-600' : 'text-zinc-900'}`}>{value}</p>
    </div>
  )
}

/** Helper — hiển thị 1 ảnh với presigned URL */
function ProductImage({ objectKey }: { objectKey: string }) {
  const { url, isLoading, error } = useImageUrl(objectKey)
  if (isLoading) {
    return <div className="w-24 h-24 bg-zinc-100 animate-pulse rounded-lg" />
  }
  if (error || !url) {
    return <div className="w-24 h-24 bg-red-50 rounded-lg flex items-center justify-center text-red-300 text-xs">Lỗi</div>
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      <img
        src={url}
        alt=""
        className="w-24 h-24 object-cover rounded-lg border border-zinc-200 hover:border-primary transition-colors"
      />
    </a>
  )
}
