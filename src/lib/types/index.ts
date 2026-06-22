// API types
export type { UserRole, UserInfo, RegisterRequest } from './api/user'
export type { Employee, CreateEmployeeInput, ResetPasswordInput, EmployeeListParams } from './api/employee'
export type { ApiResponse, PaginationMeta, PaginationResponse } from './api/common'
export type {
  ProductResponse,
  CreateProductRequest,
  UpdateProductRequest,
  ListProductsParams,
  InventoryHistoryResponse,
  InventoryMovementType,
  InventoryRefType,
} from './api/product'
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
