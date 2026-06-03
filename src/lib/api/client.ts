/**
 * client.ts — Ky HTTP client instance cho API calls.
 *
 * Tất cả request API đều đi qua instance này để:
 * - prefix '/api' → gọi '/api/auth/register' thành ky.post('auth/register')
 * - Tự động parse JSON response
 * - Retry khi request thất bại (tối đa 2 lần cho GET/POST)
 * - Timeout 10 giây (tránh treo request)
 * - Throw error cho non-2xx response (hành vi mặc định của Ky)
 *
 * Error handling: Ky mặc định throw HTTPError cho non-2xx responses.
 * Ngoài ra, hook afterResponse tự động redirect /vi/login khi gặp 401
 * để tránh user mắc kẹt với JWT hết hạn.
 *
 * Dùng Ky thay vì fetch raw vì:
 * - TypeScript native — generics cho response type
 * - Error handling tự động (throw cho non-2xx)
 * - Hooks system (afterResponse, beforeRequest)
 * - Nhẹ (~10KB), tree-shakeable, ESM
 * - Không cần JSON.stringify / res.json() thủ công
 */
import ky from 'ky'

/**
 * Ky instance dùng chung cho tất cả API calls.
 *
 * prefixUrl: '/api' → viết ky.post('auth/register') thay vì ky.post('/api/auth/register')
 * timeout: 10 giây — nếu quá lâu, Ky tự động throw TimeoutError
 * retry: tối đa 2 lần cho GET, POST khi gặp lỗi 408 (timeout mạng), 413 (payload quá lớn), 429 (rate limit)
 *
 * afterResponse hook: nếu server trả về 401 (JWT expired/invalid),
 * redirect người dùng về trang login để lấy token mới qua OIDC flow.
 * Hook này chỉ chạy client-side (typeof window !== 'undefined') để tránh
 * redirect lỗi trong SSR/RSC context.
 */
export const api = ky.create({
  prefix: '/api',
  timeout: 10000,
  retry: {
    limit: 2,
    methods: ['get', 'post'],
    statusCodes: [408, 413, 429],
  },
  hooks: {
    afterResponse: [
      async (state) => {
        // 401 Unauthorized — JWT expired, invalid, hoặc chưa login
        // Redirect về login để user re-authenticate qua OIDC
        // Chỉ chạy client-side, tránh lỗi trong SSR
        if (state.response.status === 401 && typeof window !== 'undefined') {
          // Lưu URL hiện tại để sau login redirect về lại
          const returnUrl = window.location.pathname + window.location.search
          const locale = window.location.pathname.split('/')[1] ?? 'vi'
          window.location.href = `/${locale}/login?redirect=${encodeURIComponent(returnUrl)}`
        }
        return state.response
      },
    ],
  },
})
