/**
 * POST /api/auth/register — Proxy register request to Spring Boot.
 * DELETE /api/auth/register — Logout (xóa cookie session).
 *
 * Flow register:
 * 1. Receive email, password, name from client
 * 2. Forward to Spring Boot /api/auth/register
 * 3. Get JWT token back
 * 4. Set httpOnly cookie (session_token)
 * 5. Return user info to client
 *
 * Flow logout:
 * 1. Xóa cookie session_token + refresh_token
 * 2. Client redirect về /login → OIDC flow (Spring Boot login page)
 */
import { NextRequest, NextResponse } from 'next/server'

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:8080'

interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
}

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

    // Set JWT cookie — auto login sau khi register, không cần OIDC flow
    response.cookies.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 5 * 60, // 5 phút (khớp accessTokenTimeToLive)
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

/** DELETE: logout — xóa tất cả cookies */
export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logged out' })

  response.cookies.set('session_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  response.cookies.set('refresh_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })

  return response
}
