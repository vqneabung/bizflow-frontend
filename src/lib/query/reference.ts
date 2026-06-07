/**
 * reference.ts — TanStack Query hooks cho Reference Data (units + categories).
 *
 * Layer: React hooks trên top của pure API functions (lib/api/reference.ts).
 * - lib/api/reference.ts: pure HTTP functions (cũng dùng cho route handlers)
 * - lib/query/reference.ts: hooks với cache, invalidation, pending state
 *
 * Pattern: queryKey factory — type-safe, dễ invalidate toàn bộ hoặc chi tiết.
 */
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query'
import {
  listUnits,
  listCategories,
  findOrCreateUnit,
  findOrCreateCategory,
} from '@/lib/api/reference'
import type { UnitResponse, CategoryResponse, ApiResponse } from '@/lib/types'

// ===== Query key factory =====

export const referenceKeys = {
  all: ['reference'] as const,
  units: () => [...referenceKeys.all, 'units'] as const,
  categories: () => [...referenceKeys.all, 'categories'] as const,
}

// ===== Query hooks =====

/** Hook: danh sách units */
export function useUnitsQuery(options?: Omit<UseQueryOptions<UnitResponse[]>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: referenceKeys.units(),
    queryFn: () => listUnits(),
    ...options,
  })
}

/** Hook: danh sách categories */
export function useCategoriesQuery(options?: Omit<UseQueryOptions<CategoryResponse[]>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: referenceKeys.categories(),
    queryFn: () => listCategories(),
    ...options,
  })
}

// ===== Mutation hooks =====

/** Hook: find-or-create unit + auto invalidate units cache */
export function useFindOrCreateUnitMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ name, description }: { name: string; description?: string }) =>
      findOrCreateUnit(name, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: referenceKeys.units() })
    },
  })
}

/** Hook: find-or-create category + auto invalidate categories cache */
export function useFindOrCreateCategoryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ name, description }: { name: string; description?: string }) =>
      findOrCreateCategory(name, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: referenceKeys.categories() })
    },
  })
}