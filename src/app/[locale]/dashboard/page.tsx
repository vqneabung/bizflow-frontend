import { getTranslations } from 'next-intl/server'
import { getCurrentUser } from '@/hooks/use-current-user'
import { redirect } from '@/i18n/navigation'
import { DashboardHome } from '@/components/reports/DashboardHome'

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const user = await getCurrentUser()
  if (!user) return redirect({ href: '/login', locale })

  const t = await getTranslations('dashboard')

  return (
    <div className="space-y-6">
      <DashboardHome
        userName={user.name ?? user.email}
        userEmail={user.email}
      />
    </div>
  )
}
