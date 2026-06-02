/**
 * Product detail page — Chi tiết sản phẩm.
 *
 * Client component: gọi API để lấy chi tiết, xử lý deactivate.
 */
'use client'

import { useState, useEffect, use } from 'react'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
import { toast } from 'sonner'
import ProductDeleteDialog from '@/components/products/ProductDeleteDialog'
import { ProductDetailSkeleton } from '@/components/products/ProductSkeleton'
import { getProduct, deactivateProduct } from '@/lib/api/products'
import type { ProductResponse } from '@/lib/api/product-types'

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const t = useTranslations('products')
  const d = useTranslations('dashboard')
  const router = useRouter()

  const [product, setProduct] = useState<ProductResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDelete, setShowDelete] = useState(false)

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

  const handleDeactivate = async () => {
    try {
      await deactivateProduct(id)
      toast.success(t('toast.deactivated', { name: product?.name ?? '' }))
      router.push('/dashboard/products')
    } catch (err: any) {
      toast.error(err?.message ?? t('toast.error'))
    }
  }

  if (loading) return <ProductDetailSkeleton />

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="text-4xl mb-3">❌</span>
        <p className="text-sm text-zinc-600 mb-4">{error ?? t('errors.notFound')}</p>
        <Link href="/dashboard/products" className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium">
          ← {t('title')}
        </Link>
      </div>
    )
  }

  function formatPrice(val: number | null): string {
    if (val == null) return '—'
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Breadcrumb */}
      <div>
        <nav className="text-xs text-zinc-400 mb-1">
          <Link href="/dashboard" className="hover:text-zinc-600">{d('title')}</Link>
          <span className="mx-1">/</span>
          <Link href="/dashboard/products" className="hover:text-zinc-600">{t('title')}</Link>
          <span className="mx-1">/</span>
          <span className="text-zinc-700 font-medium">{product.name}</span>
        </nav>
        <h2 className="text-lg font-semibold text-zinc-900">{t('detail')}</h2>
      </div>

      {/* Detail card */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-semibold text-zinc-900">{product.name}</h3>
            {product.category && (
              <span className="inline-flex px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-xs font-medium">
                {product.category}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label={t('fields.price')} value={formatPrice(product.price)} highlight />
          <Field label={t('fields.costPrice')} value={formatPrice(product.costPrice)} />
          <Field label={t('fields.stock')} value={`${product.stock} ${product.primaryUnit}`} highlight={product.isLowStock} />
          <Field label={t('fields.minStock')} value={`${product.minStock} ${product.primaryUnit}`} />
          <Field label={t('fields.primaryUnit')} value={product.primaryUnit} />
          <Field label={t('fields.barcode')} value={product.barcode ?? '—'} />
          <Field label={t('fields.imageUrl')} value={product.imageUrl ? (
            <a href={product.imageUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline break-all">{product.imageUrl}</a>
          ) : '—'} />
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
