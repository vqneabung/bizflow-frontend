/**
 * proxy-request.ts — Shared proxy utility cho mọi Next.js API route handler.
 *
 * Dùng `got` (server-side HTTP client) thay vì `undici` vì:
 * - Connection pooling mặc định (got dùng http.Agent keep-alive)
 * - extend() tạo instance riêng cho Spring API vs OAuth endpoint
 * - prefixUrl + searchParams tự động join
 * - responseType: 'json' tự parse body
 * - throwHttpErrors: false → server tự xử lý status code
 *
 * Hỗ trợ:
 * 1. Forward request → Spring Boot với Bearer token từ httpOnly cookie
 * 2. Auto-refresh token (optional) — gọi /oauth2/token → retry request
 * 3. Set-Cookie access_token + refresh_token mới nếu refresh thành công
 * 4. Body parsing (POST/PUT/PATCH) — chỉ read 1 lần
 * 5. Search params forwarding
 * 6. Error handling (502 network error)
 */
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { springApi, oauthApi } from './server'
import {
  CLIENT_ID,
  CLIENT_SECRET,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
} from '@/lib/oauth'

// ── Refresh token ──────────────────────────────────────────
async function refreshAccessToken(
  refreshToken: string,
): Promise<{ access: string; refresh?: string } | null> {
  try {
    const res = await oauthApi.post('oauth2/token', {
      form: {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      },
    })

    if (res.statusCode !== 200) {
      console.error(`[refreshToken] HTTP ${res.statusCode}`)
      return null
    }

    const tokens = res.body as unknown as Record<string, string>
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
async function doForward(
  request: NextRequest,
  apiPath: string,
  body: unknown | undefined,
  accessTokenOverride?: string,
) {
  const cookieStore = await cookies()
  const token = accessTokenOverride ?? cookieStore.get('session_token')?.value

  const headers: Record<string, string> = {
    'Content-Type': request.headers.get('content-type') ?? 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return springApi(apiPath, {
    method: request.method as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    headers,
    searchParams: request.nextUrl.searchParams,
    json: body != null ? (body as Record<string, unknown>) : undefined,
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
    if (springRes.statusCode === 401 && options?.enableRefresh) {
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

      // Retry với token mới
      springRes = await doForward(request, apiPath, body, refreshed.access)

      const response = NextResponse.json(springRes.body, { status: springRes.statusCode })
      setAuthCookies(response, refreshed.access, refreshed.refresh)
      return response
    }

    // ── Bước 4: Trả kết quả ──
    return NextResponse.json(springRes.body, { status: springRes.statusCode })
  } catch (error) {
    console.error(`[proxyRequest] ${request.method} /api/${apiPath}`, error)
    return NextResponse.json(
      { success: false, message: 'Cannot connect to server' },
      { status: 502 },
    )
  }
}