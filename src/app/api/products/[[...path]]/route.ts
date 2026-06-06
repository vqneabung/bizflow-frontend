/**
 * Proxy API: /api/products/[[...path]] — Forward product requests to Spring Boot.
 *
 * [[...path]] = optional catch-all:
 *   - /api/products?page=1&size=20        → path = undefined  (list)
 *   - /api/products/123                   → path = ['123']     (detail)
 *   - /api/products/123/deactivate        → path = ['123', 'deactivate']
 *
 * Factory: createProxyRoute('products') → 1 dòng, tự động generate handlers.
 */
import { createProxyRoute } from '@/lib/api/create-proxy-route'

export const { GET, POST, PUT, PATCH, DELETE } = createProxyRoute('products', {
  enableRefresh: true,
})
