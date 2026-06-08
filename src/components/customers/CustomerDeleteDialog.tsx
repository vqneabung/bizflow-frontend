'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

interface CustomerDeleteDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  customerName: string
}

export default function CustomerDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  customerName,
}: CustomerDeleteDialogProps) {
  const t = useTranslations('customers')
  const cancelRef = useRef<HTMLButtonElement>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      cancelRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="delete-dialog-title" className="text-lg font-semibold text-zinc-900 mb-2">
          {t('confirm.deactivateTitle')}
        </h2>
        <p className="text-sm text-zinc-600 mb-6">
          {t('confirm.deactivateMessage', { name: customerName })}
        </p>
        <div className="flex justify-end gap-3">
          <button
            ref={cancelRef}
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl border border-zinc-300 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
          >
            {t('confirm.cancel')}
          </button>
          <button
            onClick={async () => {
              setLoading(true)
              try {
                await onConfirm()
              } finally {
                setLoading(false)
              }
            }}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? '...' : t('confirm.deactivateConfirm')}
          </button>
        </div>
      </div>
    </div>
  )
}
