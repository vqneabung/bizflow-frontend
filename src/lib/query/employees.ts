/**
 * employees.ts — TanStack Query hooks cho Employee management (Owner only).
 *
 * Pattern: queryKey factory + auto invalidate after mutations.
 */
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query'
import {
  createEmployee,
  deactivateEmployee,
  listEmployees,
  resetEmployeePassword,
} from '@/lib/api/employees'
import type {
  CreateEmployeeInput,
  Employee,
  EmployeeListParams,
  PaginationResponse,
} from '@/lib/types'

export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (params: EmployeeListParams) => [...employeeKeys.lists(), params] as const,
  details: () => [...employeeKeys.all, 'detail'] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,
}

export function useEmployeesQuery(
  params: EmployeeListParams,
  options?: Omit<
    UseQueryOptions<PaginationResponse<Employee>>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: employeeKeys.list(params),
    queryFn: () => listEmployees(params),
    staleTime: 30_000,
    ...options,
  })
}

export function useCreateEmployeeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateEmployeeInput) => createEmployee(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() })
    },
  })
}

export function useDeactivateEmployeeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deactivateEmployee(id),
    onSuccess: (_response, id) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all })
      queryClient.removeQueries({ queryKey: employeeKeys.detail(id) })
    },
  })
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      resetEmployeePassword(id, newPassword),
  })
}