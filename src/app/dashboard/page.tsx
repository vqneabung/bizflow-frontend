/**
 * Dashboard Home — Trang tổng quan chính.
 *
 * Hiển thị:
 * 1. UserInfoCard: thông tin người dùng (name, email, role, phone...)
 * 2. StatCards: doanh thu, đơn hàng, công nợ, tồn kho (mock data)
 *
 * Chưa có auth: dùng mockUser từ constants.
 * Sau này: lấy user từ session, stats từ API.
 */
import UserInfoCard from '@/components/UserInfoCard'
import StatCard from '@/components/StatCard'
import { mockUser, mockStats } from '@/lib/constants'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* User info card */}
      <UserInfoCard user={mockUser} />

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Placeholder: các section khác (sẽ phát triển sau) */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
        <h3 className="text-base font-semibold text-zinc-900 mb-2">
          Biểu đồ doanh thu
        </h3>
        <p className="text-sm text-zinc-500">
          Biểu đồ sẽ hiển thị tại đây sau khi kết nối API.
        </p>
        {/* Placeholder chart area */}
        <div className="mt-4 h-48 bg-zinc-50 rounded-lg border border-dashed border-zinc-300 flex items-center justify-center text-sm text-zinc-400">
          📈 Biểu đồ doanh thu 7 ngày gần nhất
        </div>
      </div>
    </div>
  )
}
