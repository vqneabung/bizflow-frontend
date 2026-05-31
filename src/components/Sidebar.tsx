/**
 * Sidebar.tsx — Thanh điều hướng bên trái dashboard.
 *
 * Hiển thị logo + danh sách menu. Item active được highlight.
 * Responsive: ẩn trên mobile (có thể toggle bằng hamburger menu sau này).
 */
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navItems } from '@/lib/constants'

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-zinc-900 text-white">
      {/* Logo area */}
      <div className="flex items-center gap-2 h-16 px-6 border-b border-zinc-700">
        <span className="text-2xl">🏪</span>
        <span className="text-lg font-bold tracking-tight">Bizflow</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-colors duration-150
                ${isActive
                  ? 'bg-purple-600 text-white'
                  : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                }
              `}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-zinc-700 text-xs text-zinc-500">
        Bizflow v0.1.0
      </div>
    </aside>
  )
}
