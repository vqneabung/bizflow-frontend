/**
 * products.ts — Product API functions.
 *
 * Dùng Ky instance để gọi Next.js API route → proxy → Spring Boot.
 * JWT token được tự động gửi qua cookie (httpOnly).
 *
 * Types: ./product-types.ts (DTOs matching backend)
 * Mappers: ../mappers/product-mapper.ts (FormData → DTO)
 */
import { api } from './client'
import type {
  ProductResponse,
  PaginationResponse,
  CreateProductRequest,
  UpdateProductRequest,
  ApiResponse,
  ListProductsParams,
} from './product-types'

/**
 * Danh sách sản phẩm (phân trang + tìm kiếm + lọc).
 * UI dùng page 1-based → API proxy gửi page nguyên gốc
 * (Spring Boot service chuyển 1-based → 0-based)
 */
export async function listProducts(params: ListProductsParams = {}): Promise<PaginationResponse<ProductResponse>> {
  const searchParams = new URLSearchParams()
  if (params.search) searchParams.set('search', params.search)
  if (params.categoryId) searchParams.set('categoryId', params.categoryId)
  if (params.page) searchParams.set('page', String(params.page))
  if (params.size) searchParams.set('size', String(params.size))
  if (params.sortBy) searchParams.set('sortBy', params.sortBy)
  if (params.sortDir) searchParams.set('sortDir', params.sortDir)

  const query = searchParams.toString()
  return api.get(`products${query ? '?' + query : ''}`).json<PaginationResponse<ProductResponse>>()
}

/** Tạo sản phẩm mới. */
export async function createProduct(data: CreateProductRequest): Promise<ApiResponse<ProductResponse>> {
  return api.post('products', { json: data }).json<ApiResponse<ProductResponse>>()
}

/** Lấy chi tiết sản phẩm. */
export async function getProduct(id: string): Promise<ApiResponse<ProductResponse>> {
  return api.get(`products/${id}`).json<ApiResponse<ProductResponse>>()
}

/** Cập nhật sản phẩm (PATCH-style, chỉ gửi field thay đổi). */
export async function updateProduct(id: string, data: UpdateProductRequest): Promise<ApiResponse<ProductResponse>> {
  return api.put(`products/${id}`, { json: data }).json<ApiResponse<ProductResponse>>()
}

/** Ẩn sản phẩm (soft delete). */
export async function deactivateProduct(id: string): Promise<ApiResponse<void>> {
  return api.patch(`products/${id}/deactivate`).json<ApiResponse<void>>()
}
