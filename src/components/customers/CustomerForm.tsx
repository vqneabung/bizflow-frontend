'use client'

import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { BaseFormProps } from '@/lib/types'
import {
  createCustomerFormSchema,
  editCustomerFormSchema,
  CUSTOMER_FORM_DEFAULTS,
  type CreateCustomerFormData,
  type EditCustomerFormData,
} from '@/lib/schemas/customer-schema'

interface CustomerFormProps extends BaseFormProps<CreateCustomerFormData | EditCustomerFormData> {
  /** Edit mode: chỉ gửi field thay đổi (PATCH-style) */
}

export default function CustomerForm({
  mode,
  defaultValues,
  onSubmit,
  isSubmitting,
  serverError,
}: CustomerFormProps) {
  const t = useTranslations('customers')

  const schema = mode === 'create' ? createCustomerFormSchema : editCustomerFormSchema

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCustomerFormData | EditCustomerFormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? (CUSTOMER_FORM_DEFAULTS as CreateCustomerFormData),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      {serverError && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* Tên khách hàng */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
          {t('fields.name')} <span className="text-red-500">*</span>
        </label>
        <input
          {...register('name')}
          placeholder={t('fields.namePlaceholder')}
          className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
        />
        {errors.name && (
          <p className="text-xs text-red-500 mt-1">{t('errors.nameRequired')}</p>
        )}
      </div>

      {/* Số điện thoại */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
          {t('fields.phone')}
        </label>
        <input
          {...register('phone')}
          type="tel"
          placeholder={t('fields.phonePlaceholder')}
          className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
          {t('fields.email')}
        </label>
        <input
          {...register('email')}
          type="email"
          placeholder={t('fields.emailPlaceholder')}
          className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
        />
      </div>

      {/* Địa chỉ */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
          {t('fields.address')}
        </label>
        <input
          {...register('address')}
          placeholder={t('fields.addressPlaceholder')}
          className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
        />
      </div>

      {/* Ghi chú */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
          {t('fields.notes')}
        </label>
        <textarea
          {...register('notes')}
          rows={3}
          placeholder={t('fields.notesPlaceholder')}
          className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? t('actions.saving') : t('actions.save')}
        </button>
      </div>
    </form>
  )
}
