/**
 * GET /api/auth/callback/oidc — OIDC callback handler.
 *
 * Nhận authorization code từ Spring Boot Authorization Server,
 * exchange lấy JWT token, set cookie session.
 *
 * Locale handling: cookie có thể được truyền qua từ /authorize
 * (state param). Mặc định 'vi' nếu không detect được.
 */
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const AUTH_ISSUER = process.env.AUTH_ISSUER ?? 'http://localhost:8080'
const CLIENT_ID = process.env.AUTH_CLIENT_ID ?? 'nextjs-client'
const CLIENT_SECRET = process.env.AUTH_CLIENT_SECRET ?? 'nextjs-secret'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

// Access token TTL khớp với TokenSettings trong DataInitializer (24h).
// Trước đây là 5 phút → user bị logout ngầm → UX kém.
const ACCESS_TOKEN_MAX_AGE = 24 * 60 * 60  // 24h
const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60  // 30d

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code')
    const errorParam = request.nextUrl.searchParams.get('error')
    const stateParam = request.nextUrl.searchParams.get('state')

    // Detect locale từ state param (được set bởi /authorize) hoặc fallback 'vi'
    const locale = detectLocaleFromState(stateParam)

    if (errorParam) {
      console.error('OIDC error:', errorParam)
      return NextResponse.redirect(new URL(`/${locale}/login?error=${encodeURIComponent(errorParam)}`, request.url))
    }
    if (!code) {
      return NextResponse.redirect(new URL(`/${locale}/login?error=no_code`, request.url))
    }

    const codeVerifier = request.cookies.get('code_verifier')?.value
    if (!codeVerifier) {
      return NextResponse.redirect(new URL(`/${locale}/login?error=no_verifier`, request.url))
    }

    // Exchange code → token
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${APP_URL}/api/auth/callback/oidc`,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code_verifier: codeVerifier,
    })

    const tokenRes = await fetch(`${AUTH_ISSUER}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams,
    })

    if (!tokenRes.ok) {
      return NextResponse.redirect(new URL(`/${locale}/login?error=token_exchange`, request.url))
    }

    const tokens = await tokenRes.json()
    const accessToken = tokens.access_token
    if (!accessToken) {
      return NextResponse.redirect(new URL(`/${locale}/login?error=no_token`, request.url))
    }

    // P2-3: Redirect về /<locale>/dashboard (trước đây là /dashboard — thiếu locale,
    // proxy.ts tự thêm locale nhưng gây 1 redirect thừa)
    const response = NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url))

    response.cookies.set('session_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ACCESS_TOKEN_MAX_AGE,
    })

    if (tokens.refresh_token) {
      response.cookies.set('refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: REFRESH_TOKEN_MAX_AGE,
      })
    }

    response.cookies.set('code_verifier', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })

    return response
  } catch (err) {
    console.error('Callback error:', err)
    // Detect locale từ cookie khi có lỗi
    const cookieStore = await cookies()
    const locale = cookieStore.get('NEXT_LOCALE')?.value ?? 'vi'
    return NextResponse.redirect(new URL(`/${locale}/login?error=unknown`, request.url))
  }
}

/**
 * Extract locale từ state param.
 *
 * /authorize encode locale vào state theo format `<csrf>.<locale>`.
 * Nếu parse fail → fallback 'vi'.
 */
function detectLocaleFromState(state: string | null): 'vi' | 'en' {
  if (!state) return 'vi'
  const parts = state.split('.')
  const last = parts[parts.length - 1]
  return last === 'en' ? 'en' : 'vi'
}
