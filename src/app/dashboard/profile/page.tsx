/**
 * Profile Page — Trang thông tin tài khoản người dùng.
 *
 * Hiển thị chi tiết: name, email, role, phone, store, joined date.
 * Dùng lại UserInfoCard component.
 *
 * Chưa có auth: dùng mockUser.
 * Sau này: cho phép chỉnh sửa thông tin, đổi password, logout.
 */
import UserInfoCard from '@/components/UserInfoCard'
import { mockUser } from '@/lib/constants'

export default function ProfilePage() {
  return (
    <div className="max-w-2xl space-y-6">
      {/* Thông tin cá nhân */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">Thông tin tài khoản</h2>
        <UserInfoCard user={mockUser} />
      </div>

      {/* Cài đặt tài khoản — placeholder, sẽ phát triển sau */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
        <h3 className="text-base font-semibold text-zinc-900 mb-4">Cài đặt tài khoản</h3>

        <div className="space-y-4">
          {/* Email notification toggle */}
          <div className="flex items-center justify-between py-3 border-b border-zinc-100">
            <div>
              <p className="text-sm font-medium text-zinc-900">Thông báo qua email</p>
              <p className="text-xs text-zinc-500">Nhận thông báo đơn hàng mới qua email</p>
            </div>
            <div className="w-10 h-6 bg-purple-600 rounded-full relative cursor-pointer">
              <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1" />
            </div>
          </div>

          {/* SMS notification toggle */}
          <div className="flex items-center justify-between py-3 border-b border-zinc-100">
            <div>
              <p className="text-sm font-medium text-zinc-900">Thông báo qua SMS</p>
              <p className="text-xs text-zinc-500">Nhận thông báo công nợ qua SMS</p>
            </div>
            <div className="w-10 h-6 bg-zinc-200 rounded-full relative cursor-pointer">
              <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1" />
            </div>
          </div>
        </div>

        <p className="text-xs text-zinc-400 mt-4">
          * Các tính năng chỉnh sửa thông tin và đổi mật khẩu sẽ được phát triển sau.
        </p>
      </div>
    </div>
  )
}
