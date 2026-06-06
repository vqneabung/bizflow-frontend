/**
 * UnitSelect.tsx — Combobox cho đơn vị tính, tích hợp quick-create.
 *
 * Fetch units từ API, search + filter, cho phép user tạo unit mới inline.
 */
'use client'

import { useEffect, useState } from 'react'
import Combobox from '@/components/ui/combobox'
import { listUnits, findOrCreateUnit } from '@/lib/api/reference'
import type { ComboboxItem } from '@/components/ui/combobox'

interface UnitSelectProps {
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
  required?: boolean
}

export default function UnitSelect({
  value,
  onChange,
  error,
  disabled = false,
  required = true,
}: UnitSelectProps) {
  const [items, setItems] = useState<ComboboxItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch units on mount
  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    listUnits()
      .then((units) => {
        if (!cancelled) {
          setItems(units.map(u => ({ id: u.id, name: u.name })))
        }
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  // Quick-create: find-or-create unit, then select it
  const handleAddNew = async (name: string) => {
    try {
      const res = await findOrCreateUnit(name)
      if (res.data) {
        const newItem = { id: res.data.id, name: res.data.name }
        setItems(prev => {
          if (prev.some(i => i.id === newItem.id)) return prev
          return [...prev, newItem]
        })
        onChange(res.data.id)
      }
    } catch (err) {
      console.error('Failed to create unit:', err)
    }
  }

  return (
    <Combobox
      items={items}
      value={value}
      onChange={onChange}
      label="Đơn vị tính chính"
      placeholder="Chọn hoặc nhập đơn vị..."
      enableAdd
      onAddNew={handleAddNew}
      isLoading={isLoading}
      error={error}
      disabled={disabled}
      required={required}
    />
  )
}
