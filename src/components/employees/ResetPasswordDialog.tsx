'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import {
  RESET_PASSWORD_DEFAULTS,
  resetPasswordFormSchema,
  type ResetPasswordFormData,
} from '@/lib/schemas/employee-schema'
import { useResetPasswordMutation } from '@/lib/query/employees'
import { getErrorMessage } from '@/lib/types'

interface ResetPasswordDialogProps {
  isOpen: boolean
  employeeId: string | null
  employeeName: string | null
  onClose: () => void
}

export default function ResetPasswordDialog({
  isOpen,
  employeeId,
  employeeName,
  onClose,
}: ResetPasswordDialogProps) {
  const t = useTranslations('employees')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: RESET_PASSWORD_DEFAULTS,
  })

  const resetMutation = useResetPasswordMutation()

  useEffect(() => {
    if (isOpen) reset(RESET_PASSWORD_DEFAULTS)
  }, [isOpen, reset])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen || !employeeId) return null

  const onSubmit = handleSubmit(async ({ newPassword }) => {
    try {
      await resetMutation.mutateAsync({ id: employeeId, newPassword })
      toast.success(t('messages.passwordReset'))
      onClose()
    } catch (err) {
      toast.error(getErrorMessage(err, t('messages.passwordResetFailed')))
    }
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-password-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="reset-password-title" className="text-lg font-semibold text-zinc-900 mb-2">
          {t('actions.resetPassword')}
        </h2>
        <p className="text-sm text-zinc-600 mb-5">
          {employeeName ?? ''}
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="reset-new-password" className="block text-sm font-medium text-zinc-700">
              {t('form.newPassword')} <span className="text-red-500">*</span>
            </label>
            <input
              id="reset-new-password"
              type="password"
              autoComplete="new-password"
              {...register('newPassword')}
              className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
            <p className="text-xs text-zinc-500">{t('form.passwordHint')}</p>
            {errors.newPassword && (
              <p className="text-xs text-red-600">{t('validation.passwordMin')}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-zinc-300 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
              {t('form.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
            >
              {isSubmitting ? t('form.submitting') : t('form.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}