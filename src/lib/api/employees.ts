/**
 * employees.ts — Employee management API (Owner only).
 *
 * Endpoints: /api/owner/employees (proxied to Spring Boot).
 */
import { api } from './client'
import type {
  ApiResponse,
  CreateEmployeeInput,
  Employee,
  EmployeeListParams,
  PaginationResponse,
  ResetPasswordInput,
} from '@/lib/types'

function buildQuery(params: EmployeeListParams): string {
  const searchParams = new URLSearchParams()
  if (params.search) searchParams.set('search', params.search)
  if (params.page) searchParams.set('page', String(params.page))
  if (params.size) searchParams.set('size', String(params.size))
  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

export async function listEmployees(
  params: EmployeeListParams = {},
): Promise<PaginationResponse<Employee>> {
  return api
    .get(`owner/employees${buildQuery(params)}`)
    .json<PaginationResponse<Employee>>()
}

export async function getEmployee(id: string): Promise<ApiResponse<Employee>> {
  return api.get(`owner/employees/${id}`).json<ApiResponse<Employee>>()
}

export async function createEmployee(
  input: CreateEmployeeInput,
): Promise<ApiResponse<Employee>> {
  return api
    .post('owner/employees', { json: input })
    .json<ApiResponse<Employee>>()
}

export async function deactivateEmployee(id: string): Promise<ApiResponse<void>> {
  return api.patch(`owner/employees/${id}/deactivate`).json<ApiResponse<void>>()
}

export async function resetEmployeePassword(
  id: string,
  newPassword: string,
): Promise<ApiResponse<ResetPasswordInput>> {
  return api
    .patch(`owner/employees/${id}/reset-password`, { json: { newPassword } })
    .json<ApiResponse<ResetPasswordInput>>()
}