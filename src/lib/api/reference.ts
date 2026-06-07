/**
 * reference.ts — Reference Data API functions (units + categories).
 *
 * Dùng Ky instance để gọi Next.js API route → proxy → Spring Boot.
 * JWT token được tự động gửi qua cookie (httpOnly).
 *
 * Types: ./product-types.ts
 */
import { api } from './client'
import type {
  UnitResponse,
  CategoryResponse,
  ApiResponse,
} from '@/lib/types'

// ===== Units =====

/** Danh sách đơn vị tính (global + user-defined). */
export async function listUnits(): Promise<UnitResponse[]> {
  return api.get('reference/units').json<UnitResponse[]>()
}

/** Tạo đơn vị tính mới (user-defined). */
export async function createUnit(name: string, description?: string): Promise<ApiResponse<UnitResponse>> {
  const params = new URLSearchParams({ name })
  if (description) params.set('description', description)
  return api.post(`reference/units`, { body: params }).json<ApiResponse<UnitResponse>>()
}

/** Find-or-create unit. Nếu đã tồn tại (global hoặc user), trả về. Chưa có thì tạo mới. */
export async function findOrCreateUnit(name: string, description?: string): Promise<ApiResponse<UnitResponse>> {
  const params = new URLSearchParams({ name })
  if (description) params.set('description', description)
  return api.post(`reference/units/find-or-create`, { body: params }).json<ApiResponse<UnitResponse>>()
}

// ===== Categories =====

/** Danh sách danh mục (global + user-defined). */
export async function listCategories(): Promise<CategoryResponse[]> {
  return api.get('reference/categories').json<CategoryResponse[]>()
}

/** Tạo danh mục mới (user-defined). */
export async function createCategory(name: string, description?: string): Promise<ApiResponse<CategoryResponse>> {
  const params = new URLSearchParams({ name })
  if (description) params.set('description', description)
  return api.post(`reference/categories`, { body: params }).json<ApiResponse<CategoryResponse>>()
}

/** Find-or-create category. */
export async function findOrCreateCategory(name: string, description?: string): Promise<ApiResponse<CategoryResponse>> {
  const params = new URLSearchParams({ name })
  if (description) params.set('description', description)
  return api.post(`reference/categories/find-or-create`, { body: params }).json<ApiResponse<CategoryResponse>>()
}
