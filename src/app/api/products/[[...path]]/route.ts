/**
 * Proxy API: /api/products/[[...path]] — Forward all product requests to Spring Boot.
 *
 * [[...path]] = optional catch-all (0 hoặc nhiều segments):
 *   - /api/products?page=1&size=20        → path = undefined  (list)
 *   - /api/products/123                   → path = ['123']     (detail)
 *   - /api/products/123/deactivate        → path = ['123', 'deactivate']
 *
 * Flow:
 * 1. Client gửi request đến /api/products/... (có kèm cookie session_token + refresh_token)
 * 2. Route Handler đọc session_token từ cookie
 * 3. Forward request đến Spring Boot API với Bearer token
 * 4. Nếu Spring trả 401 (token expired) → tự động refresh bằng refresh_token
 *    → retry request gốc với access_token mới + Set-Cookie để client lưu
 * 5. Nếu refresh fail → trả 401 cho client (client sẽ redirect login)
 *
 * Hỗ trợ: GET, POST, PUT, PATCH, DELETE
 */
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:8080'
const AUTH_ISSUER = process.env.AUTH_ISSUER ?? 'http://localhost:8080'
const CLIENT_ID = process.env.AUTH_CLIENT_ID ?? 'nextjs-client'
const CLIENT_SECRET = process.env.AUTH_CLIENT_SECRET ?? 'nextjs-secret'

const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60  // 30d
const ACCESS_TOKEN_MAX_AGE = 24 * 60 * 60        // 24h

interface RefreshResult {
  ok: boolean
  accessToken?: string
  refreshToken?: string
}

/**
 * Gọi Spring Boot OAuth2 token endpoint với grant_type=refresh_token.
 * Trả về cặp token mới (access + refresh). Không throw — caller check `.ok`.
 */
async function refreshAccessToken(refreshToken: string): Promise<RefreshResult> {
  try {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    })
    const res = await fetch(`${AUTH_ISSUER}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    })
    if (!res.ok) {
      console.error(`Refresh token failed: HTTP ${res.status}`)
      return { ok: false }
    }
    const tokens = await res.json()
    if (!tokens.access_token) {
      return { ok: false }
    }
    return {
      ok: true,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token, // optional — nếu reuse=true thì không trả về
    }
  } catch (err) {
    console.error('Refresh token error:', err)
    return { ok: false }
  }
}

/**
 * Forward request đến Spring Boot với auto-refresh logic.
 *
 * @param request  NextRequest từ client
 * @param ctx       { params } chứa path segments
 * @param accessTokenOverride  Token mới sau refresh (dùng cho retry)
 */
async function forward(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> },
  accessTokenOverride?: string,
): Promise<NextResponse> {
  const { path } = await params

  // Build target URL
  const pathname = path ? path.join('/') : ''
  const searchParams = request.nextUrl.searchParams.toString()
  const url = `${API_BASE}/api/products${pathname ? '/' + pathname : ''}${searchParams ? '?' + searchParams : ''}`

  // Đọc JWT từ httpOnly cookie (hoặc dùng token override nếu đã refresh)
  const cookieStore = await cookies()
  const sessionToken = accessTokenOverride ?? cookieStore.get('session_token')?.value

  const headers: Record<string, string> = {
    'Content-Type': request.headers.get('content-type') ?? 'application/json',
  }
  if (sessionToken) {
    headers['Authorization'] = `Bearer ${sessionToken}`
  }

  const body =
    request.method !== 'GET' && request.method !== 'HEAD'
      ? await request.json().catch(() => undefined)
      : undefined

  try {
    const springRes = await fetch(url, {
      method: request.method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    // Auto-refresh: nếu Spring trả 401 do token expired → thử refresh
    // (chỉ thử 1 lần, tránh infinite loop)
    if (springRes.status === 401 && !accessTokenOverride) {
      const refreshToken = cookieStore.get('refresh_token')?.value
      if (!refreshToken) {
        // Không có refresh_token → trả 401 cho client
        return NextResponse.json(
          { success: false, message: 'Session expired' },
          { status: 401 }
        )
      }

      const refreshed = await refreshAccessToken(refreshToken)
      if (!refreshed.ok || !refreshed.accessToken) {
        // Refresh fail → trả 401 (refresh_token expired hoặc revoked)
        return NextResponse.json(
          { success: false, message: 'Session expired, please login again' },
          { status: 401 }
        )
      }

      // Refresh thành công → retry request gốc với token mới + Set-Cookie
      const retried = await forward(
        request,
        { params },
        refreshed.accessToken,
      )

      // Set-Cookie trên response của retry
      retried.cookies.set('session_token', refreshed.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: ACCESS_TOKEN_MAX_AGE,
      })
      if (refreshed.refreshToken) {
        retried.cookies.set('refresh_token', refreshed.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: REFRESH_TOKEN_MAX_AGE,
        })
      }
      return retried
    }

    const json = await springRes.json().catch(() => null)
    return NextResponse.json(json, { status: springRes.status })
  } catch (error) {
    console.error(`Proxy error: ${request.method} ${url}`, error)
    return NextResponse.json(
      { success: false, message: 'Cannot connect to server' },
      { status: 502 },
    )
  }
}

export const GET = forward
export const POST = forward
export const PUT = forward
export const PATCH = forward
export const DELETE = forward
