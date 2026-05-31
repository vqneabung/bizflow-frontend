/**
 * PublicHeader.tsx — Thanh navbar cho trang public (có i18n).
 */
'use client'

import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'

export default function PublicHeader() {
  const pathname = usePathname()
  const c = useTranslations('common')

  const navLinks = [
    { label: c('nav.home'), href: '/' },
    { label: c('nav.about'), href: '/about' },
    { label: c('nav.contact'), href: '/contact' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🏪</span>
            <span className="text-xl font-bold text-zinc-900 tracking-tight">{c('siteName')}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${isActive ? 'text-brand-600' : 'text-zinc-600 hover:text-zinc-900'}`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
              {c('auth.login')}
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors"
            >
              {c('auth.register')}
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
