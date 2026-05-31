/**
 * Dashboard layout — Wrapper cho tất cả trang /dashboard/*
 *
 * Cấu trúc:
 * - Sidebar: bên trái, fixed, 256px (desktop)
 * - Header: top, sticky (chứa title + user info)
 * - Main: phần còn lại (có sidebar padding)
 *
 * Chưa có auth: layout hiển thị tự do, không kiểm tra session.
 * Sau này: thêm kiểm tra auth ở đây để redirect nếu chưa login.
 */
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Sidebar — fixed left */}
      <Sidebar />

      {/* Main content — có padding trừ sidebar width */}
      <div className="md:pl-64 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
