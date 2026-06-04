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
 * 2. proxyRequest() đọc session_token → forward → Spring Boot với Bearer token
 * 3. Nếu Spring trả 401 (token expired) → tự động refresh_token → retry request
 * 4. Set cookie mới nếu refresh thành công
 *
 * Shared logic: src/lib/api/proxy-request.ts
 * Hỗ trợ: GET, POST, PUT, PATCH, DELETE
 */
import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/api/proxy-request'

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await params
  const apiPath = path?.length
    ? `products/${path.join('/')}`
    : 'products'

  return proxyRequest(request, apiPath, { enableRefresh: true })
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
