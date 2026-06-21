import { redirect } from '@/i18n/navigation'
import { getCurrentUser } from '@/hooks/use-current-user'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import EmailVerificationBanner from '@/components/EmailVerificationBanner'

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const user = await getCurrentUser()
  if (!user) return redirect({ href: '/login', locale })

  return (
    <div className="flex h-screen bg-zinc-50">
      <Sidebar userRole={user.role} />
      {/* md:ml-64 offset fixed sidebar (256px) — content không bị sidebar che */}
      <div className="flex-1 md:ml-64 flex flex-col overflow-hidden">
        <Header user={user} />
        <EmailVerificationBanner user={user} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}