'use client'

import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { navItems } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function Sidebar() {
  const pathname = usePathname()
  const t = useTranslations('nav')
  const d = useTranslations('dashboard')

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-zinc-900 text-white">
      <div className="flex items-center gap-2 h-16 px-6 border-b border-zinc-700">
        <span className="text-2xl">🏪</span>
        <span className="text-lg font-bold tracking-tight">Bizflow</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Button
              key={item.key}
              variant="ghost"
              asChild
              className={cn(
                'w-full justify-start gap-3 text-sm font-medium',
                isActive
                  ? 'bg-brand-600 text-white hover:bg-brand-600 hover:text-white'
                  : 'text-zinc-300 hover:bg-zinc-800 hover:text-white',
              )}
            >
              <Link href={item.href}>
                <span className="text-lg">{item.icon}</span>
                {t(item.key)}
              </Link>
            </Button>
          )
        })}
      </nav>

      <div className="px-6 py-4 border-t border-zinc-700 text-xs text-zinc-500">
        {d('version')}
      </div>
    </aside>
  )
}