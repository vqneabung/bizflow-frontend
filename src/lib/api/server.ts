/**
 * server.ts — Got HTTP client instances cho server-side API calls.
 *
 * Dùng `got` thay vì `ky` + `undici` vì:
 * - Connection pooling via http/https Agent (mặc định của got)
 * - extend() tạo instance riêng cho Spring API vs OAuth token endpoint
 * - prefixUrl tự động join path
 * - Built-in JSON parsing, form data, search params
 * - Hooks system (beforeRequest, afterResponse)
 * - Timeout & retry config sẵn
 *
 * Browser-side vẫn dùng ky (client.ts) — got không chạy browser.
 */
import got, { type ExtendOptions } from 'got'
import { API_BASE, AUTH_ISSUER } from '@/lib/oauth'

const baseOptions: ExtendOptions = {
  timeout: { request: 10000 },
  retry: { limit: 0 },
  responseType: 'json',
  throwHttpErrors: false,
}

/**
 * Spring Boot API client — dùng prefixUrl để gọi relative path.
 * VD: springApi('products/123') → GET http://localhost:8080/api/products/123
 */
export const springApi = got.extend({
  ...baseOptions,
  prefixUrl: `${API_BASE}/api`,
})

/**
 * OAuth2 token endpoint client — dùng cho refresh token.
 * Dùng form URL-encoded body (application/x-www-form-urlencoded).
 */
export const oauthApi = got.extend({
  ...baseOptions,
  prefixUrl: AUTH_ISSUER,
})