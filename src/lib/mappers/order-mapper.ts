import type {
  CreateOrderRequest,
  CreateOrderItemRequest,
} from '@/lib/types/api/order'
import type { CreateOrderFormData } from '@/lib/schemas/order-schema'

export function toCreateOrderRequest(
  data: CreateOrderFormData,
): CreateOrderRequest {
  return {
    customerId: data.customerId || null,
    notes: data.notes || null,
    status: data.status,
    items: data.items.map(
      (item): CreateOrderItemRequest => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }),
    ),
  }
}
