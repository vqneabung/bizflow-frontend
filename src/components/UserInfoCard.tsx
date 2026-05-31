/**
 * UserInfoCard.tsx — Thẻ hiển thị thông tin người dùng (có i18n).
 */
'use client'

import { useTranslations } from 'next-intl'
import type { UserProfile } from '@/lib/constants'

const roleColors: Record<UserProfile['role'], string> = {
  OWNER: 'bg-purple-100 text-purple-700',
  EMPLOYEE: 'bg-blue-100 text-blue-700',
  ADMIN: 'bg-amber-100 text-amber-700',
}

export default function UserInfoCard({ user }: { user: UserProfile }) {
  const c = useTranslations('common')
  const p = useTranslations('profile')

  const roleKey = user.role === 'OWNER' ? 'owner' : user.role === 'EMPLOYEE' ? 'employee' : 'admin'

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-brand-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
          {user.name.charAt(0).toUpperCase()}
        </div>

        <div className="space-y-2 flex-1 min-w-0">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 truncate">{user.name}</h2>
            <p className="text-sm text-zinc-500 truncate">{user.email}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
              {c(`role.${roleKey}`)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-sm">
            <div>
              <span className="text-zinc-400">{p('fields.phone')}</span>
              <p className="text-zinc-700 font-medium">{user.phone}</p>
            </div>
            <div>
              <span className="text-zinc-400">{p('fields.store')}</span>
              <p className="text-zinc-700 font-medium truncate">{user.storeName ?? '—'}</p>
            </div>
            <div>
              <span className="text-zinc-400">{p('fields.joinedDate')}</span>
              <p className="text-zinc-700 font-medium">{user.joinedAt}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
