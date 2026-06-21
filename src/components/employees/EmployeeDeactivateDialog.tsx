'use client'

import { useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import type { Employee } from '@/lib/types'

interface EmployeeDeactivateDialogProps {
  isOpen: boolean
  employee: Employee | null
  isPending: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
}

export default function EmployeeDeactivateDialog({
  isOpen,
  employee,
  isPending,
  onClose,
  onConfirm,
}: EmployeeDeactivateDialogProps) {
  const t = useTranslations('employees')
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) cancelRef.current?.focus()
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPending) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose, isPending])

  if (!isOpen || !employee) return null

  const displayName = employee.name ?? employee.email

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deactivate-employee-title"
      onClick={() => !isPending && onClose()}
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="deactivate-employee-title" className="text-lg font-semibold text-zinc-900 mb-2">
          {t('actions.deactivate')}?
        </h2>
        <p className="text-sm text-zinc-600 mb-6">
          {t('actions.confirmDeactivate')} <strong>{displayName}</strong>
        </p>
        <div className="flex justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 rounded-xl border border-zinc-300 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
          >
            {t('form.cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
          >
            {isPending ? '...' : t('actions.deactivate')}
          </button>
        </div>
      </div>
    </div>
  )
}