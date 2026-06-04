import { getTranslations } from 'next-intl/server'
import { getCurrentUser } from '@/hooks/use-current-user'
import { redirect } from '@/i18n/navigation'
import UserInfoCard from '@/components/UserInfoCard'

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const user = await getCurrentUser()
  if (!user) return redirect({ href: '/login', locale })

  const t = await getTranslations('profile')

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">{t('accountInfo')}</h2>
        <UserInfoCard user={user} />
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
        <h3 className="text-base font-semibold text-zinc-900 mb-4">{t('settings')}</h3>
        <p className="text-sm text-zinc-400">{t('note')}</p>
      </div>
    </div>
  )
}