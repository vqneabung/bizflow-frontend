/**
 * stock-import-mapper.ts — Convert FormData (validated bởi zod) → API Request DTO.
 */
import type {
  CreateStockImportRequest,
  CreateStockImportItemRequest,
} from '@/lib/types'
import type {
  CreateStockImportFormData,
} from '@/lib/schemas/stock-import-schema'

/**
 * Convert create form data → CreateStockImportRequest.
 */
export function toCreateStockImportRequest(
  data: CreateStockImportFormData,
): CreateStockImportRequest {
  return {
    referenceNumber: emptyToNull(data.referenceNumber),
    supplier: emptyToNull(data.supplier),
    notes: emptyToNull(data.notes),
    importDate: data.importDate || null,
    items: data.items
      .filter((item) => item.productId && item.quantity > 0 && item.unitCost > 0)
      .map((item): CreateStockImportItemRequest => ({
        productId: item.productId,
        quantity: item.quantity,
        unitCost: item.unitCost,
      })),
  }
}

/** Helper: empty string → null */
function emptyToNull(value: string | undefined): string | null {
  return value && value.length > 0 ? value : null
}
