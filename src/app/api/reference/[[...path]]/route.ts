/**
 * Proxy API: /api/reference/[[...path]] — Forward reference data requests to Spring Boot.
 *
 * Handles:
 *   - GET/POST /api/reference/units
 *   - GET/POST /api/reference/categories
 *   - POST /api/reference/units/find-or-create
 *   - POST /api/reference/categories/find-or-create
 *
 * Factory: createProxyRoute('reference') → chỉ expose GET + POST.
 */
import { createProxyRoute } from '@/lib/api/create-proxy-route'

export const { GET, POST } = createProxyRoute('reference', {
  enableRefresh: true,
  methods: ['GET', 'POST'],
})
