/**
 * server-client.ts — Ky instance cho server-side / server component.
 *
 * Dùng trong use-current-user.ts và các server context khác.
 *
 * Khác client.ts (browser):
 * - Không dùng prefix — vì server-side cần absolute URL khi fetch
 * - Không có hook afterResponse (401 redirect — không có window.location trong server)
 * - retry: 0 (server tự xử lý retry thủ công nếu cần)
 */
import ky from 'ky'

export const serverApi = ky.create({
  retry: 0,
  timeout: 10000,
})
