export interface CustomerResponse {
  id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  notes: string | null
  totalDebt: number
  isActive: boolean
  createdAt: string
  updatedAt: string | null
}

export interface CreateCustomerRequest {
  name: string
  phone?: string | null
  email?: string | null
  address?: string | null
  notes?: string | null
}

export interface UpdateCustomerRequest {
  name?: string
  phone?: string | null
  email?: string | null
  address?: string | null
  notes?: string | null
}

export interface ListCustomersParams {
  search?: string
  page?: number
  size?: number
}
