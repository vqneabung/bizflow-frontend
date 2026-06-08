/** Report types — matching backend DTOs */

export interface ReportOverview {
  totalProducts: number
  totalOrdersThisMonth: number
  totalRevenueThisMonth: number
  totalCustomers: number
  lowStockCount: number
}

export interface DailyRevenue {
  date: string
  revenue: number
  orderCount: number
}

export interface RevenueReport {
  daily: DailyRevenue[]
  total: number
  period: string
}

export interface BestSellingProduct {
  productId: string
  productName: string
  quantitySold: number
  revenue: number
}

export interface BestSellingReport {
  items: BestSellingProduct[]
}

export interface LowStockProduct {
  productId: string
  productName: string
  stock: number
  minStock: number
}

export interface CategoryDistribution {
  categoryName: string
  productCount: number
}

export interface InventoryReport {
  totalProducts: number
  totalValue: number
  lowStockCount: number
  lowStockProducts: LowStockProduct[]
  byCategory: CategoryDistribution[]
}

export interface DebtCustomer {
  customerId: string
  customerName: string
  totalDebt: number
  orderCount: number
}

export interface DebtReport {
  totalDebt: number
  customers: DebtCustomer[]
}
