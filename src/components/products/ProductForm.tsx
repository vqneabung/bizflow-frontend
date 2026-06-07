/**
 * ProductForm.tsx — Form tạo/sửa sản phẩm (react-hook-form + zod + shadcn).
 *
 * Tính năng:
 * - Combobox cho đơn vị tính (UnitSelect) + danh mục (CategorySelect)
 * - Quick-create: gõ tên mới → tự động find-or-create
 * - Sticky save bar (dính bottom)
 * - Stock / minStock: số nguyên (step=1)
 * - Barcode scanner tích hợp
 * - Unsaved changes warning
 *
 * Layer: PRESENTATION (chỉ JSX + handlers, không có schema/types/validation logic).
 *
 * NOTE: FormData = CreateProductFormData | EditProductFormData (union type).
 * react-hook-form type inference on union types is unreliable for watch/setValue.
 * We use `as any` casts at call sites to avoid TS errors — this is intentional.
 */
'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useForm, type Resolver, type FieldError } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import ImageUpload, { type ImageUploadHandle } from '@/components/ui/image-upload'
import UnitSelect from '@/components/products/UnitSelect'
import CategorySelect from '@/components/products/CategorySelect'
import BarcodeScanner from '@/components/products/BarcodeScanner'
import {
  createProductFormSchema,
  editProductFormSchema,
  PRODUCT_FORM_DEFAULTS,
  type CreateProductFormData,
  type EditProductFormData,
} from '@/lib/schemas/product-schema'
interface ProductFormBaseProps {
  mode: 'create' | 'edit'
  isSubmitting: boolean
  serverError?: string | null
  enableBarcodeScanner?: boolean
}

interface CreateModeProps extends ProductFormBaseProps {
  mode: 'create'
  onSubmit: (data: CreateProductFormData) => Promise<void> | void
  defaultValues?: Partial<CreateProductFormData>
  existingImageKeys?: never
}

interface EditModeProps extends ProductFormBaseProps {
  mode: 'edit'
  onSubmit: (data: EditProductFormData) => Promise<void> | void
  defaultValues?: Partial<EditProductFormData>
  existingImageKeys?: string[]
}

type ProductFormProps = CreateModeProps | EditModeProps

/** Union type cho form data */
type FormData = CreateProductFormData | EditProductFormData

/** Loose watch — trả về string value hoặc '' */
function w(val: unknown): string {
  return val != null ? String(val) : ''
}

