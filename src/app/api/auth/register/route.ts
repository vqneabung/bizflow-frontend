/**
 * POST /api/auth/register — Proxy register request to Spring Boot.
 *
 * Flow:
 * 1. Receive email, password, name from client
 * 2. Forward to Spring Boot /api/auth/register
 * 3. Get JWT token back
 * 4. Set httpOnly cookie (session_token)
 * 5. Return user info to client
 */
import { NextRequest, NextResponse } from 'next/server'
import { API_BASE, ACCESS_TOKEN_MAX_AGE } from '@/lib/oauth'
import type { ApiResponse } from '@/lib/api/types'

/** POST: register → proxy to Spring Boot → set cookie */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const springRes = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const json: ApiResponse<{ token: string; email: string; role: string; name?: string }> = await springRes.json()

    if (!springRes.ok || !json.data) {
      const status = springRes.status === 409 ? 409 : 400
      return NextResponse.json(
        { message: json.message ?? 'Registration failed' },
        { status }
      )
    }

    const { token, email, role, name } = json.data

    const response = NextResponse.json({
      success: true,
      message: 'Registration successful',
      data: { email, role, name },
    })

    // Set JWT cookie — auto login sau khi register, không cần OIDC flow.
    // TTL = 24h khớp với AuthService.login() và OIDC accessTokenTimeToLive.
    response.cookies.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ACCESS_TOKEN_MAX_AGE,
    })

    return response
  } catch (error) {
    console.error('Register proxy error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}


