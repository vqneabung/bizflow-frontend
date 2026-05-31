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
import ky, { HTTPError } from 'ky'
import { api } from './client'
import type { UserInfo, ApiResponse } from './types'

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
 * Đăng xuất — xóa httpOnly cookie session_token.
 *
 * Flow:
 * 1. Gọi DELETE /api/auth/register → server xóa cookie
 * 2. Redirect về /login → OIDC flow (Spring Boot login page)
 */
export async function logout(): Promise<void> {
  await api.delete('auth/register')
  // Reload trang → proxy.ts kiểm tra cookie → không có → redirect /login
  window.location.href = '/login'
}
