/**
 * Contact page — Liên hệ Bizflow (có i18n).
 */
import { getTranslations } from 'next-intl/server'

export default async function ContactPage() {
  const t = await getTranslations('contact')

  const contactItems = [
    { icon: '📧', label: t('info.email'), value: t('info.email') },
    { icon: '📞', label: t('info.phone'), value: t('info.phone') },
    { icon: '📍', label: t('info.address'), value: t('info.address') },
    { icon: '🕐', label: t('info.hours'), value: t('info.hoursValue') },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <section className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900">{t('title')}</h1>
            <p className="text-lg text-zinc-600">{t('subtitle')}</p>
          </div>
          <div className="space-y-6">
            {contactItems.map((item) => (
              <div key={item.label} className="flex items-start gap-4">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="text-sm text-zinc-500">{item.label}</p>
                  <p className="text-base font-medium text-zinc-900">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-zinc-50 rounded-xl border border-zinc-200 p-8">
          <h2 className="text-xl font-semibold text-zinc-900 mb-6">{t('formTitle')}</h2>
          <form className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-zinc-700 mb-1.5">{t('form.name')}</label>
              <input id="name" type="text" placeholder="Nguyễn Văn A" className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1.5">{t('form.email')}</label>
              <input id="email" type="email" placeholder="you@example.com" className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500" />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-zinc-700 mb-1.5">{t('form.message')}</label>
              <textarea id="message" rows={4} placeholder="..." className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none" />
            </div>
            <button type="button" className="w-full py-3 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 transition-colors">{t('form.submit')}</button>
            <p className="text-xs text-zinc-400 text-center">{t('form.note')}</p>
          </form>
        </section>
      </div>
    </div>
  )
}
