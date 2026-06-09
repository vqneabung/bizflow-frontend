/**
 * UnitSelect.tsx — Combobox cho đơn vị tính, tích hợp quick-create.
 *
 * Fetch units từ API via TanStack Query, search + filter, cho phép user tạo unit mới inline.
 */
'use client'

import Combobox from '@/components/ui/combobox'
import { useUnitsQuery, useFindOrCreateUnitMutation } from '@/lib/query/reference'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

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
  const { data: items = [], isPending } = useUnitsQuery()
  const createUnitMutation = useFindOrCreateUnitMutation()
  const t = useTranslations('common')

  const handleAddNew = async (name: string) => {
    try {
      const res = await createUnitMutation.mutateAsync({ name })
      if (res.data) onChange(res.data.id)
    } catch {
      toast.error(t('errors.createUnit'))
    }
  }

  return (
    <Combobox
      items={items.map(u => ({ id: u.id, name: u.name }))}
      value={value}
      onChange={onChange}
      label="Đơn vị tính chính"
      placeholder="Chọn hoặc nhập đơn vị..."
      enableAdd
      onAddNew={handleAddNew}
      isLoading={isPending}
      error={error}
      disabled={disabled}
      required={required}
    />
  )
}