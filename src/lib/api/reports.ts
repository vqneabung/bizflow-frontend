/**
 * reports.ts — Report API functions.
 *
 * Dùng Ky instance để gọi Next.js API route → proxy → Spring Boot.
 */
import { api } from './client'
import type { ApiResponse } from '@/lib/types'
import type {
  ReportOverview,
  RevenueReport,
  BestSellingReport,
  InventoryReport,
  DebtReport,
} from '@/lib/types/api/report'

export async function fetchOverview(): Promise<ReportOverview> {
  const res = await api.get('reports/overview').json<ApiResponse<ReportOverview>>()
  return res.data!
}

export async function fetchRevenue(range: string = '30d'): Promise<RevenueReport> {
  const res = await api.get(`reports/revenue?range=${range}`).json<ApiResponse<RevenueReport>>()
  return res.data!
}

export async function fetchBestSelling(limit: number = 10): Promise<BestSellingReport> {
  const res = await api.get(`reports/best-selling?limit=${limit}`).json<ApiResponse<BestSellingReport>>()
  return res.data!
}

export async function fetchInventory(): Promise<InventoryReport> {
  const res = await api.get('reports/inventory').json<ApiResponse<InventoryReport>>()
  return res.data!
}

export async function fetchDebt(): Promise<DebtReport> {
  const res = await api.get('reports/debt').json<ApiResponse<DebtReport>>()
  return res.data!
}
