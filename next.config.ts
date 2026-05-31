/**
 * next.config.ts — Cấu hình Next.js.
 *
 * next-intl plugin: tự động xử lý locale routing, messages loading.
 * Cần thiết cho i18n hoạt động đúng với App Router.
 */
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

const nextConfig: NextConfig = {
  reactCompiler: true,
}

export default withNextIntl(nextConfig)
