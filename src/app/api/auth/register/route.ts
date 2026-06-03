/**
 * POST /api/auth/register — Proxy register request to Spring Boot.
 * DELETE /api/auth/register — Logout (xóa cookie session) — DEPRECATED.
 *
 * Logout đã chuyển sang /api/auth/logout (xem route.ts bên cạnh).
 * DELETE handler ở đây giữ lại để tương thích ngược với code cũ.
 *
 * Flow register:
 * 1. Receive email, password, name from client
 * 2. Forward to Spring Boot /api/auth/register
 * 3. Get JWT token back
 * 4. Set httpOnly cookie (session_token)
 * 5. Return user info to client
 */
import { NextRequest, NextResponse } from 'next/server'

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:8080'

interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
}

// Access token TTL khớp với TokenSettings trong DataInitializer (24h).
const ACCESS_TOKEN_MAX_AGE = 24 * 60 * 60  // 24h

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

/**
 * DELETE: logout — DEPRECATED. Use POST /api/auth/logout instead.
 * Giữ lại để tương thích ngược — chỉ clear cookies, không gọi Spring Boot.
 */
export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: 'Cookies cleared (deprecated, use POST /api/auth/logout)',
  })

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
  }
  response.cookies.set('session_token', '', cookieOptions)
  response.cookies.set('refresh_token', '', cookieOptions)

  return response
}
