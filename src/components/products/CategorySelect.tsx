/**
 * CategorySelect.tsx — Combobox cho danh mục, tích hợp quick-create.
 *
 * Fetch categories từ API via TanStack Query, search + filter, cho phép user tạo category mới inline.
 */
'use client'

import Combobox from '@/components/ui/combobox'
import { useCategoriesQuery, useFindOrCreateCategoryMutation } from '@/lib/query/reference'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

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
  const { data: items = [], isPending } = useCategoriesQuery()
  const createCategoryMutation = useFindOrCreateCategoryMutation()
  const t = useTranslations('common')

  const handleAddNew = async (name: string) => {
    try {
      const res = await createCategoryMutation.mutateAsync({ name })
      if (res.data) onChange(res.data.id)
    } catch {
      toast.error(t('errors.createCategory'))
    }
  }

  return (
    <Combobox
      items={items.map(c => ({ id: c.id, name: c.name }))}
      value={value}
      onChange={onChange}
      label="Danh mục"
      placeholder="Chọn hoặc nhập danh mục..."
      enableAdd
      onAddNew={handleAddNew}
      isLoading={isPending}
      error={error}
      disabled={disabled}
      required={false}
    />
  )
}