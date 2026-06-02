/**
 * ProductTable.tsx — Bảng sản phẩm (desktop) + Card view (mobile).
 *
 * Desktop (≥768px): table với sort header, search, pagination.
 * Mobile (<768px): card view, mỗi sản phẩm là 1 card.
 */
'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import type { ProductResponse, PaginationMeta } from '@/lib/api/product-types'

/** Format giá VND */
function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

/** Format ngày relative (VD: "2 giờ trước") */
function formatRelativeTime(dateStr: string): string {
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Vừa xong'
  if (minutes < 60) return `${minutes} phút trước`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} giờ trước`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} ngày trước`
  return new Intl.DateTimeFormat('vi-VN').format(new Date(dateStr))
}

interface ProductTableProps {
  products: ProductResponse[]
  pagination: PaginationMeta
  sortBy: string
  sortDir: 'asc' | 'desc'
  onSort: (field: string) => void
  onPageChange: (page: number) => void
  onDeactivate: (product: ProductResponse) => void
}

const SORTABLE_FIELDS = ['name', 'price', 'stock', 'createdAt']

export default function ProductTable({
  products,
  pagination,
  sortBy,
  sortDir,
  onSort,
  onPageChange,
  onDeactivate,
}: ProductTableProps) {
  const t = useTranslations('products')

  // Sort indicator
  function SortIcon(field: string) {
    if (sortBy !== field) return <span className="ml-1 text-zinc-300">↕</span>
    return <span className="ml-1 text-brand-600">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  const page = pagination.page + 1 // 0-based → 1-based for display
  const totalPages = pagination.totalPages
  const from = pagination.page * pagination.size + 1
  const to = Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)

  return (
    <div className="space-y-4">
      {/* ===== Mobile: Card View ===== */}
      <div className="md:hidden space-y-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl border border-zinc-200 p-4 shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h4 className="font-medium text-zinc-900 truncate">{product.name}</h4>
                {product.category && (
                  <span className="text-xs text-zinc-500">{product.category}</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {product.isLowStock && (
                  <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-medium">
                    ⚠ {t('badge.lowStock')}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-zinc-400 text-xs">{t('table.price')}</span>
                <p className="font-semibold text-zinc-900">{formatPrice(product.price)}</p>
              </div>
              <div>
                <span className="text-zinc-400 text-xs">{t('table.stock')}</span>
                <p className="font-medium text-zinc-900">
                  {product.stock} {product.primaryUnit}
                  {product.isLowStock && <span className="text-red-600 ml-1">⚠</span>}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-zinc-100">
              <Link
                href={`/dashboard/products/${product.id}`}
                className="flex-1 text-center px-3 py-1.5 rounded-lg border border-zinc-300 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
              >
                {t('actions.view')}
              </Link>
              <Link
                href={`/dashboard/products/${product.id}/edit`}
                className="flex-1 text-center px-3 py-1.5 rounded-lg border border-zinc-300 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
              >
                {t('actions.edit')}
              </Link>
              <button
                onClick={() => onDeactivate(product)}
                className="flex-1 px-3 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                {t('actions.deactivate')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ===== Desktop: Table ===== */}
      <div className="hidden md:block bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50">
              {['name', 'category', 'price', 'stock', 'actions'].map((field) => (
                <th
                  key={field}
                  className={`px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider ${
                    SORTABLE_FIELDS.includes(field) ? 'cursor-pointer hover:text-zinc-700 select-none' : ''
                  }`}
                  onClick={() => SORTABLE_FIELDS.includes(field) && onSort(field)}
                >
                  {t(`table.${field}`)}
                  {SortIcon(field)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-zinc-50 transition-colors group">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-zinc-900 truncate max-w-[200px]">{product.name}</span>
                    {product.isLowStock && (
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-medium shrink-0">
                        ⚠ {t('badge.lowStock')}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-zinc-400">{product.primaryUnit}</span>
                </td>
                <td className="px-4 py-3.5 text-zinc-600">
                  {product.category ?? <span className="text-zinc-300">—</span>}
                </td>
                <td className="px-4 py-3.5 font-medium text-zinc-900">{formatPrice(product.price)}</td>
                <td className="px-4 py-3.5">
                  <span className={product.isLowStock ? 'text-red-600 font-medium' : 'text-zinc-700'}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/dashboard/products/${product.id}`}
                      className="px-2.5 py-1 rounded-md text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
                    >
                      {t('actions.view')}
                    </Link>
                    <Link
                      href={`/dashboard/products/${product.id}/edit`}
                      className="px-2.5 py-1 rounded-md text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
                    >
                      {t('actions.edit')}
                    </Link>
                    <button
                      onClick={() => onDeactivate(product)}
                      className="px-2.5 py-1 rounded-md text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      {t('actions.deactivate')}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== Pagination ===== */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1 py-2">
          <p className="text-xs text-zinc-500">
            {t('table.showing', { from: String(from), to: String(to), total: String(pagination.totalElements) })}
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 0}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-300 text-zinc-600 hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {t('table.prev')}
            </button>

            {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
              let pageNum: number
              if (totalPages <= 7) {
                pageNum = i
              } else if (page <= 4) {
                pageNum = i
              } else if (page >= totalPages - 3) {
                pageNum = totalPages - 7 + i
              } else {
                pageNum = page - 4 + i
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                    pageNum === pagination.page
                      ? 'bg-brand-600 text-white'
                      : 'text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  {pageNum + 1}
                </button>
              )
            })}

            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= totalPages - 1}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-300 text-zinc-600 hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {t('table.next')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
