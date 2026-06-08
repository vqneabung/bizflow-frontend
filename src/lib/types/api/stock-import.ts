export interface StockImportSummaryResponse {
  id: string
  referenceNumber: string
  supplier: string | null
  importDate: string
  totalCost: number
  itemCount: number
  createdAt: string
}

export interface StockImportItemResponse {
  id: string
  productId: string
  productName: string
  quantity: number
  unitCost: number
  subtotal: number
}

export interface StockImportResponse {
  id: string
  ownerId: string
  referenceNumber: string
  supplier: string | null
  notes: string | null
  importDate: string
  totalCost: number
  itemCount: number
  items: StockImportItemResponse[]
  createdAt: string
  updatedAt: string | null
}

export interface CreateStockImportItemRequest {
  productId: string
  quantity: number
  unitCost: number
}

export interface CreateStockImportRequest {
  referenceNumber?: string | null
  supplier?: string | null
  notes?: string | null
  importDate?: string | null
  items: CreateStockImportItemRequest[]
}

export interface ListStockImportsParams {
  page?: number
  size?: number
}
