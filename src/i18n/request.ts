/**
 * request.ts — Load messages cho locale hiện tại.
 *
 * Dùng switch thay vì dynamic import vì Turbopack không hỗ trợ
 * dynamic import với template literal.
 */
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'
import vi from '../messages/vi.json'
import en from '../messages/en.json'

const messagesMap: Record<string, Record<string, unknown>> = {
  vi: vi as unknown as Record<string, unknown>,
  en: en as unknown as Record<string, unknown>,
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  // Fallback về default nếu locale không hợp lệ
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: messagesMap[locale] ?? messagesMap[routing.defaultLocale],
  }
})
