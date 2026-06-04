/**
 * proxy-request.ts — Shared proxy utility cho mọi Next.js API route handler.
 *
 * Mỗi route handler chỉ cần 3-7 dòng thay vì 50-177 dòng:
 *   export const GET = (req, ctx) => handler(req, ctx, 'products')
 *
 * Hỗ trợ:
 * 1. Forward request → Spring Boot với Bearer token từ httpOnly cookie
 * 2. Auto-refresh token (optional) — gọi /oauth2/token → retry request
 * 3. Set-Cookie access_token + refresh_token mới nếu refresh thành công
 * 4. Body parsing (POST/PUT/PATCH) — chỉ read 1 lần (fix bug mất body khi retry)
 * 5. Search params forwarding
 * 6. Error handling (502 network error)
 *
 * Dùng chung constants từ lib/oauth.ts (API_BASE, AUTH_ISSUER, CLIENT_ID, …)
 * — single source of truth, không duplicate config.
 */
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  API_BASE,
  AUTH_ISSUER,
  CLIENT_ID,
  CLIENT_SECRET,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
} from '@/lib/oauth'

// ── Refresh token ──────────────────────────────────────────
/**
 * Gọi Spring Boot /oauth2/token với grant_type=refresh_token.
 * Trả về cặp token mới, hoặc null nếu thất bại.
 */
async function refreshAccessToken(
  refreshToken: string,
): Promise<{ access: string; refresh?: string } | null> {
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
      console.error(`[refreshToken] HTTP ${res.status}`)
      return null
    }
    const tokens = await res.json()
    if (!tokens.access_token) return null
    return {
      access: tokens.access_token,
      refresh: tokens.refresh_token,
    }
  } catch (err) {
    console.error('[refreshToken] Error:', err)
    return null
  }
}

// ── Forward 1 request ──────────────────────────────────────
/**
 * Gửi 1 request tới Spring Boot với token (từ cookie hoặc override).
 * @param body Được parse 1 lần duy nhất bên ngoài — tránh read lại request.json().
 */
async function doForward(
  request: NextRequest,
  apiPath: string,
  body: unknown | undefined,
  accessTokenOverride?: string,
): Promise<Response> {
  const cookieStore = await cookies()
  const token = accessTokenOverride ?? cookieStore.get('session_token')?.value

  const qs = request.nextUrl.searchParams.toString()
  const url = `${API_BASE}/api/${apiPath}${qs ? '?' + qs : ''}`

  const headers: Record<string, string> = {
    'Content-Type': request.headers.get('content-type') ?? 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return fetch(url, {
    method: request.method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  })
}

// ── Cookie options ─────────────────────────────────────────
const secureCookie = process.env.NODE_ENV === 'production'

function setAuthCookies(
  response: NextResponse,
  access: string,
  refresh?: string,
): void {
  response.cookies.set('session_token', access, {
    httpOnly: true,
    secure: secureCookie,
    sameSite: 'lax',
    path: '/',
    maxAge: ACCESS_TOKEN_MAX_AGE,
  })
  if (refresh) {
    response.cookies.set('refresh_token', refresh, {
      httpOnly: true,
      secure: secureCookie,
      sameSite: 'lax',
      path: '/',
      maxAge: REFRESH_TOKEN_MAX_AGE,
    })
  }
}

// ── Main export ────────────────────────────────────────────
/**
 * Forward request đến Spring Boot với auto-refresh (optional).
 *
 * @param request    NextRequest từ client
 * @param apiPath    Path sau /api/ để forward (VD: 'products', 'auth/me', 'products/123/deactivate')
 * @param options    { enableRefresh?: boolean }
 */
export async function proxyRequest(
  request: NextRequest,
  apiPath: string,
  options?: { enableRefresh?: boolean },
): Promise<NextResponse> {
  try {
    // ── Bước 1: Đọc body 1 lần (dùng lại cho retry nếu có refresh) ──
    const hasBody = request.method !== 'GET' && request.method !== 'HEAD'
    const body = hasBody ? await request.json().catch(() => undefined) : undefined

    // ── Bước 2: Forward lần đầu ──
    let springRes = await doForward(request, apiPath, body)

    // ── Bước 3: Auto-refresh nếu 401 + enableRefresh ──
    if (springRes.status === 401 && options?.enableRefresh) {
      const cookieStore = await cookies()
      const rt = cookieStore.get('refresh_token')?.value

      if (!rt) {
        console.error(`[proxyRequest] ${request.method} /api/${apiPath} → 401, no refresh_token`)
        return NextResponse.json(
          { success: false, message: 'Session expired' },
          { status: 401 },
        )
      }

      const refreshed = await refreshAccessToken(rt)
      if (!refreshed?.access) {
        console.error(`[proxyRequest] ${request.method} /api/${apiPath} → refresh failed`)
        return NextResponse.json(
          { success: false, message: 'Session expired, please login again' },
          { status: 401 },
        )
      }

      // Retry request gốc với access_token mới (body được reuse — không đọc lại)
      springRes = await doForward(request, apiPath, body, refreshed.access)

      const json = await springRes.json().catch(() => null)
      const response = NextResponse.json(json, { status: springRes.status })

      // Set cookie mới cho client (lần request sau sẽ dùng token mới)
      setAuthCookies(response, refreshed.access, refreshed.refresh)
      return response
    }

    // ── Bước 4: Trả kết quả ──
    const json = await springRes.json().catch(() => null)
    return NextResponse.json(json, { status: springRes.status })
  } catch (error) {
    console.error(`[proxyRequest] ${request.method} /api/${apiPath}`, error)
    return NextResponse.json(
      { success: false, message: 'Cannot connect to server' },
      { status: 502 },
    )
  }
}
