/**
 * Public layout — Wrapper cho các trang public (/, /about, /contact).
 *
 * Cấu trúc: PublicHeader (top) + Main content + PublicFooter (bottom).
 * Khác biệt với dashboard layout (có sidebar).
 */
import PublicHeader from '@/components/PublicHeader'
import PublicFooter from '@/components/PublicFooter'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  )
}
