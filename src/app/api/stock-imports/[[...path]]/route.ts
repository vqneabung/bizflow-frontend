/**
 * Proxy API: /api/stock-imports/[[...path]] — Forward stock-import requests to Spring Boot.
 */
import { createProxyRoute } from '@/lib/api/create-proxy-route'

export const { GET, POST, PUT, PATCH, DELETE } = createProxyRoute('stock-imports', {
  enableRefresh: true,
})
