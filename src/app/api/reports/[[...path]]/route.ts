/**
 * Proxy API: /api/reports/[[...path]] — Forward report requests to Spring Boot.
 */
import { createProxyRoute } from '@/lib/api/create-proxy-route'

export const { GET } = createProxyRoute('reports', {
  enableRefresh: true,
  methods: ['GET'],
})
