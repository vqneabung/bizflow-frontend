/**
 * Header.tsx — Thanh header trên cùng dashboard.
 *
 * Hiển thị: title trang hiện tại, user avatar + tên + nút logout.
 * Chưa có auth: dùng mock user. Sau này sẽ lấy từ session.
 */
'use client'

import { usePathname } from 'next/navigation'
import { mockUser, navItems } from '@/lib/constants'
import { logout } from '@/lib/api/auth'

export default function Header() {
  const pathname = usePathname()

  // Tìm title từ navItems dựa trên path hiện tại
  const currentNav = navItems.find((item) => item.href === pathname)
  const pageTitle = currentNav?.label ?? 'Dashboard'

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-zinc-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Left: page title */}
        <h1 className="text-lg font-semibold text-zinc-900">{pageTitle}</h1>

        {/* Right: user info + logout */}
        <div className="flex items-center gap-4">
          {/* User avatar + name (mock data, sau này thay bằng session) */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-medium">
              {mockUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block text-sm">
              <p className="font-medium text-zinc-900 leading-tight">{mockUser.name}</p>
              <p className="text-xs text-zinc-500 capitalize">{mockUser.role.toLowerCase()}</p>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={logout}
            className="text-sm text-zinc-500 hover:text-red-600 transition-colors px-2 py-1 rounded hover:bg-red-50"
            title="Đăng xuất"
          >
            ✕
          </button>
        </div>
      </div>
    </header>
  )
}
