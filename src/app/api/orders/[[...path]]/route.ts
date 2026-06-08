import { createProxyRoute } from '@/lib/api/create-proxy-route'

export const { GET, POST, PATCH, PUT, DELETE } = createProxyRoute('orders')
