'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import {
  CREATE_EMPLOYEE_DEFAULTS,
  createEmployeeFormSchema,
  type CreateEmployeeFormData,
} from '@/lib/schemas/employee-schema'
import { useCreateEmployeeMutation } from '@/lib/query/employees'
import { getErrorMessage } from '@/lib/types'

interface CreateEmployeeDialogProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreateEmployeeDialog({ isOpen, onClose }: CreateEmployeeDialogProps) {
  const t = useTranslations('employees')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateEmployeeFormData>({
    resolver: zodResolver(createEmployeeFormSchema),
    defaultValues: CREATE_EMPLOYEE_DEFAULTS,
  })

  const createMutation = useCreateEmployeeMutation()

  useEffect(() => {
    if (isOpen) reset(CREATE_EMPLOYEE_DEFAULTS)
  }, [isOpen, reset])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const onSubmit = handleSubmit(async (data) => {
    try {
      await createMutation.mutateAsync({
        email: data.email.trim(),
        password: data.password,
        name: data.name?.trim() || undefined,
      })
      toast.success(t('messages.created'))
      onClose()
    } catch (err) {
      toast.error(getErrorMessage(err, t('messages.createFailed')))
    }
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-employee-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="create-employee-title" className="text-lg font-semibold text-zinc-900 mb-4">
          {t('create')}
        </h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="employee-email" className="block text-sm font-medium text-zinc-700">
              {t('form.email')} <span className="text-red-500">*</span>
            </label>
            <input
              id="employee-email"
              type="email"
              autoComplete="off"
              placeholder={t('form.emailPlaceholder')}
              {...register('email')}
              className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
            {errors.email && (
              <p className="text-xs text-red-600">{t('validation.emailInvalid')}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="employee-name" className="block text-sm font-medium text-zinc-700">
              {t('form.name')}
            </label>
            <input
              id="employee-name"
              type="text"
              placeholder={t('form.namePlaceholder')}
              {...register('name')}
              className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="employee-password" className="block text-sm font-medium text-zinc-700">
              {t('form.password')} <span className="text-red-500">*</span>
            </label>
            <input
              id="employee-password"
              type="password"
              autoComplete="new-password"
              {...register('password')}
              className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
            <p className="text-xs text-zinc-500">{t('form.passwordHint')}</p>
            {errors.password && (
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