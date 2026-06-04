import { getTranslations } from 'next-intl/server'
import { getCurrentUser } from '@/hooks/use-current-user'
import { redirect } from '@/i18n/navigation'
import UserInfoCard from '@/components/UserInfoCard'
import StatCard from '@/components/StatCard'

const defaultStats = [
  { key: 'revenue', icon: '💰', value: '0₫' },
  { key: 'orders', icon: '📦', value: '0' },
  { key: 'debt', icon: '📋', value: '0₫' },
  { key: 'stock', icon: '📊', value: '0' },
] as const

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
      <UserInfoCard user={user} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {defaultStats.map((stat) => (
          <StatCard key={stat.key} statKey={stat.key} icon={stat.icon} value={stat.value} />
        ))}
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
        <h3 className="text-base font-semibold text-zinc-900 mb-2">{t('chart.title')}</h3>
        <p className="text-sm text-zinc-500">{t('chart.description')}</p>
        <div className="mt-4 h-48 bg-zinc-50 rounded-lg border border-dashed border-zinc-300 flex items-center justify-center text-sm text-zinc-400">
          {t('chart.placeholder')}
        </div>
      </div>
    </div>
  )
}