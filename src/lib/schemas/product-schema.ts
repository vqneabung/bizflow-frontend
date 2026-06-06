/**
 * product-schema.ts — Zod schemas cho Product form validation.
 *
 * Layer: Form validation (UI → data shape).
 * Dùng react-hook-form + @hookform/resolvers/zod.
 *
 * Changes from old schema:
 * - primaryUnit: string → primaryUnitId: string (UUID)
 * - category: string → categoryId: string (UUID, nullable)
 * - stock/minStock: số nguyên (step=1)
 *
 * Mapping với backend:
 * - createProductFormSchema → CreateProductRequest (DTO)
 * - editProductFormSchema → UpdateProductRequest (PATCH-style)
 */
import { z } from 'zod'

/**
 * Error keys (i18n) — match với messages/{vi,en}/products.json
 */
export type ProductFieldErrorKey =
  | 'nameRequired'
  | 'unitRequired'
  | 'pricePositive'
  | 'stockNonNegative'
  | 'minStockNonNegative'

/** Required name field (1-255 chars) */
const nameField = z
  .string()
  .min(1, 'nameRequired')
  .max(255)

/** Optional UUID string — cho phép '' hoặc undefined */
const optionalUuid = z.string().uuid().optional().or(z.literal(''))

/**
 * Create form schema.
 */
export const createProductFormSchema = z.object({
  name: nameField,
  /** UUID của category (nullable) */
  categoryId: optionalUuid,
  /** UUID của unit chính (required) */
  primaryUnitId: z.string().uuid('unitRequired'),
  price: z.coerce.number().positive('pricePositive'),
  costPrice: z.coerce.number().min(0).optional(),
  /** Số nguyên — stock */
  stock: z.coerce.number().int().min(0, 'stockNonNegative').optional().default(0),
  /** Số nguyên — min stock */
  minStock: z.coerce.number().int().min(0, 'minStockNonNegative').optional().default(0),
  imageUrl: z.string().url().optional().or(z.literal('')),
  /** MinIO objectKeys (upload từ ImageUpload) — tối đa 5 */
  imageKeys: z.array(z.string().min(1)).max(5).default([]),
  barcode: optionalUuid,
})

/**
 * Edit form schema — tất cả fields optional (PATCH-style).
 */
export const editProductFormSchema = createProductFormSchema.partial()

/** Inferred types — dùng cho react-hook-form generic */
export type CreateProductFormData = z.infer<typeof createProductFormSchema>
export type EditProductFormData = z.infer<typeof editProductFormSchema>

/** Default values cho react-hook-form (dùng cho cả create + edit) */
export const PRODUCT_FORM_DEFAULTS = {
  name: '',
  categoryId: '',
  primaryUnitId: '',
  price: undefined as unknown as number,
  costPrice: undefined as unknown as number,
  stock: 0,
  minStock: 0,
  imageUrl: '',
  imageKeys: [] as string[],
  barcode: '',
} satisfies CreateProductFormData