export default function ProductForm({
  mode,
  defaultValues,
  existingImageKeys,
  onSubmit,
  isSubmitting,
  serverError,
  enableBarcodeScanner = true,
}: ProductFormProps) {
  const t = useTranslations('products')
  const e = useTranslations('products.errors')
  const a = useTranslations('products.actions')

  const schema = mode === 'create' ? createProductFormSchema : editProductFormSchema

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: { ...PRODUCT_FORM_DEFAULTS, ...defaultValues, imageKeys: existingImageKeys ?? [] } as FormData,
  })

  const imageUploadRef = useRef<ImageUploadHandle>(null)

  // Watch imageKeys để sync với ImageUpload
  const watchedImageKeys: string[] = (watch('imageKeys') ?? []) as string[]

  // Sticky save bar
  const [showStickyBar, setShowStickyBar] = useState(false)
  const formBottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0, rootMargin: '0px 0px -100px 0px' },
    )
    if (formBottomRef.current) observer.observe(formBottomRef.current)
    return () => observer.disconnect()
  }, [])

  // Unsaved changes warning
  useEffect(() => {
    if (!isDirty) return
    const handler = (event: BeforeUnloadEvent) => { event.preventDefault() }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  // Field error helper
  function getFieldError(field: string): string | undefined {
    const err = (errors as Record<string, FieldError | undefined>)[field]
    if (!err?.message) return undefined
    const translation = e(err.message as Parameters<typeof e>[0])
    return translation !== err.message ? translation : err.message
  }

  // Barcode scan handler
  const handleBarcodeScan = (barcode: string) => {
    (setValue as (k: string, v: string, o?: object) => void)('barcode', barcode, { shouldDirty: true })
  }

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit as (data: FormData) => void | Promise<void>)}
        className="max-w-5xl space-y-6 pb-24"
      >
        {serverError && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3 rounded-lg">
            {serverError}
          </div>
        )}

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
                {getFieldError('name') && (
                  <p className="text-xs text-destructive">{getFieldError('name')}</p>
                )}
              </div>
              <UnitSelect
                value={w(watch('primaryUnitId'))}
                onChange={(val) => (setValue as (k: string, v: string, o?: object) => void)('primaryUnitId', val, { shouldDirty: true })}
                error={getFieldError('primaryUnitId')}
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Row 2: Category + Barcode */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <CategorySelect
                value={w(watch('categoryId'))}
                onChange={(val) => (setValue as (k: string, v: string, o?: object) => void)('categoryId', val, { shouldDirty: true })}
                error={getFieldError('categoryId')}
                disabled={isSubmitting}
              />
              <div className="space-y-2">
                <Label htmlFor="barcode">{t('fields.barcode')}</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      id="barcode"
                      {...register('barcode')}
                      placeholder={t('fields.barcodePlaceholder')}
                      disabled={isSubmitting}
                    />
                    {getFieldError('barcode') && (
                      <p className="text-xs text-destructive">{getFieldError('barcode')}</p>
                    )}
                  </div>
                  {enableBarcodeScanner && (
                    <BarcodeScanner onScan={handleBarcodeScan} disabled={isSubmitting} />
                  )}
                </div>
              </div>
            </div>

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
                {getFieldError('price') && (
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
                    setValueAs: (v: unknown) => (v === '' ? undefined : parseFloat(v as string)),
                  })}
                  placeholder={t('fields.costPricePlaceholder')}
                  disabled={isSubmitting}
                />
                {getFieldError('costPrice') && (
                  <p className="text-xs text-destructive">{getFieldError('costPrice')}</p>
                )}
              </div>
            </div>

            {/* Row 4: Stock + Min Stock (int) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="stock">{t('fields.stock')}</Label>
                <Input
                  id="stock"
                  type="number"
                  step="1"
                  min="0"
                  {...register('stock', { valueAsNumber: true })}
                  disabled={isSubmitting}
                />
                {getFieldError('stock') && (
                  <p className="text-xs text-destructive">{getFieldError('stock')}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="minStock">{t('fields.minStock')}</Label>
                <Input
                  id="minStock"
                  type="number"
                  step="1"
                  min="0"
                  {...register('minStock', { valueAsNumber: true })}
                  disabled={isSubmitting}
                />
                {getFieldError('minStock') && (
                  <p className="text-xs text-destructive">{getFieldError('minStock')}</p>
                )}
              </div>
            </div>

            <div className="border-t border-border" />

            {/* Row 5: Image URL */}
            <div className="space-y-2">
              <Label htmlFor="imageUrl">{t('fields.imageUrl')}</Label>
              <Input
                id="imageUrl"
                {...register('imageUrl')}
                placeholder={t('fields.imageUrlPlaceholder')}
                disabled={isSubmitting}
              />
              {getFieldError('imageUrl') && (
                <p className="text-xs text-destructive">{getFieldError('imageUrl')}</p>
              )}
            </div>

            {/* Row 6: Image Upload */}
            <div className="space-y-2">
              <ImageUpload
                ref={imageUploadRef}
                existingImageKeys={watchedImageKeys}
                onImageKeysChange={(keys) => (setValue as (k: string, v: string[], o?: object) => void)('imageKeys', keys, { shouldDirty: true })}
                disabled={isSubmitting}
                error={getFieldError('imageKeys')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Inline submit */}
        <div ref={formBottomRef}>
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
        </div>
      </form>

      {/* Sticky Save Bar */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {mode === 'create' ? 'Tạo sản phẩm mới' : 'Chỉnh sửa sản phẩm'}
            </span>
            <div className="flex items-center gap-3">
              {isDirty && (
                <span className="text-xs text-amber-600">Chưa lưu</span>
              )}
              <Button
                type="submit"
                disabled={isSubmitting}
                onClick={() => document.querySelector('form')?.requestSubmit()}
              >
                {isSubmitting ? a('creating') : a('save')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
