/**
 * CategorySelect.tsx — Combobox cho danh mục, tích hợp quick-create.
 *
 * Fetch categories từ API, search + filter, cho phép user tạo category mới inline.
 */
'use client'

import { useEffect, useState } from 'react'
import Combobox from '@/components/ui/combobox'
import { listCategories, findOrCreateCategory } from '@/lib/api/reference'
import type { ComboboxItem } from '@/components/ui/combobox'

interface CategorySelectProps {
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
}

export default function CategorySelect({
  value,
  onChange,
  error,
  disabled = false,
}: CategorySelectProps) {
  const [items, setItems] = useState<ComboboxItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch categories on mount
  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    listCategories()
      .then((categories) => {
        if (!cancelled) {
          setItems(categories.map(c => ({ id: c.id, name: c.name })))
        }
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  // Quick-create: find-or-create category, then select it
  const handleAddNew = async (name: string) => {
    try {
      const res = await findOrCreateCategory(name)
      if (res.data) {
        const newItem = { id: res.data.id, name: res.data.name }
        setItems(prev => {
          if (prev.some(i => i.id === newItem.id)) return prev
          return [...prev, newItem]
        })
        onChange(res.data.id)
      }
    } catch (err) {
      console.error('Failed to create category:', err)
    }
  }

  return (
    <Combobox
      items={items}
      value={value}
      onChange={onChange}
      label="Danh mục"
      placeholder="Chọn hoặc nhập danh mục..."
      enableAdd
      onAddNew={handleAddNew}
      isLoading={isLoading}
      error={error}
      disabled={disabled}
      required={false}
    />
  )
}
