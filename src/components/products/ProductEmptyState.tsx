/**
 * ProductEmptyState.tsx — Empty state cho product list.
 *
 * Hiển thị khi:
 * - Chưa có sản phẩm nào
 * - Tìm kiếm không có kết quả
 * - Lọc không có kết quả
 */
'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

interface ProductEmptyStateProps {
  /** Có bộ lọc/search đang active không? */
  hasFilters?: boolean
}

export default function ProductEmptyState({ hasFilters }: ProductEmptyStateProps) {
  const t = useTranslations('products')

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-5xl mb-4">📦</span>
      <h3 className="text-lg font-semibold text-zinc-900 mb-1">
        {hasFilters ? t('table.empty') : t('table.empty')}
      </h3>
      <p className="text-sm text-zinc-500 mb-6 max-w-sm">
        {hasFilters
          ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
          : 'Bắt đầu bằng cách thêm sản phẩm đầu tiên vào cửa hàng của bạn'}
      </p>
      {!hasFilters && (
        <Link
          href="/dashboard/products/create"
          className="inline-flex items-center px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          + {t('table.emptyAction')}
        </Link>
      )}
    </div>
  )
}
