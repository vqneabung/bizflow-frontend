// API types
export type { ApiResponse, PaginationMeta, PaginationResponse } from './api/common'
export type { UserInfo, RegisterRequest } from './api/user'
export type { ProductResponse, CreateProductRequest, UpdateProductRequest, ListProductsParams } from './api/product'
export type { CustomerResponse, CreateCustomerRequest, UpdateCustomerRequest, ListCustomersParams } from './api/customer'
export type { UnitResponse, CategoryResponse, CategoryOption } from './api/reference'

// Domain types
export type { AppError } from './domain/error'
export { toAppError, getErrorMessage } from './domain/error'
export type { BaseFormProps } from './domain/form'
