// API types
export type { ApiResponse, PaginationMeta, PaginationResponse } from './api/common'
export type { UserInfo, RegisterRequest } from './api/user'
export type { ProductResponse, CreateProductRequest, UpdateProductRequest, ListProductsParams } from './api/product'
export type { CustomerResponse, CreateCustomerRequest, UpdateCustomerRequest, ListCustomersParams } from './api/customer'
export type { UnitResponse, CategoryResponse, CategoryOption } from './api/reference'
export type {
  StockImportSummaryResponse,
  StockImportResponse,
  StockImportItemResponse,
  CreateStockImportRequest,
  CreateStockImportItemRequest,
  ListStockImportsParams,
} from './api/stock-import'
export type { Order, OrderSummary, OrderItem, CreateOrderRequest, CreateOrderItemRequest, OrderStatus } from './api/order'

// Domain types
export type { AppError } from './domain/error'
export { toAppError, getErrorMessage } from './domain/error'
export type { BaseFormProps } from './domain/form'
