import type { UserInfo } from './user'

export type Employee = UserInfo

export interface CreateEmployeeInput {
  email: string
  password: string
  name?: string
}

export interface ResetPasswordInput {
  newPassword: string
}

export interface EmployeeListParams {
  page?: number
  size?: number
  search?: string
}