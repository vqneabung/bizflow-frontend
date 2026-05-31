/**
 * proxy.ts — Bảo vệ routes dashboard, kiểm tra session.
 *
 * Next.js 16: middleware.ts → proxy.ts (renamed)
 *
 * Flow:
 * - /dashboard/* → kiểm tra cookie session_token → nếu không có → redirect /login
 * - /login, /register → nếu có cookie → redirect /dashboard
 * - Các routes khác (/, /about, /contact, _next/*) → pass through
 *
 * Internal paths bỏ qua:
 * - /_next/* — static files của Next.js
 * - /api/auth/* — API routes auth (callback, register)
 * - /favicon.ico — icon
 */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/** Các routes không cần auth — public */
const publicRoutes = ['/', '/about', '/contact', '/login', '/register']

/** Các internal paths bỏ qua proxy (không kiểm tra session) */
const ignoredPaths = ['/_next/', '/favicon.ico', '/api/auth/']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionToken = request.cookies.get('session_token')?.value

  // Bỏ qua internal paths (static files, API auth routes)
  if (ignoredPaths.some((path) => pathname.startsWith(path))) {
    return
  }

  // Dashboard routes — yêu cầu session
  if (pathname.startsWith('/dashboard')) {
    if (!sessionToken) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return
  }

  // Login/Register — nếu đã có session → redirect vào dashboard
  if ((pathname === '/login' || pathname === '/register') && sessionToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Public routes — pass through
  return
}

export const config = {
  matcher: [
    // Skip _next static files
    '/((?!_next/|favicon\\.ico).*)',
  ],
}
