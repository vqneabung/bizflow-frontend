/**
 * PublicHeader.tsx — Thanh navbar cho các trang public (landing, about, contact).
 *
 * Hiển thị: Logo + Bizflow + navigation links + Login/Register CTA buttons.
 * Không chứa sidebar — khác với Header.tsx (dùng trong dashboard).
 *
 * Sau này có i18n: thêm locale switcher ở đây.
 */
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Giới thiệu', href: '/about' },
  { label: 'Liên hệ', href: '/contact' },
]

export default function PublicHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🏪</span>
            <span className="text-xl font-bold text-zinc-900 tracking-tight">
              Bizflow
            </span>
          </Link>

          {/* Nav links (desktop) */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-brand-600'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Auth buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Đăng nhập
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors"
            >
              Đăng ký
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
