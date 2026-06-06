/**
 * product-mapper.ts — Convert FormData (validated bởi zod) → API Request DTO.
 *
 * Tại sao cần mapper:
 * 1. Form dùng '' (empty string) cho optional fields → API cần null
 * 2. Form có thể có field undefined → API cần bỏ qua (PATCH)
 * 3. UUID fields: '' → null, valid UUID → gửi nguyên
 *
 * Thay vì dùng `as any` ở page level, mapper centralized logic + typed.
 */
import type {
  CreateProductRequest,
  UpdateProductRequest,
} from '@/lib/api/product-types'
import type {
  CreateProductFormData,
  EditProductFormData,
} from '@/lib/schemas/product-schema'

/**
 * Convert create form data → CreateProductRequest.
 * Empty strings → null (vì backend dùng nullable UUID).
 * UUID fields được pass nguyên nếu có giá trị.
 */
export function toCreateProductRequest(
  data: CreateProductFormData,
): CreateProductRequest {
  return {
    name: data.name,
    categoryId: uuidOrNull(data.categoryId),
    primaryUnitId: data.primaryUnitId,
    price: data.price,
    costPrice: data.costPrice ?? null,
    stock: data.stock ?? 0,
    minStock: data.minStock ?? 0,
    imageUrl: emptyToNull(data.imageUrl),
    imageKeys: data.imageKeys ?? [],
    barcode: emptyToNull(data.barcode),
  }
}

/**
 * Convert edit form data → UpdateProductRequest.
 * Chỉ gửi các field có giá trị (PATCH-style).
 */
export function toUpdateProductRequest(
  data: EditProductFormData,
): UpdateProductRequest {
  const result: Record<string, unknown> = {}

  if (data.name !== undefined && data.name !== '') {
    result.name = data.name
  }
  if (data.categoryId !== undefined) {
    result.categoryId = uuidOrNull(data.categoryId)
  }
  if (data.primaryUnitId !== undefined && data.primaryUnitId !== '') {
    result.primaryUnitId = data.primaryUnitId
  }
  if (data.price !== undefined) {
    result.price = data.price
  }
  if (data.costPrice !== undefined) {
    result.costPrice = data.costPrice
  }
  if (data.stock !== undefined) {
    result.stock = data.stock
  }
  if (data.minStock !== undefined) {
    result.minStock = data.minStock
  }
  if (data.imageUrl !== undefined) {
    result.imageUrl = emptyToNull(data.imageUrl)
  }
  if (data.imageKeys !== undefined) {
    result.imageKeys = data.imageKeys
  }
  if (data.barcode !== undefined) {
    result.barcode = emptyToNull(data.barcode)
  }

  return result as UpdateProductRequest
}

/** Helper: empty string → null, non-empty → string */
function emptyToNull(value: string | undefined): string | null {
  return value && value.length > 0 ? value : null
}

/** Helper: empty UUID string → null, valid UUID → string */
function uuidOrNull(value: string | undefined): string | null {
  if (!value || value.length === 0) return null
  return value
}
