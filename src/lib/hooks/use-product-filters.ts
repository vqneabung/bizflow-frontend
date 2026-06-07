/**
 * use-product-filters.ts — Hook quản lý filter state cho products page.
 *
 * Tách riêng khỏi page component để:
 * - Dễ test (unit test hook độc lập)
 * - Dễ reuse (nếu cần filter ở page khác)
 * - Cleaner page component (tách presentation khỏi state management)
 */
'use client'

import { useState } from 'react'

interface ProductFilters {
  search: string
  categoryId: string
  page: number
  sortBy: string
  sortDir: 'asc' | 'desc'
}

interface UseProductFiltersReturn extends ProductFilters {
  handleSort: (field: string) => void
  handleSearchChange: (value: string) => void
  handleCategoryChange: (value: string) => void
  setPage: (page: number) => void
}

export function useProductFilters(): UseProductFiltersReturn {
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

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
    setCategoryId(value)
    setPage(1)
  }

  return {
    search,
    categoryId,
    page,
    sortBy,
    sortDir,
    handleSort,
    handleSearchChange,
    handleCategoryChange,
    setPage,
  }
}
