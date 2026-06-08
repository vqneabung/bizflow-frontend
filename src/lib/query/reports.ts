/**
 * reports.ts — TanStack Query hooks cho Reports module.
 */
import { useQuery } from '@tanstack/react-query'
import {
  fetchOverview,
  fetchRevenue,
  fetchBestSelling,
  fetchInventory,
  fetchDebt,
} from '@/lib/api/reports'

export const reportKeys = {
  all: ['reports'] as const,
  overview: () => [...reportKeys.all, 'overview'] as const,
  revenue: (range: string) => [...reportKeys.all, 'revenue', range] as const,
  bestSelling: (limit: number) => [...reportKeys.all, 'best-selling', limit] as const,
  inventory: () => [...reportKeys.all, 'inventory'] as const,
  debt: () => [...reportKeys.all, 'debt'] as const,
}

export function useOverviewQuery() {
  return useQuery({
    queryKey: reportKeys.overview(),
    queryFn: fetchOverview,
    staleTime: 60_000,
  })
}

export function useRevenueQuery(range: string = '30d') {
  return useQuery({
    queryKey: reportKeys.revenue(range),
    queryFn: () => fetchRevenue(range),
    staleTime: 60_000,
  })
}

export function useBestSellingQuery(limit: number = 10) {
  return useQuery({
    queryKey: reportKeys.bestSelling(limit),
    queryFn: () => fetchBestSelling(limit),
    staleTime: 60_000,
  })
}

export function useInventoryQuery() {
  return useQuery({
    queryKey: reportKeys.inventory(),
    queryFn: fetchInventory,
    staleTime: 60_000,
  })
}

export function useDebtQuery() {
  return useQuery({
    queryKey: reportKeys.debt(),
    queryFn: fetchDebt,
    staleTime: 60_000,
  })
}
