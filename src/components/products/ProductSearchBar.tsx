/**
 * ProductSearchBar.tsx — Thanh tìm kiếm + lọc danh mục.
 *
 * UX:
 * - Debounce 300ms: tránh gọi API liên tục khi typing
 * - Filter badges: hiển thị filter đang active, có thể xoá từng cái
 * - Category dropdown: select HTML style với Tailwind
 */
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslations } from 'next-intl'

interface ProductSearchBarProps {
  search: string
  category: string
  categories: string[]
  onSearchChange: (value: string) => void
  onCategoryChange: (value: string) => void
}

export default function ProductSearchBar({
  search,
  category,
  categories,
  onSearchChange,
  onCategoryChange,
}: ProductSearchBarProps) {
  const t = useTranslations('products')
  const [localSearch, setLocalSearch] = useState(search)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounce search input
  const debouncedSearch = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => onSearchChange(value), 300)
    },
    [onSearchChange]
  )

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  // Sync external search changes
  useEffect(() => {
    setLocalSearch(search)
  }, [search])

  const hasFilters = search || category
  const clearAll = () => {
    setLocalSearch('')
    onSearchChange('')
    onCategoryChange('')
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">🔍</span>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => {
              setLocalSearch(e.target.value)
              debouncedSearch(e.target.value)
            }}
            placeholder={t('search')}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>

        {/* Category filter */}
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-zinc-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        >
          <option value="">{t('allCategories')}</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Active filter badges */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {search && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-medium">
              🔍 {t('search')}: {search}
              <button onClick={() => { setLocalSearch(''); onSearchChange('') }} className="ml-1 hover:text-brand-900">✕</button>
            </span>
          )}
          {category && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-medium">
              📂 {t('filterByCategory')}: {category}
              <button onClick={() => onCategoryChange('')} className="ml-1 hover:text-brand-900">✕</button>
            </span>
          )}
          <button onClick={clearAll} className="text-xs text-zinc-500 hover:text-zinc-700 underline">
            Xoá tất cả
          </button>
        </div>
      )}
    </div>
  )
}
