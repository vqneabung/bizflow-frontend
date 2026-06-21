export interface DashboardStat {
  label: string
  value: string
  trend: 'up' | 'down' | 'neutral'
  change: string
  icon: string
  hint?: string
}

export const navItems = [
  { key: 'home', href: '/dashboard', icon: '📊' },
  { key: 'profile', href: '/dashboard/profile', icon: '👤' },
  { key: 'products', href: '/dashboard/products', icon: '📦' },
  { key: 'customers', href: '/dashboard/customers', icon: '👥' },
  { key: 'stockImports', href: '/dashboard/stock-imports', icon: '📥' },
  { key: 'orders', href: '/dashboard/orders', icon: '🛒' },
  { key: 'reports', href: '/dashboard/reports', icon: '📈' },
  { key: 'employees', href: '/dashboard/employees', icon: '🧑‍💼' },
] as const