/**
 * PublicFooter.tsx — Footer cho trang public (có i18n).
 */
'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

export default function PublicFooter() {
  const c = useTranslations('common')

  const navLinks = [
    { label: c('nav.home'), href: '/' },
    { label: c('nav.about'), href: '/about' },
    { label: c('nav.contact'), href: '/contact' },
  ]

  return (
    <footer className="bg-zinc-900 text-zinc-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏪</span>
              <span className="text-lg font-bold text-white">{c('siteName')}</span>
            </div>
            <p className="text-sm leading-relaxed">{c('siteDescription')}. {c('footer.description')}</p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">{c('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">{c('footer.contactInfo')}</h3>
            <ul className="space-y-2 text-sm">
              <li>{c('footer.email')}</li>
              <li>{c('footer.phone')}</li>
              <li>{c('footer.address')}</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-zinc-800 text-center text-sm">
          &copy; {new Date().getFullYear()} {c('siteName')}. {c('footer.copyright')}
        </div>
      </div>
    </footer>
  )
}
