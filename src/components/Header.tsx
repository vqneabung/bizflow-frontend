'use client'

import { useTranslations } from 'next-intl'
import { usePathname } from '@/i18n/navigation'
import { navItems } from '@/lib/constants'
import { logout } from '@/lib/api/auth'
import type { UserInfo } from '@/lib/types'

export default function Header({ user }: { user: UserInfo }) {
  const pathname = usePathname()
  const t = useTranslations('nav')
  const c = useTranslations('common')

  const currentNav = navItems.find((item) => item.href === pathname)
  const pageTitle = currentNav ? t(currentNav.key) : '—'

  const handleLogout = async () => {
    await logout()
  }

  const displayName = user.name ?? user.email
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-zinc-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        <h1 className="text-lg font-semibold text-zinc-900">{pageTitle}</h1>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-medium">
              {initial}
            </div>
            <div className="hidden sm:block text-sm">
              <p className="font-medium text-zinc-900 leading-tight">{displayName}</p>
              <p className="text-xs text-zinc-500 capitalize">{user.role.toLowerCase()}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-200"
            title={c('auth.logout')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            <span className="hidden sm:inline">{c('auth.logout')}</span>
          </button>
        </div>
      </div>
    </header>
  )
}