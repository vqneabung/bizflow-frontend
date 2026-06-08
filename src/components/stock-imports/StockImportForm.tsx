'use client'

import { useTranslations } from 'next-intl'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useProductsQuery } from '@/lib/query/products'
import type { ProductResponse } from '@/lib/types'
import {
  createStockImportFormSchema,
  STOCK_IMPORT_FORM_DEFAULTS,
  type CreateStockImportFormData,
} from '@/lib/schemas/stock-import-schema'
import { useMemo, useState } from 'react'

interface StockImportFormProps {
  onSubmit: (data: CreateStockImportFormData) => Promise<void> | void
  isSubmitting?: boolean
  serverError?: string | null
}

/** Format VND inline without external dep */
function fmtPrice(v: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v)
}

export default function StockImportForm({
  onSubmit,
  isSubmitting,
  serverError,
}: StockImportFormProps) {
  const t = useTranslations('stockImports')
  const [productSearch, setProductSearch] = useState('')
  const [openDropdownIdx, setOpenDropdownIdx] = useState<number | null>(null)

  // Load products for dropdown (first 200)
  const { data: productPage } = useProductsQuery({ size: 200 })
  const allProducts: ProductResponse[] = productPage?.data ?? []

  // Filtered products by search term
  const filteredProducts = useMemo(() => {
    if (!productSearch) return allProducts
    const q = productSearch.toLowerCase()
    return allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.toLowerCase().includes(q)),
    )
  }, [allProducts, productSearch])

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateStockImportFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createStockImportFormSchema) as any,
    defaultValues: STOCK_IMPORT_FORM_DEFAULTS as CreateStockImportFormData,
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  const items = watch('items')
  const totalCost = useMemo(
    () => items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitCost || 0), 0),
    [items],
  )

  return (
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    <form onSubmit={handleSubmit(onSubmit as (data: CreateStockImportFormData) => void)} className="max-w-3xl space-y-6">
      {serverError && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* Reference number */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
          {t('fields.referenceNumber')}
        </label>
        <input
          {...register('referenceNumber')}
          placeholder={t('fields.referenceNumberPlaceholder')}
          className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
        />
      </div>

      {/* Supplier */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
          {t('fields.supplier')}
        </label>
        <input
          {...register('supplier')}
          placeholder={t('fields.supplierPlaceholder')}
          className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
        />
      </div>

      {/* Import date */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
          {t('fields.importDate')}
        </label>
        <input
          {...register('importDate')}
          type="date"
          className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
        />
      </div>

      {/* Notes */}
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

      {/* ── Items ──────────────────────────────────────────────── */}
      <div className="pt-4 border-t border-zinc-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-zinc-900">
            {t('fields.items')}
            <span className="text-red-500 ml-0.5">*</span>
          </h3>
          {typeof errors.items === 'object' && errors.items?.root && (
            <p className="text-xs text-red-500">{t('errors.atLeastOneItem')}</p>
          )}
        </div>

        <div className="space-y-3">
          {fields.map((field, idx) => (
            <div
              key={field.id}
              className="grid grid-cols-12 gap-2 items-start bg-zinc-50 rounded-xl p-3"
            >
              {/* Product selector */}
              <div className="col-span-5 relative">
                <label className="block text-xs text-zinc-500 mb-1">{t('fields.product')}</label>
                <input
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value)
                    setOpenDropdownIdx(idx)
                  }}
                  onFocus={() => setOpenDropdownIdx(idx)}
                  onBlur={() => setTimeout(() => setOpenDropdownIdx(null), 200)}
                  placeholder={t('fields.productPlaceholder')}
                  className="w-full rounded-lg border border-zinc-300 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
                />
                {openDropdownIdx === idx && filteredProducts.length > 0 && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {filteredProducts.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-brand-50 transition-colors"
                        onMouseDown={() => {
                          setValue(`items.${idx}.productId`, p.id)
                          setValue(`items.${idx}.productName`, p.name)
                          setProductSearch(p.name)
                          setOpenDropdownIdx(null)
                        }}
                      >
                        <span className="font-medium text-zinc-900">{p.name}</span>
                        {p.barcode && (
                          <span className="text-xs text-zinc-400 ml-2">({p.barcode})</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                {/* Hidden input for productId */}
                <input type="hidden" {...register(`items.${idx}.productId`)} />
                {errors.items?.[idx]?.productId && (
                  <p className="text-xs text-red-500 mt-0.5">{t('errors.productRequired')}</p>
                )}
              </div>

              {/* Quantity */}
              <div className="col-span-2">
                <label className="block text-xs text-zinc-500 mb-1">{t('fields.quantity')}</label>
                <input
                  {...register(`items.${idx}.quantity`, { valueAsNumber: true })}
                  type="number"
                  min={1}
                  step={1}
                  className="w-full rounded-lg border border-zinc-300 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
                  placeholder="0"
                />
                {errors.items?.[idx]?.quantity && (
                  <p className="text-xs text-red-500 mt-0.5">{t('errors.quantityRequired')}</p>
                )}
              </div>

              {/* Unit cost */}
              <div className="col-span-2">
                <label className="block text-xs text-zinc-500 mb-1">{t('fields.unitCost')}</label>
                <input
                  {...register(`items.${idx}.unitCost`, { valueAsNumber: true })}
                  type="number"
                  min={1}
                  step={1000}
                  className="w-full rounded-lg border border-zinc-300 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
                  placeholder="0"
                />
                {errors.items?.[idx]?.unitCost && (
                  <p className="text-xs text-red-500 mt-0.5">{t('errors.unitCostRequired')}</p>
                )}
              </div>

              {/* Subtotal (readonly) */}
              <div className="col-span-2">
                <label className="block text-xs text-zinc-500 mb-1">{t('fields.subtotal')}</label>
                <div className="h-9 flex items-center text-sm font-medium text-zinc-800 px-2.5 bg-white rounded-lg border border-zinc-200">
                  {fmtPrice((items[idx]?.quantity || 0) * (items[idx]?.unitCost || 0))}
                </div>
              </div>

              {/* Remove */}
              <div className="col-span-1 pt-5">
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  disabled={fields.length === 1}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 transition-colors"
                  title={t('actions.removeItem')}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add item button */}
        <button
          type="button"
          onClick={() => {
            append({ productId: '', productName: '', quantity: 0, unitCost: 0 })
            setProductSearch('')
          }}
          className="mt-3 px-4 py-2 rounded-xl border border-dashed border-zinc-300 text-sm text-zinc-500 hover:border-brand-500 hover:text-brand-600 transition-colors w-full"
        >
          + {t('actions.addItem')}
        </button>
      </div>

      {/* Total cost */}
      <div className="flex justify-end items-center gap-3 pt-4 border-t border-zinc-200">
        <span className="text-sm font-semibold text-zinc-900">{t('fields.totalCost')}:</span>
        <span className="text-lg font-bold text-brand-700">{fmtPrice(totalCost)}</span>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
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
