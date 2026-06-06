/**
 * types.ts — API types cho Product CRUD + Reference Data.
 *
 * Mapping với Spring Boot backend:
 * - ProductResponse ← ProductResponse.kt
 * - UnitResponse ← UnitResponse.kt
 * - CategoryResponse ← CategoryResponse.kt
 * - PaginationResponse<T> ← PaginationResponse.kt
 * - ApiResponse<T> ← ApiResponse.kt
 * - CreateProductRequest ← CreateProductRequest.kt
 * - UpdateProductRequest ← UpdateProductRequest.kt
 */

// ===== Pagination =====

export interface PaginationMeta {
  page: number       // 0-based (Spring Data convention)
  size: number
  totalElements: number
  totalPages: number
}

export interface PaginationResponse<T> {
  success: boolean
  message: string
  data: T[]
  pagination: PaginationMeta
}

// ===== Reference Data =====

export interface UnitResponse {
  id: string           // UUID
  name: string
  description: string | null
  ownerId: string | null  // null = global
}

export interface CategoryResponse {
  id: string           // UUID
  name: string
  description: string | null
  ownerId: string | null  // null = global
}

// ===== Product =====

export interface ProductResponse {
  id: string           // UUID
  name: string
  /** FK → categories(id) */
  categoryId: string | null
  /** Resolved category name (từ @ManyToOne) */
  categoryName: string | null
  /** FK → units(id) */
  primaryUnitId: string
  /** Resolved unit name (từ @ManyToOne) */
  primaryUnitName: string
  price: number        // BigDecimal → JSON number
  costPrice: number | null
  stock: number
  minStock: number
  /** URL hình ảnh external (fallback) — giữ cho backward compat */
  imageUrl: string | null
  /** Danh sách MinIO objectKey (tối đa 5, sắp xếp theo position) */
  imageKeys: string[]
  barcode: string | null
  isActive: boolean
  isLowStock: boolean
  createdAt: string    // ISO 8601
  updatedAt: string | null
}

// ===== Request DTOs =====

export interface CreateProductRequest {
  name: string
  /** UUID của category (nullable) */
  categoryId?: string | null
  /** UUID của unit chính (required) */
  primaryUnitId: string
  price: number
  costPrice?: number | null
  stock?: number
  minStock?: number
  imageUrl?: string | null
  imageKeys?: string[]
  barcode?: string | null
}

export interface UpdateProductRequest {
  name?: string
  categoryId?: string | null
  primaryUnitId?: string
  price?: number
  costPrice?: number | null
  stock?: number
  minStock?: number
  imageUrl?: string | null
  imageKeys?: string[]
  barcode?: string | null
}

// ===== Standard API Response =====

export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
}

// ===== Query Params =====

export interface ListProductsParams {
  search?: string
  /** Lọc theo category UUID (thay vì category string) */
  categoryId?: string
  /** 1-based page (UI convention) */
  page?: number
  size?: number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
}
