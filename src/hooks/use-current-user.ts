/**
 * use-current-user.ts — Lấy user hiện tại từ JWT session_token.
 *
 * BFF pattern: server component → Next.js /api/auth/me (route handler) → Spring Boot.
 *
 * Flow:
 * 1. Server component gọi getCurrentUser()
 * 2. Đọc session_token từ httpOnly cookie
 * 3. Forward qua Cookie header → Next.js /api/auth/me (BFF)
 * 4. Route handler đọc cookie → forward sang Spring Boot với Bearer token
 *
 * Tại sao phải forward Cookie header?
 * - Internal fetch (server → server) không tự động inherit cookie của browser
 * - self-fetch tới /api/auth/me không có context của request gốc
 * - Phải đọc cookie từ next/headers + truyền thủ công
 */
'use server'

import { cookies } from 'next/headers'
import { serverApi } from '@/lib/api/server-client'
import type { UserInfo, ApiResponse } from '@/lib/api/types'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

/**
 * Server-side: Lấy user hiện tại qua BFF pattern.
 * Trả về null nếu chưa đăng nhập, token hết hạn, hoặc lỗi.
 */
export async function getCurrentUser(): Promise<UserInfo | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session_token')
    if (!token?.value) return null

    // Forward cookie header vì self-fetch không inherit request cookies
    // Dùng absolute URL vì ky trên Node.js cần absolute URL để fetch
    const res = await serverApi.get(`${APP_URL}/api/auth/me`, {
      headers: { Cookie: `session_token=${token.value}` },
    }).json<ApiResponse<UserInfo>>()

    return res.success ? (res.data ?? null) : null
  } catch (err) {
    console.error('[getCurrentUser] Failed:', err)
    return null
  }
}
