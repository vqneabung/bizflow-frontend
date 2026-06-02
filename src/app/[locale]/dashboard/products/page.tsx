/**
 * Products list page — Danh sách sản phẩm.
 *
 * Client Component (interactive search, sort, pagination, deactivate).
 * Data fetching qua Ky → Next.js API route → Spring Boot.
 */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { toast } from 'sonner'
import ProductTable from '@/components/products/ProductTable'
import ProductSearchBar from '@/components/products/ProductSearchBar'
import ProductEmptyState from '@/components/products/ProductEmptyState'
import ProductDeleteDialog from '@/components/products/ProductDeleteDialog'
import { ProductTableSkeleton } from '@/components/products/ProductSkeleton'
import { listProducts, deactivateProduct } from '@/lib/api/products'
import type { ProductResponse, PaginationMeta } from '@/lib/api/product-types'

export default function ProductsPage() {
  const t = useTranslations('products')
  const d = useTranslations('dashboard')

  // ===== State =====
  const [products, setProducts] = useState<ProductResponse[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<ProductResponse | null>(null)

  // ===== Data fetching =====
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await listProducts({
        search: search || undefined,
        category: category || undefined,
        page,
        size: 20,
        sortBy,
        sortDir,
      })
      setProducts(result.data)
      setPagination(result.pagination)
    } catch (err) {
      console.error('Failed to load products:', err)
      setError(t('errors.loadFailed'))
      setProducts([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }, [search, category, page, sortBy, sortDir, t])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // ===== Handlers =====
  const handleSort = (field: string) => {
    if (field === sortBy) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(field)
      setSortDir('asc')
    }
    setPage(1)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleCategoryChange = (value: string) => {
    setCategory(value)
    setPage(1)
  }

  const handleDeactivate = async () => {
    if (!deleteTarget) return
    try {
      await deactivateProduct(deleteTarget.id)
      toast.success(t('toast.deactivated', { name: deleteTarget.name }))
      setDeleteTarget(null)
      fetchProducts()
    } catch (err: any) {
      toast.error(err?.message ?? t('toast.error'))
    }
  }

  // ===== Derive categories from loaded products =====
  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))] as string[]

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
        category={category}
        categories={categories}
        onSearchChange={handleSearchChange}
        onCategoryChange={handleCategoryChange}
      />

      {/* Content */}
      {loading ? (
        <ProductTableSkeleton />
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="text-4xl mb-3">❌</span>
          <p className="text-sm text-zinc-600 mb-4">{error}</p>
          <button onClick={fetchProducts} className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors">
            {t('errors.loadFailedAction')}
          </button>
        </div>
      ) : products.length === 0 ? (
        <ProductEmptyState hasFilters={!!(search || category)} />
      ) : (
        <ProductTable
          products={products}
          pagination={pagination!}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
          onPageChange={(p) => setPage(p + 1)}
          onDeactivate={(p) => setDeleteTarget(p)}
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
