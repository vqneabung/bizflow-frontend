import { headers } from 'next/headers'
import Link from 'next/link'
import viMessages from '@/messages/vi.json'
import enMessages from '@/messages/en.json'

/**
 * Root-level not-found — render khi URL không match route nào.
 *
 * html/body đã được cung cấp bởi app/layout.tsx (root layout).
 * File này chỉ return content bên trong <body>.
 *
 * i18n: detect locale từ Accept-Language header (root không có next-intl context
 * một cách tự nhiên — providers đã move lên root nhưng locale vẫn cần detect
 * thủ công vì không có getTranslations() từ request scope ở đây).
 */
export default async function RootNotFound() {
  const acceptLanguage = (await headers()).get('accept-language') || 'vi'
  const locale = acceptLanguage.toLowerCase().startsWith('en') ? 'en' : 'vi'
  const t = (locale === 'en' ? enMessages : viMessages).notFound

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-7xl font-bold text-zinc-900">404</h1>
        <h2 className="text-2xl font-semibold text-zinc-800 mt-4">{t.title}</h2>
        <p className="text-base text-zinc-600 mt-2">{t.message}</p>
        <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium"
          >
            {t.backToHome}
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-6 py-3 border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50 transition-colors font-medium"
          >
            {t.backToDashboard}
          </Link>
        </div>
      </div>
    </div>
  )
}
