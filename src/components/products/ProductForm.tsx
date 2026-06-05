/**
 * ProductForm.tsx — Form tạo/sửa sản phẩm (react-hook-form + zod + shadcn).
 *
 * Dùng chung cho cả create và edit:
 * - Create: tất cả fields required
 * - Edit: tất cả fields optional (chỉ gửi field thay đổi)
 *
 * UX:
 * - Validation real-time (onChange mode)
 * - Error message dưới từng field
 * - Loading state trên submit button
 * - Unsaved changes warning
 * - 2-column layout with shadcn Card
 */
'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

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
    const translation = e(key as any)
    return translation !== key ? translation : String(err?.message ?? '')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-5xl space-y-6">
      {/* Server error */}
      {serverError && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3 rounded-lg">
          {serverError}
        </div>
      )}

      {/* ===== Thông tin sản phẩm ===== */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {mode === 'create' ? t('create') : t('edit')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Row 1: Name + Primary Unit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="name">
                {t('fields.name')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                {...register('name')}
                placeholder={t('fields.namePlaceholder')}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{getFieldError('name')}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="primaryUnit">
                {t('fields.primaryUnit')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="primaryUnit"
                {...register('primaryUnit')}
                placeholder={t('fields.primaryUnitPlaceholder')}
                disabled={isSubmitting}
              />
              {errors.primaryUnit && (
                <p className="text-xs text-destructive">{getFieldError('primaryUnit')}</p>
              )}
            </div>
          </div>

          {/* Row 2: Category + Barcode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="category">{t('fields.category')}</Label>
              <Input
                id="category"
                {...register('category')}
                placeholder={t('fields.categoryPlaceholder')}
                disabled={isSubmitting}
              />
              {errors.category && (
                <p className="text-xs text-destructive">{getFieldError('category')}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="barcode">{t('fields.barcode')}</Label>
              <Input
                id="barcode"
                {...register('barcode')}
                placeholder={t('fields.barcodePlaceholder')}
                disabled={isSubmitting}
              />
              {errors.barcode && (
                <p className="text-xs text-destructive">{getFieldError('barcode')}</p>
              )}
            </div>
          </div>

          {/* Visual separator */}
          <div className="border-t border-border" />

          {/* Row 3: Price + Cost Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="price">
                {t('fields.price')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                step="1"
                min="1"
                {...register('price', { valueAsNumber: true })}
                placeholder={t('fields.pricePlaceholder')}
                disabled={isSubmitting}
              />
              {errors.price && (
                <p className="text-xs text-destructive">{getFieldError('price')}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="costPrice">{t('fields.costPrice')}</Label>
              <Input
                id="costPrice"
                type="number"
                step="1"
                min="0"
                {...register('costPrice', {
                  valueAsNumber: true,
                  setValueAs: v => (v === '' ? undefined : parseFloat(v)),
                })}
                placeholder={t('fields.costPricePlaceholder')}
                disabled={isSubmitting}
              />
              {errors.costPrice && (
                <p className="text-xs text-destructive">{getFieldError('costPrice')}</p>
              )}
            </div>
          </div>

          {/* Row 4: Stock + Min Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="stock">{t('fields.stock')}</Label>
              <Input
                id="stock"
                type="number"
                step="0.01"
                min="0"
                {...register('stock', { valueAsNumber: true })}
                disabled={isSubmitting}
              />
              {errors.stock && (
                <p className="text-xs text-destructive">{getFieldError('stock')}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="minStock">{t('fields.minStock')}</Label>
              <Input
                id="minStock"
                type="number"
                step="0.01"
                min="0"
                {...register('minStock', { valueAsNumber: true })}
                disabled={isSubmitting}
              />
              {errors.minStock && (
                <p className="text-xs text-destructive">{getFieldError('minStock')}</p>
              )}
            </div>
          </div>

          {/* Visual separator */}
          <div className="border-t border-border" />

          {/* Row 5: Image URL (full width) */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl">{t('fields.imageUrl')}</Label>
            <Input
              id="imageUrl"
              {...register('imageUrl')}
              placeholder={t('fields.imageUrlPlaceholder')}
              disabled={isSubmitting}
            />
            {errors.imageUrl && (
              <p className="text-xs text-destructive">{getFieldError('imageUrl')}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? a('creating') : a('save')}
        </Button>
        {mode === 'edit' && (
          <span className="text-xs text-muted-foreground">
            Chỉ gửi các trường đã thay đổi
          </span>
        )}
      </div>
    </form>
  )
}
