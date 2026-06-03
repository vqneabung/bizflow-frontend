/**
 * GET /api/auth/authorize — Tạo PKCE params + redirect đến Spring Boot OIDC.
 *
 * Route Handler (thay vì Server Component) vì:
 * - Chỉ Route Handler / Server Action mới được set cookie trong Next.js 16
 * - Server Component chỉ đọc được cookie, không set được
 *
 * Flow:
 * 1. Tạo code_verifier (32 bytes random, base64url) cho PKCE
 * 2. Tính code_challenge = base64url(sha256(code_verifier))
 * 3. Lưu code_verifier vào httpOnly cookie — callback sẽ đọc sau
 * 4. Build OIDC authorize URL với code_challenge
 * 5. Encode locale vào state param để callback biết redirect về đúng locale
 * 6. Set NEXT_LOCALE cookie cho các error redirect sau
 * 7. Redirect user đến Spring Boot /oauth2/authorize
 *
 * Khi user login thành công, Spring Boot redirect về /api/auth/callback
 * → callback đọc code_verifier từ cookie → exchange code → token → session
 */
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const AUTH_ISSUER = process.env.AUTH_ISSUER ?? 'http://localhost:8080'
const CLIENT_ID = process.env.AUTH_CLIENT_ID ?? 'nextjs-client'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function GET(request: NextRequest) {
  // 1. Tạo PKCE code_verifier (32 bytes random, base64url)
  const codeVerifier = crypto.randomBytes(32).toString('base64url')

  // 2. Tính code_challenge = base64url(sha256(code_verifier))
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url')

  // 3. Detect locale từ ?locale= query param, fallback 'vi'
  //    Format state: <csrf>.<locale> — callback sẽ parse lấy locale
  const localeParam = request.nextUrl.searchParams.get('locale')
  const locale: 'vi' | 'en' = localeParam === 'en' ? 'en' : 'vi'
  const csrf = crypto.randomBytes(16).toString('base64url')
  const state = `${csrf}.${locale}`

  // 4. Build OIDC authorize URL
  const authorizeUrl = new URL(`${AUTH_ISSUER}/oauth2/authorize`)
  authorizeUrl.searchParams.set('response_type', 'code')
  authorizeUrl.searchParams.set('client_id', CLIENT_ID)
  authorizeUrl.searchParams.set('redirect_uri', `${APP_URL}/api/auth/callback/oidc`)
  authorizeUrl.searchParams.set('scope', 'openid email profile')
  authorizeUrl.searchParams.set('code_challenge', codeChallenge)
  authorizeUrl.searchParams.set('code_challenge_method', 'S256')
  authorizeUrl.searchParams.set('state', state)

  // 5. Redirect với cookies — Route Handler được phép set cookie
  //    (khác Server Component chỉ đọc được)
  const response = NextResponse.redirect(authorizeUrl)

  response.cookies.set('code_verifier', codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    // 5 phút — đủ thời gian cho user login qua Spring Boot
    maxAge: 5 * 60,
  })

  // Lưu locale vào cookie non-httpOnly để client-side có thể đọc
  // (dùng cho các flow không đi qua OIDC, ví dụ error page)
  response.cookies.set('NEXT_LOCALE', locale, {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 365 * 24 * 60 * 60, // 1 năm — next-intl tự quản lý locale cookie
  })

  return response
}
