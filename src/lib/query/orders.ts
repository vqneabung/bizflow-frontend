/**
 * orders.ts — TanStack Query hooks cho Order CRUD.
 */
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query'
import {
  listOrders,
  getOrder,
  createOrder,
  cancelOrder,
} from '@/lib/api/orders'
import type {
  PaginationResponse,
  ApiResponse,
} from '@/lib/types'
import type { Order, OrderSummary } from '@/lib/types/api/order'
import type { OrderStatus } from '@/lib/types/api/order'
import type { CreateOrderRequest } from '@/lib/types/api/order'
import { useRouter } from '@/i18n/navigation'

export interface ListOrdersParams {
  page?: number
  size?: number
  status?: OrderStatus
  fromDate?: string
  toDate?: string
}

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (params: ListOrdersParams) => [...orderKeys.lists(), params] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
}

export function useOrdersQuery(
  params: ListOrdersParams = {},
  options?: Omit<
    UseQueryOptions<PaginationResponse<OrderSummary>>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => listOrders(params),
    ...options,
  })
}

export function useOrderQuery(
  id: string,
  options?: Omit<
    UseQueryOptions<ApiResponse<Order>>,
    'queryKey' | 'queryFn' | 'enabled'
  >,
) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => getOrder(id),
    enabled: !!id,
    ...options,
  })
}

export function useCreateOrderMutation() {
  const qc = useQueryClient()
  const router = useRouter()
  return useMutation({
    mutationFn: (data: CreateOrderRequest) => createOrder(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: orderKeys.lists() })
      if (res.data?.id) {
        router.push(`/dashboard/orders/${res.data.id}`)
      }
    },
  })
}

export function useCancelOrderMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      cancelOrder(id, notes),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: orderKeys.lists() })
      qc.invalidateQueries({ queryKey: orderKeys.detail(id) })
    },
  })
}
