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
 * 5. Redirect user đến Spring Boot /oauth2/authorize
 *
 * Khi user login thành công, Spring Boot redirect về /api/auth/callback
 * → callback đọc code_verifier từ cookie → exchange code → token → session
 */
import { NextResponse } from 'next/server'
import crypto from 'crypto'

const AUTH_ISSUER = process.env.AUTH_ISSUER ?? 'http://localhost:8080'
const CLIENT_ID = process.env.AUTH_CLIENT_ID ?? 'nextjs-client'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function GET() {
  // 1. Tạo PKCE code_verifier (32 bytes random, base64url)
  const codeVerifier = crypto.randomBytes(32).toString('base64url')

  // 2. Tính code_challenge = base64url(sha256(code_verifier))
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url')

  // 3. Build OIDC authorize URL
  const authorizeUrl = new URL(`${AUTH_ISSUER}/oauth2/authorize`)
  authorizeUrl.searchParams.set('response_type', 'code')
  authorizeUrl.searchParams.set('client_id', CLIENT_ID)
  authorizeUrl.searchParams.set('redirect_uri', `${APP_URL}/api/auth/callback/oidc`)
  authorizeUrl.searchParams.set('scope', 'openid email profile')
  authorizeUrl.searchParams.set('code_challenge', codeChallenge)
  authorizeUrl.searchParams.set('code_challenge_method', 'S256')

  // 4. Redirect với cookie — Route Handler được phép set cookie
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

  return response
}
