import { z } from 'zod'

const orderItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  productName: z.string().optional(),
  quantity: z.coerce.number().positive('Quantity must be > 0'),
  unitPrice: z.coerce.number().positive('Unit price must be > 0'),
  subtotal: z.number().optional(),
})

export const createOrderSchema = z.object({
  customerId: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  status: z.enum(['DRAFT', 'CONFIRMED']).default('DRAFT'),
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
})

export type CreateOrderFormData = z.infer<typeof createOrderSchema>
