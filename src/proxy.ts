/**
 * proxy.ts — Merge next-intl locale detection + auth session check.
 *
 * Next.js 16: middleware.ts → proxy.ts
 * Chạy trước mỗi request để:
 * 1. Phát hiện locale (từ cookie/header/URL) → redirect nếu cần
 * 2. Kiểm tra session cho dashboard routes → redirect /login nếu chưa auth
 *
 * Thứ tự quan trọng: locale detection chạy TRƯỚC auth check
 * để URL luôn có locale prefix (/vi/dashboard thay vì /dashboard).
 */
import createMiddleware from 'next-intl/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { routing } from './i18n/routing'

// next-intl middleware — locale detection + redirect
const intlMiddleware = createMiddleware(routing)

/** Internal paths bỏ qua proxy */
const ignoredPaths = ['/_next/', '/favicon.ico', '/api/']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Bỏ qua internal paths (static files, API routes)
  if (ignoredPaths.some((path) => pathname.startsWith(path))) {
    return
  }

  // Bước 1: next-intl locale detection
  // Nếu URL chưa có locale prefix → thêm vào (ví dụ /vi/dashboard)
  const intlResponse = intlMiddleware(request)
  if (intlResponse) {
    return intlResponse
  }

  // Bước 2: Auth check — dashboard yêu cầu session_token
  const sessionToken = request.cookies.get('session_token')?.value
  const locale = pathname.split('/')[1] // 'vi' hoặc 'en'

  if (pathname.startsWith(`/${locale}/dashboard`) || pathname === `/${locale}/dashboard`) {
    if (!sessionToken) {
      // Redirect đến login page có locale
      const loginUrl = new URL(`/${locale}/login`, request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return
  }

  // Login/Register — nếu đã có session → redirect vào dashboard
  const isLoginPage = pathname === `/${locale}/login` || pathname === `/${locale}/register`
  if (isLoginPage && sessionToken) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url))
  }

  // Public routes — pass through
  return
}

export const config = {
  matcher: [
    // Skip _next static files + API routes
    '/((?!_next/|api/|favicon\\.ico).*)',
  ],
}
