/**
 * [locale]/layout.tsx — Root layout cho tất cả locale pages.
 *
 * Chứa: HTML structure, fonts, metadata, NextIntlClientProvider.
 * Đây là layout thực tế cho mọi trang — root layout (app/layout.tsx) chỉ là wrapper.
 *
 * next-intl inject locale vào params → dùng để set html lang attribute.
 */
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { Geist, Geist_Mono } from 'next/font/google'
import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import '../globals.css'

// Progress bar — dynamic import vì là client component
// Hiển thị trong lúc chuyển trang (giảm user click nhiều lần)
const TopLoader = dynamic(() => import('@/components/TopLoader'))

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'common' })

  return {
    title: t('siteName'),
    description: t('siteDescription'),
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  const messages = await getMessages()

  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-white antialiased">
        <TopLoader />
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
