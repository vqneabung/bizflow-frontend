export interface PaginationMeta {
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface PaginationResponse<T> {
  success: boolean
  message: string
  data: T[]
  pagination: PaginationMeta
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
}
