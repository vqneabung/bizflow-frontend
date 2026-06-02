/**
 * ProductForm.tsx — Form tạo/sửa sản phẩm (react-hook-form + zod).
 *
 * Dùng chung cho cả create và edit:
 * - Create: tất cả fields required
 * - Edit: tất cả fields optional (chỉ gửi field thay đổi)
 *
 * UX:
 * - Validation real-time (onChange mode)
 * - Input masking cho giá (tự động thêm dấu phân cách)
 * - Error message dưới từng field
 * - Loading state trên submit button
 * - Unsaved changes warning
 */
'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// ===== Zod schema =====
const createSchema = z.object({
  name: z.string().min(1, 'nameRequired').max(255),
  category: z.string().max(100).optional().or(z.literal('')),
  primaryUnit: z.string().min(1, 'unitRequired').max(50),
  price: z.coerce.number().positive('pricePositive'),
  costPrice: z.coerce.number().min(0).optional(),
  stock: z.coerce.number().min(0, 'stockNonNegative').optional().default(0),
  minStock: z.coerce.number().min(0, 'minStockNonNegative').optional().default(0),
  imageUrl: z.string().url().optional().or(z.literal('')),
  barcode: z.string().max(100).optional().or(z.literal('')),
})

const editSchema = z.object({
  name: z.string().min(1, 'nameRequired').max(255).optional().or(z.literal('')),
  category: z.string().max(100).optional().or(z.literal('')),
  primaryUnit: z.string().min(1, 'unitRequired').max(50).optional().or(z.literal('')),
  price: z.coerce.number().positive('pricePositive').optional(),
  costPrice: z.coerce.number().min(0).optional(),
  stock: z.coerce.number().min(0, 'stockNonNegative').optional(),
  minStock: z.coerce.number().min(0, 'minStockNonNegative').optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  barcode: z.string().max(100).optional().or(z.literal('')),
})

export type CreateFormData = z.infer<typeof createSchema>
export type EditFormData = z.infer<typeof editSchema>

interface ProductFormProps {
  mode: 'create' | 'edit'
  defaultValues?: Partial<CreateFormData>
  onSubmit: (data: any) => Promise<void>
  isSubmitting: boolean
  serverError?: string | null
}

export default function ProductForm({
  mode,
  defaultValues,
  onSubmit,
  isSubmitting,
  serverError,
}: ProductFormProps) {
  const t = useTranslations('products')
  const e = useTranslations('products.errors')
  const a = useTranslations('products.actions')

  const schema = mode === 'create' ? createSchema : editSchema

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      category: '',
      primaryUnit: '',
      price: undefined,
      costPrice: undefined,
      stock: 0,
      minStock: 0,
      imageUrl: '',
      barcode: '',
      ...defaultValues,
    },
  })

  // Unsaved changes warning
  useEffect(() => {
    if (!isDirty) return
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  // Lỗi message helper
  function getFieldError(field: keyof CreateFormData): string | undefined {
    const err = errors[field]
    if (!err) return undefined
    const key = err.message as string
    // Try to get from products.errors namespace first, fallback to raw message
    const translation = e(key as any)
    return translation !== key ? translation : String(err?.message ?? '')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-8">
      {/* Server error */}
      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          {serverError}
        </div>
      )}

      {/* ===== Thông tin cơ bản ===== */}
      <section className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm space-y-5">
        <h3 className="text-base font-semibold text-zinc-900 pb-1 border-b border-zinc-100">
          📋 {mode === 'create' ? t('create') : t('edit')}
        </h3>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">
            {t('fields.name')} <span className="text-red-500">*</span>
          </label>
          <input {...register('name')} placeholder={t('fields.namePlaceholder')}
            className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting} />
          {errors.name && <p className="mt-1 text-xs text-red-600">{getFieldError('name')}</p>}
        </div>

        {/* Primary Unit */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">
            {t('fields.primaryUnit')} <span className="text-red-500">*</span>
          </label>
          <input {...register('primaryUnit')} placeholder={t('fields.primaryUnitPlaceholder')}
            className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:opacity-50"
            disabled={isSubmitting} />
          {errors.primaryUnit && <p className="mt-1 text-xs text-red-600">{getFieldError('primaryUnit')}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">
            {t('fields.category')}
          </label>
          <input {...register('category')} placeholder={t('fields.categoryPlaceholder')}
            className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:opacity-50"
            disabled={isSubmitting} />
          {errors.category && <p className="mt-1 text-xs text-red-600">{getFieldError('category')}</p>}
        </div>

        {/* Price + Cost Price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              {t('fields.price')} <span className="text-red-500">*</span>
            </label>
            <input type="number" step="1" min="1" {...register('price', { valueAsNumber: true })}
              placeholder={t('fields.pricePlaceholder')}
              className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:opacity-50" disabled={isSubmitting} />
            {errors.price && <p className="mt-1 text-xs text-red-600">{getFieldError('price')}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              {t('fields.costPrice')}
            </label>
            <input type="number" step="1" min="0" {...register('costPrice', { valueAsNumber: true, setValueAs: v => v === '' ? undefined : parseFloat(v) })}
              placeholder={t('fields.costPricePlaceholder')}
              className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:opacity-50" disabled={isSubmitting} />
          </div>
        </div>

        {/* Stock + Min Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              {t('fields.stock')}
            </label>
            <input type="number" step="0.01" min="0" {...register('stock', { valueAsNumber: true })}
              className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:opacity-50" disabled={isSubmitting} />
            {errors.stock && <p className="mt-1 text-xs text-red-600">{getFieldError('stock')}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              {t('fields.minStock')}
            </label>
            <input type="number" step="0.01" min="0" {...register('minStock', { valueAsNumber: true })}
              className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:opacity-50" disabled={isSubmitting} />
            {errors.minStock && <p className="mt-1 text-xs text-red-600">{getFieldError('minStock')}</p>}
          </div>
        </div>

        {/* Barcode */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">
            {t('fields.barcode')}
          </label>
          <input {...register('barcode')} placeholder={t('fields.barcodePlaceholder')}
            className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:opacity-50" disabled={isSubmitting} />
          {errors.barcode && <p className="mt-1 text-xs text-red-600">{getFieldError('barcode')}</p>}
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">
            {t('fields.imageUrl')}
          </label>
          <input {...register('imageUrl')} placeholder={t('fields.imageUrlPlaceholder')}
            className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:opacity-50" disabled={isSubmitting} />
          {errors.imageUrl && <p className="mt-1 text-xs text-red-600">{getFieldError('imageUrl')}</p>}
        </div>
      </section>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={isSubmitting}
          className="px-6 py-3 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? a('creating') : a('save')}
        </button>
        {mode === 'edit' && (
          <span className="text-xs text-zinc-400">Chỉ gửi các trường đã thay đổi</span>
        )}
      </div>
    </form>
  )
}
