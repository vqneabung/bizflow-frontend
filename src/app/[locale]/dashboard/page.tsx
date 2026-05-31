/**
 * Dashboard Home — Trang tổng quan chính (có i18n).
 */
import { getTranslations } from 'next-intl/server'
import UserInfoCard from '@/components/UserInfoCard'
import StatCard from '@/components/StatCard'
import { mockUser, mockStats } from '@/lib/constants'

export default async function DashboardPage() {
  const t = await getTranslations('dashboard')

  return (
    <div className="space-y-6">
      <UserInfoCard user={mockUser} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
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
