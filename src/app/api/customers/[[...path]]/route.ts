/**
 * Proxy API: /api/customers/[[...path]] — Forward customer requests to Spring Boot.
 *
 * [[...path]] = optional catch-all:
 *   - /api/customers?page=1&size=20        → path = undefined  (list)
 *   - /api/customers/123                   → path = ['123']     (detail)
 *   - /api/customers/123/deactivate        → path = ['123', 'deactivate']
 *
 * Factory: createProxyRoute('customers') → 1 dòng, tự động generate handlers.
 */
import { createProxyRoute } from '@/lib/api/create-proxy-route'

export const { GET, POST, PUT, PATCH, DELETE } = createProxyRoute('customers', {
  enableRefresh: true,
})
