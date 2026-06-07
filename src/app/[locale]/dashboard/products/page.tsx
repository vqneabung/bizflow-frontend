/**
 * Products list page — Danh sách sản phẩm.
 *
 * Layer: PRESENTATION (UI only).
 * Data: useProductsQuery + useDeactivateProductMutation (TanStack Query).
 * Category filter: dùng categoryId từ API reference data.
 */
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useProductFilters } from '@/lib/hooks/use-product-filters'
import { Link } from '@/i18n/navigation'
import { toast } from 'sonner'
import ProductTable from '@/components/products/ProductTable'
import ProductSearchBar from '@/components/products/ProductSearchBar'
import ProductEmptyState from '@/components/products/ProductEmptyState'
import ProductDeleteDialog from '@/components/products/ProductDeleteDialog'
import { ProductTableSkeleton } from '@/components/products/ProductSkeleton'
import {
  useProductsQuery,
  useDeactivateProductMutation,
} from '@/lib/query/products'
import { useCategoriesQuery } from '@/lib/query/reference'
import { getErrorMessage } from '@/lib/types/error'
import type { CategoryOption } from '@/lib/types'

export default function ProductsPage() {
  const t = useTranslations('products')
  const d = useTranslations('dashboard')

  // ===== Filter state (UI only) =====
  const {
    search,
    categoryId,
    page,
    sortBy,
    sortDir,
    handleSort,
    handleSearchChange,
    handleCategoryChange,
    setPage,
  } = useProductFilters()

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  // ===== Categories for filter dropdown =====
  const { data: categories = [] } = useCategoriesQuery()

  // ===== Data fetching (TanStack Query) =====
  const {
    data: result,
    isPending,
    isError,
    error,
    refetch,
  } = useProductsQuery({
    search: search || undefined,
    categoryId: categoryId || undefined,
    page,
    size: 20,
    sortBy,
    sortDir,
  })

  // ===== Mutation =====
  const deactivateMutation = useDeactivateProductMutation()

  const handleDeactivate = async () => {
    if (!deleteTarget) return
    try {
      await deactivateMutation.mutateAsync(deleteTarget.id)
      toast.success(t('toast.deactivated', { name: deleteTarget.name }))
      setDeleteTarget(null)
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t('toast.error')))
    }
  }

  // ===== Derived =====
  const products = result?.data ?? []
  const pagination = result?.pagination ?? null

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <div>
          <nav className="text-xs text-zinc-400 mb-1">
            <Link href="/dashboard" className="hover:text-zinc-600">{d('title')}</Link>
            <span className="mx-1">/</span>
            <span className="text-zinc-700 font-medium">{t('title')}</span>
          </nav>
          <h2 className="text-lg font-semibold text-zinc-900">{t('title')}</h2>
          <p className="text-sm text-zinc-500">{t('subtitle')}</p>
        </div>
        <Link
          href="/dashboard/products/create"
          className="px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors shrink-0"
        >
          + {t('create')}
        </Link>
      </div>

      {/* Search & Filter */}
      <ProductSearchBar
        search={search}
        categoryId={categoryId}
        categories={categories.map(c => ({ id: c.id, name: c.name }))}
        onSearchChange={handleSearchChange}
        onCategoryChange={handleCategoryChange}
      />

      {/* Content */}
      {isPending ? (
        <ProductTableSkeleton />
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="text-4xl mb-3">❌</span>
          <p className="text-sm text-zinc-600 mb-4">{getErrorMessage(error, t('errors.loadFailed'))}</p>
          <button onClick={() => refetch()} className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors">
            {t('errors.loadFailedAction')}
          </button>
        </div>
      ) : products.length === 0 ? (
        <ProductEmptyState hasFilters={!!(search || categoryId)} />
      ) : (
        <ProductTable
          products={products}
          pagination={pagination!}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
          onPageChange={(p) => setPage(p + 1)}
          onDeactivate={(p) => setDeleteTarget({ id: p.id, name: p.name })}
        />
      )}

      {/* Delete dialog */}
      <ProductDeleteDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeactivate}
        productName={deleteTarget?.name ?? ''}
      />
    </div>
  )
}
