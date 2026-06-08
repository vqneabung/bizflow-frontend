/**
 * orders.ts — Order API functions.
 *
 * Dùng Ky instance để gọi Next.js API route → proxy → Spring Boot.
 */
import { api } from './client'
import type {
  OrderSummary,
  Order,
  CreateOrderRequest,
  PaginationResponse,
  ApiResponse,
} from '@/lib/types'
import type { OrderStatus } from '@/lib/types/api/order'

function buildSearchParams(params?: {
  page?: number
  size?: number
  status?: OrderStatus
  fromDate?: string
  toDate?: string
}): string {
  if (!params) return ''
  const sp = new URLSearchParams()
  if (params.page) sp.set('page', String(params.page))
  if (params.size) sp.set('size', String(params.size))
  if (params.status) sp.set('status', params.status)
  if (params.fromDate) sp.set('fromDate', params.fromDate)
  if (params.toDate) sp.set('toDate', params.toDate)
  const qs = sp.toString()
  return qs ? `?${qs}` : ''
}

export async function listOrders(params?: {
  page?: number
  size?: number
  status?: OrderStatus
  fromDate?: string
  toDate?: string
}): Promise<PaginationResponse<OrderSummary>> {
  return api.get(`orders${buildSearchParams(params)}`).json<PaginationResponse<OrderSummary>>()
}

export async function getOrder(id: string): Promise<ApiResponse<Order>> {
  return api.get(`orders/${id}`).json<ApiResponse<Order>>()
}

export async function createOrder(data: CreateOrderRequest): Promise<ApiResponse<Order>> {
  return api.post('orders', { json: data }).json<ApiResponse<Order>>()
}

export async function cancelOrder(id: string, notes?: string): Promise<ApiResponse<Order>> {
  return api.patch(`orders/${id}/cancel`, { json: { notes } }).json<ApiResponse<Order>>()
}
