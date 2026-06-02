/**
 * types.ts — API types cho Product CRUD.
 *
 * Mapping với Spring Boot backend:
 * - ProductResponse ← ProductResponse.kt
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

// ===== Product =====

export interface ProductResponse {
  id: string           // UUID
  name: string
  category: string | null
  primaryUnit: string
  price: number        // BigDecimal → JSON number
  costPrice: number | null
  stock: number
  minStock: number
  imageUrl: string | null
  barcode: string | null
  isActive: boolean
  isLowStock: boolean
  createdAt: string    // ISO 8601
  updatedAt: string | null
}

// ===== Request DTOs =====

export interface CreateProductRequest {
  name: string
  category?: string
  primaryUnit: string
  price: number
  costPrice?: number
  stock?: number
  minStock?: number
  imageUrl?: string
  barcode?: string
}

export interface UpdateProductRequest {
  name?: string
  category?: string
  primaryUnit?: string
  price?: number
  costPrice?: number
  stock?: number
  minStock?: number
  imageUrl?: string
  barcode?: string
}

// ===== Standard API Response =====

export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
}
