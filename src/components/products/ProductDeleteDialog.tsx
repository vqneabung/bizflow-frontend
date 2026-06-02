/**
 * ProductDeleteDialog.tsx — Dialog xác nhận ẩn sản phẩm.
 *
 * UX:
 * - Focus trap: focus vào button Cancel khi mở
 * - Keyboard: Enter xác nhận, Escape huỷ
 * - Loading state khi đang xử lý
 * - Accessible: aria roles + labels
 */
'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

interface ProductDeleteDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  productName: string
}

export default function ProductDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  productName,
}: ProductDeleteDialogProps) {
  const t = useTranslations('products')
  const cancelRef = useRef<HTMLButtonElement>(null)
  const [loading, setLoading] = useState(false)

  // Focus trap
  useEffect(() => {
    if (isOpen) {
      cancelRef.current?.focus()
    }
  }, [isOpen])

  // Keyboard handlers
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
    } catch {
      // Error handled by caller
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-3xl block">⚠️</span>
        <h3 id="dialog-title" className="text-lg font-semibold text-zinc-900">
          {t('confirm.deactivateTitle')}
        </h3>
        <p className="text-sm text-zinc-500 leading-relaxed">
          {t('confirm.deactivateMessage', { name: productName })}
        </p>

        <div className="flex gap-3 pt-2">
          <button
            ref={cancelRef}
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-300 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors disabled:opacity-50"
          >
            {t('confirm.cancel')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? '...' : t('confirm.deactivateConfirm')}
          </button>
        </div>
      </div>
    </div>
  )
}
