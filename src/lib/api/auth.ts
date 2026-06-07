/**
 * auth.ts — Functions xác thực (register + logout).
 *
 * Mỗi function là 1 API call:
 * - Dùng Ky instance (từ client.ts) thay fetch raw
 * - Response type qua generic .json<ApiResponse<UserInfo>>()
 * - Error từ Ky (HTTPError, TimeoutError) có thể catch riêng nếu cần
 *
 * Tách biệt hoàn toàn:
 * - Interface/types → types.ts
 * - Ky instance config → client.ts
 * - Logic auth → auth.ts
 */
import { HTTPError } from 'ky'
import { api } from './client'
import type { UserInfo, ApiResponse } from '@/lib/types'

/**
 * Đăng ký tài khoản mới.
 *
 * Flow:
 * 1. Gửi email + password + name lên Next.js API route (/api/auth/register)
 * 2. Next.js proxy → Spring Boot /api/auth/register
 * 3. Spring Boot tạo user + trả JWT
 * 4. Next.js tự động set httpOnly cookie (session_token)
 *
 * @returns UserInfo — email, role, name (dùng để hiển thị dashboard)
 * @throws Error với message từ server nếu thất bại (email đã tồn tại, validation lỗi...)
 */
export async function registerUser(
  email: string,
  password: string,
  name?: string
): Promise<UserInfo> {
  try {
    const json = await api
      .post('auth/register', { json: { email, password, name } })
      .json<ApiResponse<UserInfo>>()

    if (!json.data) {
      throw new Error(json.message)
    }

    return json.data
  } catch (error) {
    // Ky HTTPError — lỗi từ server (non-2xx)
    if (error instanceof HTTPError) {
      const body = await error.response.json().catch(() => ({}))
      const message = (body as Record<string, unknown>).message as string ?? 'Request failed'
      throw new Error(message)
    }
    // Lỗi khác (network error, timeout)
    throw error
  }
}

/**
 * Đăng xuất — xóa session ở cả Next.js lẫn Spring Boot.
 *
 * Flow:
 * 1. Gọi POST /api/auth/logout → Next.js proxy sang Spring Boot
 *    /api/auth/session/invalidate để hủy Spring session (JSESSIONID)
 * 2. Server clear cookies: session_token, refresh_token
 * 3. Redirect về /<locale>/login?logout=true (kèm query param để login
 *    page biết hiển thị "đã đăng xuất" thay vì auto-redirect OIDC)
 *
 * Tại sao cần qua server?
 * - JSESSIONID là cookie của Spring Boot (port 8080), Next.js (port 3000)
 *   không thể xóa cookie của domain khác port bằng cách set maxAge=0
 * - Phải gọi server-side để Spring Boot invalidate session
 */
/**
 * Lấy thông tin người dùng hiện tại từ JWT session_token.
 * Gọi GET /api/auth/me → Spring Boot /api/auth/me
 * Trả về UserInfo (id, email, name, role, joinedAt).
 * Dùng server-side (cookies tự động gửi kèm request).
 */
export async function getMe(): Promise<UserInfo> {
  const res = await api.get('auth/me').json<ApiResponse<UserInfo>>()
  if (!res.data) throw new Error(res.message)
  return res.data
}

export async function logout(): Promise<void> {
  try {
    const res = await api.post('auth/logout').json<ApiResponse<{ redirect: string }>>()
    // Server trả về URL redirect có kèm ?logout=true
    window.location.href = res.data?.redirect ?? '/vi/login?logout=true'
  } catch (error) {
    // Fallback khi logout API fail: vẫn cho user thoát (clear cookies thủ công)
    console.error('Logout API failed, falling back to manual redirect:', error)
    const locale = window.location.pathname.split('/')[1] ?? 'vi'
    window.location.href = `/${locale}/login?logout=true`
  }
}
