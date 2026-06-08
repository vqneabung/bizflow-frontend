export interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface Order {
  id: string
  ownerId: string
  customerId: string | null
  referenceNumber: string
  totalAmount: number
  paidAmount: number
  debtAmount: number
  status: OrderStatus
  notes: string | null
  itemCount: number
  items: OrderItem[]
  createdAt: string
  updatedAt: string | null
}

export interface OrderSummary {
  id: string
  customerId: string | null
  referenceNumber: string
  totalAmount: number
  paidAmount: number
  debtAmount: number
  status: OrderStatus
  itemCount: number
  createdAt: string
  updatedAt: string | null
}

export interface CreateOrderRequest {
  customerId?: string | null
  notes?: string | null
  status: 'DRAFT' | 'CONFIRMED'
  items: CreateOrderItemRequest[]
}

export interface CreateOrderItemRequest {
  productId: string
  quantity: number
  unitPrice: number
}

export type OrderStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED'
