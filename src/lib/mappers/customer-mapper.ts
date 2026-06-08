/**
 * customer-mapper.ts — Convert FormData (validated bởi zod) → API Request DTO.
 *
 * Tại sao cần mapper:
 * 1. Form dùng '' (empty string) cho optional fields → API cần null
 * 2. Form có thể có field undefined → API cần bỏ qua (PATCH)
 */
import type {
  CreateCustomerRequest,
  UpdateCustomerRequest,
} from '@/lib/types'
import type {
  CreateCustomerFormData,
  EditCustomerFormData,
} from '@/lib/schemas/customer-schema'

/**
 * Convert create form data → CreateCustomerRequest.
 */
export function toCreateCustomerRequest(
  data: CreateCustomerFormData,
): CreateCustomerRequest {
  return {
    name: data.name,
    phone: emptyToNull(data.phone),
    email: emptyToNull(data.email),
    address: emptyToNull(data.address),
    notes: emptyToNull(data.notes),
  }
}

/**
 * Convert edit form data → UpdateCustomerRequest.
 * Chỉ gửi các field có giá trị (PATCH-style).
 */
export function toUpdateCustomerRequest(
  data: EditCustomerFormData,
): UpdateCustomerRequest {
  const result: Record<string, unknown> = {}

  if (data.name !== undefined && data.name !== '') {
    result.name = data.name
  }
  if (data.phone !== undefined) {
    result.phone = emptyToNull(data.phone)
  }
  if (data.email !== undefined) {
    result.email = emptyToNull(data.email)
  }
  if (data.address !== undefined) {
    result.address = emptyToNull(data.address)
  }
  if (data.notes !== undefined) {
    result.notes = emptyToNull(data.notes)
  }

  return result as UpdateCustomerRequest
}

/** Helper: empty string → null, non-empty → string */
function emptyToNull(value: string | undefined): string | null {
  return value && value.length > 0 ? value : null
}
