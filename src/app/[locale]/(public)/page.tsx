/**
 * Landing page — Trang chủ Bizflow (có i18n).
 */
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

export default async function LandingPage() {
  const t = await getTranslations('home')
  const c = await getTranslations('common')

  const features = t.raw('features.items') as Array<{ icon: string; title: string; desc: string }>
  const steps = t.raw('steps.items') as Array<{ step: string; title: string; desc: string }>

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-brand-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center max-w-3xl mx-auto space-y-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-900 tracking-tight leading-tight">
              {t('hero.title')}{' '}
              <span className="text-brand-600">{t('hero.highlight')}</span>
            </h1>
            <p className="text-lg sm:text-xl text-zinc-600 leading-relaxed max-w-2xl mx-auto">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center px-8 py-3.5 rounded-xl bg-brand-600 text-white font-semibold text-base hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/25"
              >
                {t('hero.cta')}
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center px-8 py-3.5 rounded-xl border border-zinc-300 text-zinc-700 font-semibold text-base hover:bg-zinc-50 transition-colors"
              >
                {t('hero.learnMore')}
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-400/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-brand-200/10 blur-3xl pointer-events-none" />
      </section>

      {/* Features */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900">{t('features.title')}</h2>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto">{t('features.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-xl border border-zinc-200 p-6 hover:shadow-lg hover:border-brand-200 transition-all duration-200">
                <span className="text-3xl block mb-4">{f.icon}</span>
                <h3 className="text-lg font-semibold text-zinc-900 mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 sm:py-28 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900">{t('steps.title')}</h2>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto">{t('steps.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((s) => (
              <div key={s.step} className="text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-brand-600 text-white text-2xl font-bold flex items-center justify-center mx-auto shadow-lg shadow-brand-600/20">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold text-zinc-900">{s.title}</h3>
                <p className="text-sm text-zinc-600 leading-relaxed max-w-xs mx-auto">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28 bg-gradient-to-r from-brand-600 to-brand-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">{t('cta.title')}</h2>
          <p className="text-lg text-brand-100 max-w-2xl mx-auto">{t('cta.subtitle')}</p>
          <Link
            href="/register"
            className="inline-flex items-center px-10 py-4 rounded-xl bg-white text-brand-700 font-semibold text-lg hover:bg-brand-50 transition-colors shadow-xl"
          >
            {t('cta.button')}
          </Link>
        </div>
      </section>
    </>
  )
}
