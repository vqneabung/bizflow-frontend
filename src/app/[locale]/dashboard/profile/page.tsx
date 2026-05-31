/**
 * Profile Page — Thông tin tài khoản (có i18n).
 */
import { getTranslations } from 'next-intl/server'
import UserInfoCard from '@/components/UserInfoCard'
import { mockUser } from '@/lib/constants'

export default async function ProfilePage() {
  const t = await getTranslations('profile')
  const d = await getTranslations('dashboard')

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">{t('accountInfo')}</h2>
        <UserInfoCard user={mockUser} />
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
        <h3 className="text-base font-semibold text-zinc-900 mb-4">{t('settings')}</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-zinc-100">
            <div>
              <p className="text-sm font-medium text-zinc-900">{t('notifications.email')}</p>
              <p className="text-xs text-zinc-500">{t('notifications.emailDesc')}</p>
            </div>
            <div className="w-10 h-6 bg-purple-600 rounded-full relative cursor-pointer">
              <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1" />
            </div>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-zinc-100">
            <div>
              <p className="text-sm font-medium text-zinc-900">{t('notifications.sms')}</p>
              <p className="text-xs text-zinc-500">{t('notifications.smsDesc')}</p>
            </div>
            <div className="w-10 h-6 bg-zinc-200 rounded-full relative cursor-pointer">
              <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1" />
            </div>
          </div>
        </div>

        <p className="text-xs text-zinc-400 mt-4">{t('note')}</p>
      </div>
    </div>
  )
}
