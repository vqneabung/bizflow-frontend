'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

interface CustomerEmptyStateProps {
  hasFilters?: boolean
}

export default function CustomerEmptyState({ hasFilters }: CustomerEmptyStateProps) {
  const t = useTranslations('customers')

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-5xl mb-4">👥</span>
      <h3 className="text-lg font-semibold text-zinc-900 mb-1">
        {t('empty.title')}
      </h3>
      <p className="text-sm text-zinc-500 mb-6 max-w-sm">
        {hasFilters
          ? 'Thử thay đổi từ khóa tìm kiếm'
          : t('empty.description')}
      </p>
      {!hasFilters && (
        <Link
          href="/dashboard/customers/create"
          className="inline-flex items-center px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          + {t('empty.action')}
        </Link>
      )}
    </div>
  )
}
