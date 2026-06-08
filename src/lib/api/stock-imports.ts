/**
 * stock-imports.ts — Stock Import API functions.
 *
 * Dùng Ky instance để gọi Next.js API route → proxy → Spring Boot.
 */
import { api } from './client'
import type {
  StockImportResponse,
  StockImportSummaryResponse,
  PaginationResponse,
  CreateStockImportRequest,
  ApiResponse,
  ListStockImportsParams,
} from '@/lib/types'

/**
 * Danh sách phiếu nhập (phân trang, mới nhất trước).
 */
export async function listStockImports(params: ListStockImportsParams = {}): Promise<PaginationResponse<StockImportSummaryResponse>> {
  const searchParams = new URLSearchParams()
  if (params.page) searchParams.set('page', String(params.page))
  if (params.size) searchParams.set('size', String(params.size))

  const query = searchParams.toString()
  return api.get(`stock-imports${query ? '?' + query : ''}`).json<PaginationResponse<StockImportSummaryResponse>>()
}

/** Tạo phiếu nhập kho (tự động tăng tồn kho). */
export async function createStockImport(data: CreateStockImportRequest): Promise<ApiResponse<StockImportResponse>> {
  return api.post('stock-imports', { json: data }).json<ApiResponse<StockImportResponse>>()
}

/** Lấy chi tiết phiếu nhập (kèm danh sách items). */
export async function getStockImport(id: string): Promise<ApiResponse<StockImportResponse>> {
  return api.get(`stock-imports/${id}`).json<ApiResponse<StockImportResponse>>()
}
