/**
 * About page — Giới thiệu Bizflow (có i18n).
 */
import { getTranslations } from 'next-intl/server'

export default async function AboutPage() {
  const t = await getTranslations('about')

  const solutions = t.raw('solutions') as Array<{ title: string; desc: string }>

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-16">
      <section className="space-y-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900">{t('title')}</h1>
        <p className="text-lg text-zinc-600 leading-relaxed">{t('mission')}</p>
        <p className="text-lg text-zinc-600 leading-relaxed">{t('challenge')}</p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900">{t('solution')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {solutions.map((item) => (
            <div key={item.title} className="bg-zinc-50 rounded-xl p-6 border border-zinc-200">
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">{item.title}</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900">{t('techStack')}</h2>
        <div className="flex flex-wrap gap-3">
          {['Spring Boot', 'Next.js', 'React', 'Laravel', 'SQL Server', 'Redis', 'Python', 'AI/LLM'].map((tech) => (
            <span key={tech} className="px-4 py-2 bg-brand-50 text-brand-700 rounded-lg text-sm font-medium border border-brand-200">
              {tech}
            </span>
          ))}
        </div>
      </section>
    </div>
  )
}
