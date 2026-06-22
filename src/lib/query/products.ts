/**
 * products.ts — TanStack Query hooks cho Product CRUD.
 *
 * Layer: React hooks trên top của pure API functions (lib/api/products.ts).
 * - lib/api/products.ts: pure HTTP functions (cũng dùng cho route handlers)
 * - lib/query/products.ts: hooks với cache, invalidation, pending state
 *
 * Pattern: queryKey factory — type-safe, dễ invalidate toàn bộ hoặc chi tiết.
 */
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query'
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deactivateProduct,
  getInventoryHistory,
} from '@/lib/api/products'
import type {
  ListProductsParams,
  ProductResponse,
  PaginationResponse,
  CreateProductRequest,
  UpdateProductRequest,
  ApiResponse,
  InventoryHistoryResponse,
} from '@/lib/types'

// ===== Query key factory =====

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: ListProductsParams) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  histories: () => [...productKeys.all, 'inventory-history'] as const,
  history: (id: string, page: number, size: number) =>
    [...productKeys.histories(), id, page, size] as const,
}

// ===== Query hooks =====

/** Hook: danh sách products (phân trang + filter) */
export function useProductsQuery(
  params: ListProductsParams,
  options?: Omit<
    UseQueryOptions<PaginationResponse<ProductResponse>>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => listProducts(params),
    ...options,
  })
}

/** Hook: chi tiết 1 product */
export function useProductQuery(
  id: string,
  options?: Omit<
    UseQueryOptions<ApiResponse<ProductResponse>>,
    'queryKey' | 'queryFn' | 'enabled'
  >,
) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => getProduct(id),
    enabled: !!id,
    ...options,
  })
}

/** Hook: lịch sử biến động tồn kho của 1 product (phân trang) */
export function useInventoryHistoryQuery(
  productId: string,
  page = 1,
  size = 20,
  options?: Omit<
    UseQueryOptions<PaginationResponse<InventoryHistoryResponse>>,
    'queryKey' | 'queryFn' | 'enabled'
  >,
) {
  return useQuery({
    queryKey: productKeys.history(productId, page, size),
    queryFn: () => getInventoryHistory(productId, { page, size }),
    enabled: !!productId,
    ...options,
  })
}

// ===== Mutation hooks =====

/** Hook: tạo product mới + auto invalidate list cache */
export function useCreateProductMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateProductRequest) => createProduct(data),
    onSuccess: () => {
      // Invalidate tất cả list queries để auto-refetch
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}

/** Hook: update product + invalidate list + update detail cache */
export function useUpdateProductMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductRequest }) =>
      updateProduct(id, data),
    onSuccess: (response, { id }) => {
      // Update detail cache với data mới (optimistic-ish, instant UI update)
      if (response.success && response.data) {
        queryClient.setQueryData(productKeys.detail(id), response)
      }
      // Invalidate list để refresh
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}

/** Hook: deactivate (soft delete) + invalidate toàn bộ */
export function useDeactivateProductMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deactivateProduct(id),
    onSuccess: () => {
      // Invalidate all product queries (list + detail)
      queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
  })
}
