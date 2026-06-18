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
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/**',
      },
    ],
  },
  // Tell Turbopack that bizflow-frontend is the actual workspace root.
  // Otherwise Next.js detects root's pnpm-lock.yaml and gets confused
  // (especially when Nx is at the monorepo root).
  turbopack: {
    root: __dirname,
  },
}

export default withNextIntl(nextConfig)
