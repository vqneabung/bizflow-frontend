/**
 * types.ts — Tất cả interfaces/types liên quan đến API.
 *
 * Tách riêng khỏi logic (auth.ts, client.ts) để dễ maintain.
 * Mỗi interface chỉ chứa data contract, không có methods.
 */

/** Thông tin user trả về sau khi login/register + /api/auth/me */
export interface UserInfo {
  id: string
  email: string
  name: string | null
  role: string
  joinedAt: string
}

/** Response chuẩn từ tất cả API endpoints */
export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
}

/** Request body cho register */
export interface RegisterRequest {
  email: string
  password: string
  name?: string
}
