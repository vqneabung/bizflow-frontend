/**
 * routing.ts — Định nghĩa locales cho next-intl.
 *
 * always mode: URL luôn có locale prefix (/vi/dashboard, /en/dashboard)
 * Vietnamese (vi) là mặc định — khớp với đối tượng người dùng chính.
 */
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['vi', 'en'],
  defaultLocale: 'vi',
  localePrefix: {
    mode: 'always',
  },
})

export type Locale = (typeof routing.locales)[number]
