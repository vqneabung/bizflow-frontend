/**
 * [locale]/layout.tsx — Pass-through layout cho locale-prefixed routes.
 *
 * TRƯỚC: file này chứa html/body/fonts/NextIntlClientProvider/QueryProvider.
 * → Gây lỗi "Missing <html> and <body> tags in the root layout" khi render
 *   app/not-found.tsx (vì root layout không có html/body).
 *
 * SAU: chỉ pass-through + generateMetadata theo locale.
 * Tất cả provider/structure đã được move lên app/layout.tsx (root).
 *
 * Vì sao next-intl hoạt động khi providers ở root?
 * → next-intl middleware (src/proxy.ts) set locale context globally.
 *   getLocale()/getMessages() trong root layout đọc từ context đó.
 */
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

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

export default function LocaleLayout({ children }: Props) {
  return children
}
