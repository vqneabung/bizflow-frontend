import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

/**
 * Dashboard segment-level not-found.
 *
 * Trigger khi:
 * - User trong /vi/dashboard/* và visit URL con không match route nào
 *   (vd: /vi/dashboard/foo — vì có file này nên render custom thay vì root not-found)
 * - Page trong dashboard gọi notFound() function (vd: getCustomerById returns 404)
 *
 * Có next-intl context vì nằm trong [locale] segment → dùng được getTranslations.
 */
export default async function DashboardNotFound() {
  const t = await getTranslations('notFound')

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-7xl font-bold text-zinc-900">404</h1>
        <h2 className="text-2xl font-semibold text-zinc-800 mt-4">{t('title')}</h2>
        <p className="text-base text-zinc-600 mt-2">{t('message')}</p>
        <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium"
          >
            {t('backToDashboard')}
          </Link>
          <Link
            href="/dashboard/products"
            className="inline-flex items-center justify-center px-6 py-3 border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50 transition-colors font-medium"
          >
            Sản phẩm
          </Link>
        </div>
      </div>
    </div>
  )
}
