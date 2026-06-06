/**
 * Proxy API: /api/storage/[[...path]] — Forward storage requests to Spring Boot.
 *
 * Không handle upload (multipart/form-data) — upload dùng route riêng.
 * Factory: createProxyRoute('storage') → chỉ expose GET + DELETE.
 */
import { createProxyRoute } from '@/lib/api/create-proxy-route'

export const { GET, DELETE } = createProxyRoute('storage', {
  enableRefresh: true,
  methods: ['GET', 'DELETE'],
})
