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
 * Dùng Ky thay vì fetch raw vì:
 * - TypeScript native — generics cho response type
 * - Error handling tự động (throw cho non-2xx)
 * - Nhẹ (~10KB), tree-shakeable, ESM
 * - Không cần JSON.stringify / res.json() thủ công
 */
import ky from 'ky'

/**
 * Ky instance dùng chung cho tất cả API calls.
 * prefixUrl: '/api' → viết ky.post('auth/register') thay vì ky.post('/api/auth/register')
 * timeout: 10 giây — nếu quá lâu, Ky tự động throw TimeoutError
 * retry: tối đa 2 lần cho GET, POST khi gặp lỗi 408 (timeout mạng), 413 (payload quá lớn), 429 (rate limit)
 *
 * Error handling: Ky mặc định throw HTTPError cho non-2xx responses.
 * Caller (auth.ts, user.ts) có thể catch và xử lý theo từng trường hợp.
 */
export const api = ky.create({
  prefix: '/api',
  timeout: 10000,
  retry: {
    limit: 2,
    methods: ['get', 'post'],
    statusCodes: [408, 413, 429],
  },
})
