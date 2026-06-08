/**
 * customers.ts — Customer API functions.
 *
 * Dùng Ky instance để gọi Next.js API route → proxy → Spring Boot.
 * JWT token được tự động gửi qua cookie (httpOnly).
 *
 * Types: ./customer-types.ts (DTOs matching backend)
 */
import { api } from './client'
import type {
  CustomerResponse,
  PaginationResponse,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  ApiResponse,
  ListCustomersParams,
} from '@/lib/types'

/**
 * Danh sách khách hàng (phân trang + tìm kiếm).
 */
export async function listCustomers(params: ListCustomersParams = {}): Promise<PaginationResponse<CustomerResponse>> {
  const searchParams = new URLSearchParams()
  if (params.search) searchParams.set('search', params.search)
  if (params.page) searchParams.set('page', String(params.page))
  if (params.size) searchParams.set('size', String(params.size))

  const query = searchParams.toString()
  return api.get(`customers${query ? '?' + query : ''}`).json<PaginationResponse<CustomerResponse>>()
}

/** Tạo khách hàng mới. */
export async function createCustomer(data: CreateCustomerRequest): Promise<ApiResponse<CustomerResponse>> {
  return api.post('customers', { json: data }).json<ApiResponse<CustomerResponse>>()
}

/** Lấy chi tiết khách hàng. */
export async function getCustomer(id: string): Promise<ApiResponse<CustomerResponse>> {
  return api.get(`customers/${id}`).json<ApiResponse<CustomerResponse>>()
}

/** Cập nhật khách hàng (PATCH-style, chỉ gửi field thay đổi). */
export async function updateCustomer(id: string, data: UpdateCustomerRequest): Promise<ApiResponse<CustomerResponse>> {
  return api.put(`customers/${id}`, { json: data }).json<ApiResponse<CustomerResponse>>()
}

/** Ẩn khách hàng (soft delete). */
export async function deactivateCustomer(id: string): Promise<ApiResponse<void>> {
  return api.patch(`customers/${id}/deactivate`).json<ApiResponse<void>>()
}
