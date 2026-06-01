/**
 * GET /api/auth/callback — OIDC callback handler.
 */
import { NextRequest, NextResponse } from 'next/server'

const AUTH_ISSUER = process.env.AUTH_ISSUER ?? 'http://localhost:8080'
const CLIENT_ID = process.env.AUTH_CLIENT_ID ?? 'nextjs-client'
const CLIENT_SECRET = process.env.AUTH_CLIENT_SECRET ?? 'nextjs-secret'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code')
    const errorParam = request.nextUrl.searchParams.get('error')

    if (errorParam) {
      console.error('OIDC error:', errorParam)
      return NextResponse.redirect(new URL('/login?error=auth_failed', request.url))
    }
    if (!code) {
      return NextResponse.redirect(new URL('/login?error=no_code', request.url))
    }

    const codeVerifier = request.cookies.get('code_verifier')?.value
    if (!codeVerifier) {
      return NextResponse.redirect(new URL('/login?error=no_verifier', request.url))
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
      return NextResponse.redirect(new URL('/login?error=token_exchange', request.url))
    }

    const tokens = await tokenRes.json()
    const accessToken = tokens.access_token
    if (!accessToken) {
      return NextResponse.redirect(new URL('/login?error=no_token', request.url))
    }

    const response = NextResponse.redirect(new URL('/dashboard', request.url))

    response.cookies.set('session_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 5 * 60,
    })

    if (tokens.refresh_token) {
      response.cookies.set('refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60,
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
    return NextResponse.redirect(new URL('/login?error=unknown', request.url))
  }
}
