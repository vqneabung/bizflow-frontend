/**
 * GET /api/auth/callback/oidc — OIDC callback handler.
 *
 * Nhận authorization code từ Spring Boot Authorization Server,
 * exchange lấy JWT token, set cookie session, redirect đến Spring Boot
 * central redirect endpoint để navigate đúng dashboard theo role.
 *
 * Tại sao redirect qua Spring Boot thay vì tự check role?
 * - Spring Boot có session (JSESSIONID) biết chính xác role của user
 * - Single source of truth: mọi redirect quyết định ở 1 nơi duy nhất
 * - Không cần decode JWT trong Next.js (đơn giản hơn, ít bug hơn)
 */
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { AUTH_ISSUER, CLIENT_ID, CLIENT_SECRET, APP_URL, ACCESS_TOKEN_MAX_AGE, REFRESH_TOKEN_MAX_AGE } from '@/lib/oauth'

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code')
    const errorParam = request.nextUrl.searchParams.get('error')
    const stateParam = request.nextUrl.searchParams.get('state')

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

    // Redirect về Spring Boot /redirect-dashboard — Spring Boot đọc session
    // (JSESSIONID) và quyết định redirect theo role (single source of truth).
    const response = NextResponse.redirect(new URL(`${AUTH_ISSUER}/dispatch`))

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
    const cookieStore = await cookies()
    const locale = cookieStore.get('NEXT_LOCALE')?.value ?? 'vi'
    return NextResponse.redirect(new URL(`/${locale}/login?error=unknown`, request.url))
  }
}

/**
 * Extract locale từ state param.
 */
function detectLocaleFromState(state: string | null): 'vi' | 'en' {
  if (!state) return 'vi'
  const parts = state.split('.')
  const last = parts[parts.length - 1]
  return last === 'en' ? 'en' : 'vi'
}
