/**
 * use-current-user.ts — Lấy user hiện tại từ JWT session_token.
 *
 * Direct call pattern: server component → Spring Boot API trực tiếp.
 *
 * Flow:
 * 1. Server component gọi getCurrentUser()
 * 2. Đọc session_token từ httpOnly cookie
 * 3. Gọi Spring Boot /api/auth/me trực tiếp với Bearer token
 *
 * Không cần BFF self-fetch nữa — got chạy server-side,
 * gọi thẳng Spring Boot thay vì qua Next.js route handler.
 */
'use server'

import { cookies } from 'next/headers'
import { springApi } from '@/lib/api/server'
import type { UserInfo, ApiResponse } from '@/lib/types'

/**
 * Server-side: Lấy user hiện tại trực tiếp từ Spring Boot.
 * Trả về null nếu chưa đăng nhập, token hết hạn, hoặc lỗi.
 */
export async function getCurrentUser(): Promise<UserInfo | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session_token')
    if (!token?.value) return null

    const res = await springApi('auth/me', {
      headers: { Authorization: `Bearer ${token.value}` },
    })

    const data = res.body as unknown as ApiResponse<UserInfo>
    return data.success ? (data.data ?? null) : null
  } catch (err) {
    console.error('[getCurrentUser] Failed:', err)
    return null
  }
}