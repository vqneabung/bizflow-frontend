/**
 * GET /api/auth/me — BFF proxy: Next.js → Spring Boot.
 *
 * Flow:
 * 1. proxyRequest() đọc session_token từ httpOnly cookie
 * 2. Forward sang Spring Boot /api/auth/me với Authorization Bearer
 * 3. Trả về UserInfo (id, email, name, role, joinedAt)
 *
 * Shared logic: src/lib/api/proxy-request.ts
 * Browser không bao giờ thấy Spring Boot URL — BFF pattern bảo mật.
 */
import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/api/proxy-request'

export async function GET(request: NextRequest) {
  return proxyRequest(request, 'auth/me')
}
