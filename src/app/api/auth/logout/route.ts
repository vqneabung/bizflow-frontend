/**
 * POST /api/auth/logout — Xóa session ở cả Next.js lẫn Spring Boot.
 *
 * Flow:
 * 1. Client gọi POST /api/auth/logout (kèm tất cả cookies)
 * 2. Server-side: forward request sang Spring Boot /api/auth/session/invalidate
 *    kèm Cookie: JSESSIONID=... để hủy Spring Security session
 * 3. Clear cookies phía Next.js: session_token, refresh_token
 * 4. Trả về JSON { success: true, redirect: '/<locale>/login?logout=true' }
 *
 * Lý do dùng POST: logout có side effect, không nên allow browser prefetch.
 */
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { API_BASE } from '@/lib/oauth'

export async function POST(request: NextRequest) {
  // 1) Build Cookie header từ request của browser để forward sang Spring
  const cookieStore = await cookies()
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ')

  // 2) Gọi Spring Boot để invalidate session
  //    Endpoint /api/auth/session/invalidate thuộc /api/auth/** → permitAll()
  //    Server-to-server: không cần JWT, chỉ cần JSESSIONID
  try {
    if (cookieHeader) {
      await fetch(`${API_BASE}/api/auth/session/invalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookieHeader,
        },
      })
    }
  } catch (err) {
    // Log nhưng KHÔNG fail logout — dù Spring Boot không phản hồi,
    // vẫn phải clear cookies phía Next.js
    console.error('[logout] Failed to invalidate Spring session:', err)
  }

  // 3) Detect locale từ referer hoặc path, fallback 'vi'
  const referer = request.headers.get('referer')
  let locale = 'vi'
  if (referer) {
    try {
      const refUrl = new URL(referer)
      const pathLocale = refUrl.pathname.split('/')[1]
      if (pathLocale === 'vi' || pathLocale === 'en') {
        locale = pathLocale
      }
    } catch {
      // Invalid URL — ignore
    }
  }

  // 4) Clear cookies + return redirect target
  const response = NextResponse.json({
    success: true,
    message: 'Logged out',
    redirect: `/${locale}/login?logout=true`,
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
