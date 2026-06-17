/**
 * Root layout — HTML structure + providers cho TOÀN BỘ app.
 *
 * Trước đây file này return bare {children} và [locale]/layout.tsx chứa
 * html/body/fonts/providers. Cách đó làm app/not-found.tsx (root) bị lỗi
 * "Missing <html> and <body> tags" vì không có layout nào cung cấp html.
 *
 * Cấu trúc mới:
 * - app/layout.tsx (root) ← html/body/fonts/providers ← SOURCE OF TRUTH
 * - app/[locale]/layout.tsx ← pass-through (chỉ generate metadata theo locale)
 * - app/not-found.tsx ← chỉ content, dùng html/body từ root
 *
 * getLocale() + getMessages() hoạt động ở root nhờ next-intl middleware
 * set context toàn cục qua proxy.ts.
 */
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { Geist, Geist_Mono } from 'next/font/google'
import dynamic from 'next/dynamic'
import { QueryProvider } from '@/lib/query/provider'
import './globals.css'

// Progress bar — dynamic import vì là client component
const TopLoader = dynamic(() => import('@/components/TopLoader'))

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-white antialiased">
        <QueryProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <TopLoader>{children}</TopLoader>
          </NextIntlClientProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
