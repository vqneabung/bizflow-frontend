'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useProductsQuery } from '@/lib/query/products'
import { useCustomersQuery } from '@/lib/query/customers'
import type { ProductResponse } from '@/lib/types'
import {
  createOrderSchema,
  type CreateOrderFormData,
} from '@/lib/schemas/order-schema'
import { useMemo, useState } from 'react'

interface OrderFormProps {
  onSubmit: (data: CreateOrderFormData) => Promise<void> | void
  isSubmitting?: boolean
  serverError?: string | null
  t: (key: string) => string
}

function fmtPrice(v: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v)
}

export default function OrderForm({
  onSubmit,
  isSubmitting,
  serverError,
  t,
}: OrderFormProps) {
  const [productSearch, setProductSearch] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')
  const [openDropdownIdx, setOpenDropdownIdx] = useState<number | null>(null)
  const [customerOpen, setCustomerOpen] = useState(false)

  // Load products for dropdown
  const { data: productPage } = useProductsQuery({ size: 200 })
  const allProducts: ProductResponse[] = productPage?.data ?? []

  // Load customers for customer selector
  const { data: customerPage } = useCustomersQuery({ size: 200 })
  const allCustomers = customerPage?.data ?? []

  // Filtered products
  const filteredProducts = useMemo(() => {
    if (!productSearch) return allProducts
    const q = productSearch.toLowerCase()
    return allProducts.filter((p) => p.name.toLowerCase().includes(q))
  }, [allProducts, productSearch])

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return allCustomers
    const q = customerSearch.toLowerCase()
    return allCustomers.filter((c) => c.name.toLowerCase().includes(q))
  }, [allCustomers, customerSearch])

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateOrderFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createOrderSchema) as any,
    defaultValues: {
      customerId: null,
      notes: null,
      status: 'DRAFT',
      items: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  const items = watch('items')
  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0),
    [items],
  )

  const handleSelectProduct = (idx: number, product: ProductResponse) => {
    setValue(`items.${idx}.productId`, product.id)
    setValue(`items.${idx}.productName`, product.name)
    const currentPrice = items[idx]?.unitPrice
    if (!currentPrice || currentPrice <= 0) {
      setValue(`items.${idx}.unitPrice`, product.price)
    }
    setProductSearch(product.name)
    setOpenDropdownIdx(null)
  }

  return (
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    <form onSubmit={handleSubmit(onSubmit as (data: CreateOrderFormData) => void)} className="max-w-3xl space-y-6">
      {serverError && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* Customer selector */}
      <div className="relative">
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
          {t('orders.fields.customer')}
        </label>
        <input
          value={customerSearch}
          onChange={(e) => {
            setCustomerSearch(e.target.value)
            setCustomerOpen(true)
          }}
          onFocus={() => setCustomerOpen(true)}
          onBlur={() => setTimeout(() => setCustomerOpen(null as unknown as boolean), 200)}
          placeholder={t('orders.fields.customerPlaceholder')}
          className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
        />
        {customerOpen && filteredCustomers.length > 0 && (
          <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
            <button
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-brand-50 transition-colors text-zinc-500 italic"
              onMouseDown={() => {
                setValue('customerId', null)
                setCustomerSearch('')
                setCustomerOpen(false)
              }}
            >
              (Walk-in customer)
            </button>
            {filteredCustomers.map((c) => (
              <button
                key={c.id}
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-brand-50 transition-colors"
                onMouseDown={() => {
                  setValue('customerId', c.id)
                  setCustomerSearch(c.name)
                  setCustomerOpen(false)
                }}
              >
                <span className="font-medium text-zinc-900">{c.name}</span>
                {c.phone && <span className="text-xs text-zinc-400 ml-2">({c.phone})</span>}
              </button>
            ))}
          </div>
        )}
        <input type="hidden" {...register('customerId')} />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
          {t('orders.fields.notes')}
        </label>
        <textarea
          {...register('notes')}
          rows={3}
          placeholder={t('orders.fields.notesPlaceholder')}
          className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 resize-none"
        />
      </div>

      {/* ── Items ── */}
      <div className="pt-4 border-t border-zinc-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-zinc-900">
            {t('orders.fields.items')}
            <span className="text-red-500 ml-0.5">*</span>
          </h3>
          {typeof errors.items === 'object' && errors.items?.root && (
            <p className="text-xs text-red-500">{t('orders.errors.atLeastOneItem')}</p>
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
                <label className="block text-xs text-zinc-500 mb-1">{t('orders.fields.product')}</label>
                <input
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value)
                    setOpenDropdownIdx(idx)
                  }}
                  onFocus={() => setOpenDropdownIdx(idx)}
                  onBlur={() => setTimeout(() => setOpenDropdownIdx(null), 200)}
                  placeholder={t('orders.fields.productPlaceholder')}
                  className="w-full rounded-lg border border-zinc-300 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
                />
                {openDropdownIdx === idx && filteredProducts.length > 0 && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {filteredProducts.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-brand-50 transition-colors flex justify-between"
                        onMouseDown={() => handleSelectProduct(idx, p)}
                      >
                        <span className="font-medium text-zinc-900">{p.name}</span>
                        <span className="text-xs text-zinc-400">{fmtPrice(p.price)}</span>
                      </button>
                    ))}
                  </div>
                )}
                <input type="hidden" {...register(`items.${idx}.productId`)} />
                {errors.items?.[idx]?.productId && (
                  <p className="text-xs text-red-500 mt-0.5">{t('orders.errors.productRequired')}</p>
                )}
              </div>

              {/* Quantity */}
              <div className="col-span-2">
                <label className="block text-xs text-zinc-500 mb-1">{t('orders.fields.quantity')}</label>
                <input
                  {...register(`items.${idx}.quantity`, { valueAsNumber: true })}
                  type="number"
                  min={1}
                  step={1}
                  className="w-full rounded-lg border border-zinc-300 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
                  placeholder="0"
                />
                {errors.items?.[idx]?.quantity && (
                  <p className="text-xs text-red-500 mt-0.5">{t('orders.errors.quantityRequired')}</p>
                )}
              </div>

              {/* Unit price */}
              <div className="col-span-2">
                <label className="block text-xs text-zinc-500 mb-1">{t('orders.fields.unitPrice')}</label>
                <input
                  {...register(`items.${idx}.unitPrice`, { valueAsNumber: true })}
                  type="number"
                  min={1}
                  step={1000}
                  className="w-full rounded-lg border border-zinc-300 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
                  placeholder="0"
                />
                {errors.items?.[idx]?.unitPrice && (
                  <p className="text-xs text-red-500 mt-0.5">{t('orders.errors.unitPriceRequired')}</p>
                )}
              </div>

              {/* Subtotal */}
              <div className="col-span-2">
                <label className="block text-xs text-zinc-500 mb-1">{t('orders.fields.subtotal')}</label>
                <div className="h-9 flex items-center text-sm font-medium text-zinc-800 px-2.5 bg-white rounded-lg border border-zinc-200">
                  {fmtPrice((items[idx]?.quantity || 0) * (items[idx]?.unitPrice || 0))}
                </div>
              </div>

              {/* Remove */}
              <div className="col-span-1 pt-5">
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  disabled={fields.length === 1}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add item */}
        <button
          type="button"
          onClick={() => {
            append({ productId: '', productName: '', quantity: 0, unitPrice: 0, subtotal: 0 })
            setProductSearch('')
          }}
          className="mt-3 px-4 py-2 rounded-xl border border-dashed border-zinc-300 text-sm text-zinc-500 hover:border-brand-500 hover:text-brand-600 transition-colors w-full"
        >
          + {t('orders.actions.addItem')}
        </button>
      </div>

      {/* Total */}
      <div className="flex justify-end items-center gap-3 pt-4 border-t border-zinc-200">
        <span className="text-sm font-semibold text-zinc-900">{t('orders.fields.totalAmount')}:</span>
        <span className="text-lg font-bold text-brand-700">{fmtPrice(totalAmount)}</span>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          onClick={() => setValue('status', 'DRAFT')}
          className="px-6 py-2.5 rounded-xl border border-zinc-300 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 transition-colors"
        >
          {t('orders.actions.saveDraft')}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          onClick={() => setValue('status', 'CONFIRMED')}
          className="px-6 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? t('orders.actions.saveDraft') : t('orders.actions.confirm')}
        </button>
      </div>
    </form>
  )
}
