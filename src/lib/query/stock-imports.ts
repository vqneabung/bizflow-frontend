/**
 * stock-imports.ts — TanStack Query hooks cho Stock Import CRUD.
 *
 * Layer: React hooks trên top của pure API functions (lib/api/stock-imports.ts).
 */
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query'
import {
  listStockImports,
  getStockImport,
  createStockImport,
} from '@/lib/api/stock-imports'
import type {
  ListStockImportsParams,
  StockImportResponse,
  StockImportSummaryResponse,
  PaginationResponse,
  CreateStockImportRequest,
  ApiResponse,
} from '@/lib/types'

// ===== Query key factory =====

export const stockImportKeys = {
  all: ['stock-imports'] as const,
  lists: () => [...stockImportKeys.all, 'list'] as const,
  list: (params: ListStockImportsParams) => [...stockImportKeys.lists(), params] as const,
  details: () => [...stockImportKeys.all, 'detail'] as const,
  detail: (id: string) => [...stockImportKeys.details(), id] as const,
}

// ===== Query hooks =====

/** Hook: danh sách phiếu nhập (phân trang) */
export function useStockImportsQuery(
  params: ListStockImportsParams,
  options?: Omit<
    UseQueryOptions<PaginationResponse<StockImportSummaryResponse>>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: stockImportKeys.list(params),
    queryFn: () => listStockImports(params),
    ...options,
  })
}

/** Hook: chi tiết 1 phiếu nhập (kèm items) */
export function useStockImportQuery(
  id: string,
  options?: Omit<
    UseQueryOptions<ApiResponse<StockImportResponse>>,
    'queryKey' | 'queryFn' | 'enabled'
  >,
) {
  return useQuery({
    queryKey: stockImportKeys.detail(id),
    queryFn: () => getStockImport(id),
    enabled: !!id,
    ...options,
  })
}

// ===== Mutation hooks =====

/** Hook: tạo phiếu nhập + auto invalidate list cache */
export function useCreateStockImportMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateStockImportRequest) => createStockImport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockImportKeys.lists() })
    },
  })
}
