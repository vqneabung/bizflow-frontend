export interface ProductResponse {
  id: string
  name: string
  categoryId: string | null
  categoryName: string | null
  primaryUnitId: string
  primaryUnitName: string
  price: number
  costPrice: number | null
  stock: number
  minStock: number
  imageUrl: string | null
  imageKeys: string[]
  barcode: string | null
  isActive: boolean
  isLowStock: boolean
  createdAt: string
  updatedAt: string | null
}

export interface CreateProductRequest {
  name: string
  categoryId?: string | null
  primaryUnitId: string
  price: number
  costPrice?: number | null
  stock?: number
  minStock?: number
  imageUrl?: string | null
  imageKeys?: string[]
  barcode?: string | null
}

export interface UpdateProductRequest {
  name?: string
  categoryId?: string | null
  primaryUnitId?: string
  price?: number
  costPrice?: number | null
  stock?: number
  minStock?: number
  imageUrl?: string | null
  imageKeys?: string[]
  barcode?: string | null
}

export interface ListProductsParams {
  search?: string
  categoryId?: string
  page?: number
  size?: number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
}

export type InventoryMovementType = 'IN' | 'OUT' | 'RETURN'
export type InventoryRefType = 'STOCK_IMPORT' | 'ORDER'

export interface InventoryHistoryResponse {
  id: string
  productId: string
  movementType: InventoryMovementType
  quantity: number
  balanceAfter: number
  refType: InventoryRefType
  refId: string
  referenceNumber: string | null
  createdAt: string
}
