/**
 * constants.ts — Mock data & shared constants cho dashboard UI.
 *
 * Dùng để hiển thị giao diện khi chưa có auth (Phase 1).
 * Sau này sẽ thay bằng dữ liệu thật từ API + session.
 */

export interface UserProfile {
  id: string
  name: string
  email: string
  role: 'OWNER' | 'EMPLOYEE' | 'ADMIN'
  avatar?: string
  phone: string
  joinedAt: string
  storeName?: string
}

export interface DashboardStat {
  label: string
  value: string
  trend: 'up' | 'down' | 'neutral'
  change: string
  icon: string
}

/** Mock user — tạm thời, sẽ thay bằng session data sau khi có auth */
export const mockUser: UserProfile = {
  id: '1',
  name: 'Nguyễn Văn A',
  email: 'nguyenvana@bizflow.com',
  role: 'OWNER',
  phone: '0901 234 567',
  joinedAt: '2026-01-15',
  storeName: 'Cửa hàng VLXD An Phát',
}

/** Mock dashboard stats — minh họa, sẽ thay bằng API real data */
export const mockStats: DashboardStat[] = [
  { label: 'Doanh thu hôm nay', value: '12,450,000₫', trend: 'up', change: '+15%', icon: '💰' },
  { label: 'Đơn hàng hôm nay', value: '24', trend: 'up', change: '+8%', icon: '📦' },
  { label: 'Công nợ khách hàng', value: '86,200,000₫', trend: 'down', change: '-3%', icon: '📋' },
  { label: 'Sản phẩm tồn kho', value: '1,243', trend: 'neutral', change: '0%', icon: '📊' },
]

/** Dashboard navigation items — label lấy từ translations (namespace 'nav') */
export const navItems = [
  { key: 'home', href: '/dashboard', icon: '📊' },
  { key: 'profile', href: '/dashboard/profile', icon: '👤' },
  { key: 'products', href: '#', icon: '📦' },
  { key: 'customers', href: '#', icon: '👥' },
  { key: 'orders', href: '#', icon: '🛒' },
  { key: 'reports', href: '#', icon: '📈' },
] as const
