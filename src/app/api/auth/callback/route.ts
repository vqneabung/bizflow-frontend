/**
 * GET /api/auth/callback — OIDC callback handler.
 *
 * Spring Boot Authorization Server redirect về đây sau khi user login thành công:
 *   GET /api/auth/callback?code=AUTHORIZATION_CODE
 *
 * Flow:
 * 1. Đọc authorization_code từ query params
 * 2. Đọc code_verifier từ cookie (PKCE)
 * 3. Exchange code + code_verifier + client_secret → Spring Boot /oauth2/token
 * 4. Nhận access_token, refresh_token, id_token
 * 5. Lưu access_token vào httpOnly cookie (session_token)
 * 6. Redirect user đến /dashboard
 */
import { NextRequest, NextResponse } from 'next/server'

// Các giá trị từ env — phải match với Spring Boot config
const AUTH_ISSUER = process.env.AUTH_ISSUER ?? 'http://localhost:8080'
const CLIENT_ID = process.env.AUTH_CLIENT_ID ?? 'nextjs-client'
const CLIENT_SECRET = process.env.AUTH_CLIENT_SECRET ?? 'nextjs-secret'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function GET(request: NextRequest) {
  try {
    // 1. Lấy authorization_code từ query params
    const code = request.nextUrl.searchParams.get('code')
    const error = request.nextUrl.searchParams.get('error')

    if (error) {
      console.error('OIDC error:', error)
      return NextResponse.redirect(new URL('/login?error=auth_failed', request.url))
    }

    if (!code) {
      return NextResponse.redirect(new URL('/login?error=no_code', request.url))
    }

    // 2. Đọc code_verifier từ cookie (PKCE)
    const codeVerifier = request.cookies.get('code_verifier')?.value
    if (!codeVerifier) {
      return NextResponse.redirect(new URL('/login?error=no_verifier', request.url))
    }

    // 3. Exchange code → token bằng client_secret + code_verifier
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${APP_URL}/api/auth/callback/oidc`,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code_verifier: codeVerifier, // PKCE
    })

    const tokenRes = await fetch(`${AUTH_ISSUER}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams,
    })

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text()
      console.error('Token exchange failed:', tokenRes.status, errorText)
      return NextResponse.redirect(new URL('/login?error=token_exchange', request.url))
    }

    const tokens = await tokenRes.json()
    const accessToken = tokens.access_token

    if (!accessToken) {
      return NextResponse.redirect(new URL('/login?error=no_token', request.url))
    }

    // 4. Set session cookie + xóa code_verifier cookie
    const response = NextResponse.redirect(new URL('/dashboard', request.url))

    // Session token — httpOnly, không thể đọc từ JS
    response.cookies.set('session_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 5 * 60, // 5 phút (khớp accessTokenTimeToLive)
    })

    // Refresh token (nếu có) — lưu riêng, dùng để refresh access_token khi hết hạn
    if (tokens.refresh_token) {
      response.cookies.set('refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60, // 30 ngày (khớp refreshTokenTimeToLive)
      })
    }

    // Xóa code_verifier cookie (không cần nữa)
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
    return NextResponse.redirect(new URL('/login?error=unknown', request.url))
  }
}
