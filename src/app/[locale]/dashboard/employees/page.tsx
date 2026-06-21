import { getTranslations } from 'next-intl/server'
import { redirect } from '@/i18n/navigation'
import { getCurrentUser } from '@/hooks/use-current-user'
import EmployeesPageClient from '@/components/employees/EmployeesPageClient'

export default async function EmployeesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const user = await getCurrentUser()
  if (!user) return redirect({ href: '/login', locale })

  const t = await getTranslations('employees')

  if (user.role !== 'USER') {
    return (
      <div className="max-w-2xl">
        <h2 className="text-lg font-semibold text-zinc-900 mb-2">{t('title')}</h2>
        <p className="text-sm text-zinc-600">{t('forbidden')}</p>
      </div>
    )
  }

  return <EmployeesPageClient />
}