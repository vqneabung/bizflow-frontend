/**
 * customers.ts — TanStack Query hooks cho Customer CRUD.
 *
 * Layer: React hooks trên top của pure API functions (lib/api/customers.ts).
 * Pattern: queryKey factory — type-safe, dễ invalidate toàn bộ hoặc chi tiết.
 */
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query'
import {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deactivateCustomer,
} from '@/lib/api/customers'
import type {
  ListCustomersParams,
  CustomerResponse,
  PaginationResponse,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  ApiResponse,
} from '@/lib/types'

// ===== Query key factory =====

export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (params: ListCustomersParams) => [...customerKeys.lists(), params] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
}

// ===== Query hooks =====

/** Hook: danh sách customers (phân trang + filter) */
export function useCustomersQuery(
  params: ListCustomersParams,
  options?: Omit<
    UseQueryOptions<PaginationResponse<CustomerResponse>>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => listCustomers(params),
    ...options,
  })
}

/** Hook: chi tiết 1 customer */
export function useCustomerQuery(
  id: string,
  options?: Omit<
    UseQueryOptions<ApiResponse<CustomerResponse>>,
    'queryKey' | 'queryFn' | 'enabled'
  >,
) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => getCustomer(id),
    enabled: !!id,
    ...options,
  })
}

// ===== Mutation hooks =====

/** Hook: tạo customer mới + auto invalidate list cache */
export function useCreateCustomerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCustomerRequest) => createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
    },
  })
}

/** Hook: update customer + invalidate list + update detail cache */
export function useUpdateCustomerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerRequest }) =>
      updateCustomer(id, data),
    onSuccess: (response, { id }) => {
      if (response.success && response.data) {
        queryClient.setQueryData(customerKeys.detail(id), response)
      }
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
    },
  })
}

/** Hook: deactivate (soft delete) + invalidate toàn bộ */
export function useDeactivateCustomerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deactivateCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all })
    },
  })
}
